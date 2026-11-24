<?php
/**
 * Plugin Name: Cheops MCP
 * Description: Lets Claude manage the Cheops Privé dashboard (units, projects, pages, community pages, theme settings, media, cache) through one secret MCP link. Settings → Cheops MCP.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Cheops Privé
 */
if (!defined('ABSPATH')) exit;

const CHEOPS_MCP_VERSION = '1.0.0';
const CHEOPS_MCP_PROTOCOL = '2025-06-18';

/* ---------- Key, user and activity log ---------- */

function cheops_mcp_key() {
    $key = (string) get_option('cheops_mcp_key', '');
    if ($key === '') {
        $key = wp_generate_password(48, false, false);
        update_option('cheops_mcp_key', $key, false);
    }
    return $key;
}
register_activation_hook(__FILE__, static function () {
    cheops_mcp_key();
    if (!get_option('cheops_mcp_user')) update_option('cheops_mcp_user', get_current_user_id(), false);
});

function cheops_mcp_enabled() { return (bool) get_option('cheops_mcp_enabled', 1); }
function cheops_mcp_endpoint() { return rest_url('cheops-mcp/v1/mcp'); }
function cheops_mcp_link() { return add_query_arg('key', cheops_mcp_key(), cheops_mcp_endpoint()); }

function cheops_mcp_log($tool, $ok, $note = '') {
    $log = get_option('cheops_mcp_log', []);
    if (!is_array($log)) $log = [];
    array_unshift($log, ['t' => time(), 'tool' => $tool, 'ok' => $ok ? 1 : 0, 'note' => mb_substr((string) $note, 0, 160)]);
    update_option('cheops_mcp_log', array_slice($log, 0, 60), false);
}

/* ---------- HTTP endpoint (MCP over Streamable HTTP, JSON replies) ---------- */

add_action('rest_api_init', static function () {
    register_rest_route('cheops-mcp/v1', '/mcp', [
        [
            'methods' => 'POST',
            'callback' => 'cheops_mcp_handle',
            'permission_callback' => 'cheops_mcp_allowed',
        ],
        [
            'methods' => ['GET', 'DELETE'],
            'callback' => static function () { return new WP_REST_Response(null, 405); },
            'permission_callback' => '__return_true',
        ],
    ]);
});

function cheops_mcp_allowed(WP_REST_Request $req) {
    if (!cheops_mcp_enabled()) return new WP_Error('cheops_mcp_off', 'Cheops MCP is switched off in Settings → Cheops MCP.', ['status' => 403]);
    $given = (string) $req->get_param('key');
    if ($given === '') {
        $auth = (string) $req->get_header('authorization');
        if (stripos($auth, 'Bearer ') === 0) $given = trim(substr($auth, 7));
    }
    if ($given === '' || !hash_equals(cheops_mcp_key(), $given)) return new WP_Error('cheops_mcp_key', 'Missing or wrong key.', ['status' => 401]);
    $uid = (int) get_option('cheops_mcp_user');
    if (!$uid || !user_can($uid, 'manage_options')) return new WP_Error('cheops_mcp_user', 'Pick an administrator in Settings → Cheops MCP.', ['status' => 403]);
    wp_set_current_user($uid);
    return true;
}

function cheops_mcp_handle(WP_REST_Request $req) {
    $body = json_decode($req->get_body(), true);
    if (!is_array($body)) return new WP_REST_Response(cheops_mcp_error(null, -32700, 'Parse error'), 400);
    if (isset($body[0])) { // batch
        $out = [];
        foreach ($body as $msg) { $r = cheops_mcp_dispatch($msg); if ($r !== null) $out[] = $r; }
        return $out ? new WP_REST_Response($out, 200) : new WP_REST_Response(null, 202);
    }
    $r = cheops_mcp_dispatch($body);
    return $r === null ? new WP_REST_Response(null, 202) : new WP_REST_Response($r, 200);
}

function cheops_mcp_error($id, $code, $message) { return ['jsonrpc' => '2.0', 'id' => $id, 'error' => ['code' => $code, 'message' => $message]]; }
function cheops_mcp_result($id, $result) { return ['jsonrpc' => '2.0', 'id' => $id, 'result' => $result]; }

function cheops_mcp_dispatch($msg) {
    $id = $msg['id'] ?? null;
    $method = (string) ($msg['method'] ?? '');
    $params = is_array($msg['params'] ?? null) ? $msg['params'] : [];
    if (!array_key_exists('id', $msg)) return null; // notification
    switch ($method) {
        case 'initialize':
            return cheops_mcp_result($id, [
                'protocolVersion' => (string) ($params['protocolVersion'] ?? CHEOPS_MCP_PROTOCOL),
                'capabilities' => ['tools' => ['listChanged' => false]],
                'serverInfo' => ['name' => 'cheops-prive', 'title' => 'Cheops Privé dashboard', 'version' => CHEOPS_MCP_VERSION],
                'instructions' => 'The WordPress dashboard of ' . home_url('/') . ' (Cheops Privé, real estate advisory). Read before you change anything. Units are the cheops_unit post type; their details live in _cheops_* meta. Lake Town, The MarQ Gardens and LVLS have shared community settings. Run clear_cache after changes so visitors see them.',
            ]);
        case 'ping':
            return cheops_mcp_result($id, (object) []);
        case 'tools/list':
            $tools = [];
            foreach (cheops_mcp_tools() as $name => $t) {
                $tools[] = ['name' => $name, 'description' => $t['description'], 'inputSchema' => $t['schema'], 'annotations' => $t['annotations'] ?? (object) []];
            }
            return cheops_mcp_result($id, ['tools' => $tools]);
        case 'tools/call':
            $name = (string) ($params['name'] ?? '');
            $args = is_array($params['arguments'] ?? null) ? $params['arguments'] : [];
            $tools = cheops_mcp_tools();
            if (!isset($tools[$name])) return cheops_mcp_error($id, -32602, 'Unknown tool: ' . $name);
            try {
                $out = call_user_func($tools[$name]['run'], $args);
                if (is_wp_error($out)) { cheops_mcp_log($name, false, $out->get_error_message()); return cheops_mcp_result($id, ['content' => [['type' => 'text', 'text' => $out->get_error_message()]], 'isError' => true]); }
                cheops_mcp_log($name, true, isset($args['id']) ? 'id ' . $args['id'] : '');
                return cheops_mcp_result($id, ['content' => [['type' => 'text', 'text' => wp_json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)]], 'structuredContent' => is_array($out) && !isset($out[0]) ? $out : ['items' => $out]]);
            } catch (Throwable $e) {
                cheops_mcp_log($name, false, $e->getMessage());
                return cheops_mcp_result($id, ['content' => [['type' => 'text', 'text' => 'Error: ' . $e->getMessage()]], 'isError' => true]);
            }
        default:
            return cheops_mcp_error($id, -32601, 'Method not found: ' . $method);
    }
}

/* ---------- Helpers ---------- */

function cheops_mcp_obj($props = [], $required = []) {
    $s = ['type' => 'object', 'properties' => (object) $props];
    if ($required) $s['required'] = $required;
    return $s;
}
const CHEOPS_MCP_RO = ['readOnlyHint' => true, 'openWorldHint' => false];
const CHEOPS_MCP_RW = ['readOnlyHint' => false, 'destructiveHint' => false, 'openWorldHint' => false];

function cheops_mcp_meta_of($id, $prefix) {
    $out = [];
    foreach (get_post_meta($id) as $k => $v) {
        if (strpos($k, $prefix) !== 0) continue;
        $out[$k] = maybe_unserialize($v[0] ?? '');
    }
    ksort($out);
    return $out;
}

function cheops_mcp_terms($id, $tax) {
    $t = get_the_terms($id, $tax);
    return ($t && !is_wp_error($t)) ? wp_list_pluck($t, 'name') : [];
}

function cheops_mcp_summary($p) {
    return ['id' => $p->ID, 'title' => $p->post_title, 'status' => $p->post_status, 'link' => get_permalink($p), 'modified' => $p->post_modified];
}

/** Attachment id for a Media Library id or any image URL (copied into the library when it is not there yet). */
function cheops_mcp_attachment($value, $title = '') {
    if (is_numeric($value)) return get_post((int) $value) ? (int) $value : new WP_Error('media', 'No media item ' . $value);
    $url = esc_url_raw((string) $value);
    if (!$url) return new WP_Error('media', 'Give a media id or an image URL.');
    $id = attachment_url_to_postid($url);
    if ($id) return $id;
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $tmp = download_url($url, 60);
    if (is_wp_error($tmp)) return $tmp;
    $name = sanitize_file_name(basename(strtok($url, '?'))) ?: 'image.jpg';
    $id = media_handle_sideload(['name' => $name, 'tmp_name' => $tmp], 0, $title);
    if (is_wp_error($id)) @unlink($tmp);
    return $id;
}

function cheops_mcp_set_terms($id, $args) {
    foreach (['unit_type', 'unit_location', 'unit_developer', 'project_city', 'category', 'post_tag'] as $tax) {
        if (!array_key_exists($tax, $args) || !taxonomy_exists($tax)) continue;
        $names = array_filter(array_map('trim', (array) $args[$tax]));
        $ids = [];
        foreach ($names as $n) {
            $term = term_exists($n, $tax) ?: wp_insert_term($n, $tax);
            if (!is_wp_error($term)) $ids[] = (int) ($term['term_id'] ?? $term);
        }
        wp_set_object_terms($id, $ids, $tax);
    }
}

function cheops_mcp_bump() {
    if (function_exists('cheops_bump_content_version')) cheops_bump_content_version();
}

/** Create or update any post of the allowed types. */
function cheops_mcp_save($type, $args, $meta_prefix) {
    $id = (int) ($args['id'] ?? 0);
    if ($id) {
        $p = get_post($id);
        if (!$p || $p->post_type !== $type) return new WP_Error('save', 'No ' . $type . ' with id ' . $id);
    }
    $data = ['post_type' => $type];
    if ($id) $data['ID'] = $id;
    foreach (['title' => 'post_title', 'content' => 'post_content', 'excerpt' => 'post_excerpt', 'status' => 'post_status', 'slug' => 'post_name', 'menu_order' => 'menu_order'] as $in => $field) {
        if (array_key_exists($in, $args)) $data[$field] = $args[$in];
    }
    if (isset($data['post_status']) && !in_array($data['post_status'], ['publish', 'draft', 'pending', 'private', 'trash'], true)) return new WP_Error('save', 'status must be publish, draft, pending, private or trash');
    if (!$id && empty($data['post_status'])) $data['post_status'] = 'draft';
    $id = $id ? wp_update_post(wp_slash($data), true) : wp_insert_post(wp_slash($data), true);
    if (is_wp_error($id)) return $id;
    foreach ((array) ($args['meta'] ?? []) as $k => $v) {
        $k = (string) $k;
        if ($meta_prefix && strpos($k, $meta_prefix) !== 0) return new WP_Error('save', 'Meta keys must start with ' . $meta_prefix . ': ' . $k);
        if ($v === null) delete_post_meta($id, $k); else update_post_meta($id, $k, wp_slash($v));
    }
    if (array_key_exists('featured_image', $args)) {
        if ($args['featured_image'] === '' || $args['featured_image'] === null) delete_post_thumbnail($id);
        else { $att = cheops_mcp_attachment($args['featured_image'], (string) ($args['title'] ?? '')); if (is_wp_error($att)) return $att; set_post_thumbnail($id, $att); }
    }
    if (array_key_exists('gallery', $args) && $type === 'cheops_unit') {
        $ids = [];
        foreach ((array) $args['gallery'] as $g) { $att = cheops_mcp_attachment($g); if (is_wp_error($att)) return $att; $ids[] = $att; }
        update_post_meta($id, '_cheops_gallery_ids', implode(',', $ids));
    }
    cheops_mcp_set_terms($id, $args);
    cheops_mcp_bump();
    return $id;
}

function cheops_mcp_full($id, $meta_prefix) {
    $p = get_post($id);
    if (!$p) return new WP_Error('get', 'Nothing with id ' . $id);
    $out = cheops_mcp_summary($p) + [
        'type' => $p->post_type,
        'slug' => $p->post_name,
        'content' => $p->post_content,
        'excerpt' => $p->post_excerpt,
        'featured_image' => get_the_post_thumbnail_url($p, 'full') ?: '',
        'meta' => cheops_mcp_meta_of($id, $meta_prefix),
    ];
    foreach (get_object_taxonomies($p->post_type) as $tax) $out[$tax] = cheops_mcp_terms($id, $tax);
    if ($p->post_type === 'cheops_unit') {
        $out['gallery'] = array_values(array_filter(array_map(static function ($g) { return wp_get_attachment_url((int) $g); }, array_filter(explode(',', (string) get_post_meta($id, '_cheops_gallery_ids', true))))));
    }
    return $out;
}

function cheops_mcp_list($type, $args, $extra = null) {
    $q = [
        'post_type' => $type,
        'post_status' => ($args['status'] ?? '') ?: ['publish', 'draft', 'pending', 'private'],
        'posts_per_page' => min(200, max(1, (int) ($args['limit'] ?? 50))),
        'offset' => max(0, (int) ($args['offset'] ?? 0)),
        'orderby' => 'title', 'order' => 'ASC',
    ];
    if (!empty($args['search'])) $q['s'] = (string) $args['search'];
    if ($extra) $q = $extra($q, $args);
    $query = new WP_Query($q);
    $items = array_map(static function ($p) use ($type) {
        $row = cheops_mcp_summary($p);
        if ($type === 'cheops_unit') $row += ['reference' => get_post_meta($p->ID, '_cheops_reference', true), 'project' => get_post_meta($p->ID, '_cheops_project', true), 'listing' => get_post_meta($p->ID, '_cheops_listing_type', true), 'type' => implode(', ', cheops_mcp_terms($p->ID, 'unit_type'))];
        return $row;
    }, $query->posts);
    return ['total' => (int) $query->found_posts, 'items' => $items];
}

const CHEOPS_MCP_COMMUNITIES = ['lake-town' => ['cheops_lake_town', 'cheops_lake_town_settings'], 'marq-gardens' => ['cheops_marq_gardens', 'cheops_mqg_settings'], 'lvls' => ['cheops_lvls', 'cheops_lvls_settings']];

/* ---------- Tools ---------- */

function cheops_mcp_tools() {
    $post_fields = [
        'id' => ['type' => 'integer', 'description' => 'Leave out to create a new one.'],
        'title' => ['type' => 'string'],
        'content' => ['type' => 'string', 'description' => 'HTML body.'],
        'excerpt' => ['type' => 'string'],
        'status' => ['type' => 'string', 'enum' => ['publish', 'draft', 'pending', 'private', 'trash']],
        'slug' => ['type' => 'string'],
        'featured_image' => ['type' => ['string', 'integer'], 'description' => 'Media id or image URL (copied into the Media Library). Empty string removes it.'],
    ];
    $list_args = ['search' => ['type' => 'string'], 'status' => ['type' => 'string'], 'limit' => ['type' => 'integer', 'default' => 50], 'offset' => ['type' => 'integer', 'default' => 0]];

    return [
        'site_overview' => [
            'description' => 'Site name, links, theme build, and counts of units, projects, pages, bookings and subscribers. Start here.',
            'schema' => cheops_mcp_obj(), 'annotations' => CHEOPS_MCP_RO,
            'run' => static function () {
                $count = static function ($t) { $c = wp_count_posts($t); return $c ? array_filter((array) $c) : []; };
                return ['name' => get_bloginfo('name'), 'url' => home_url('/'), 'admin' => admin_url(), 'theme' => wp_get_theme()->get('Name'), 'build' => defined('CHEOPS_BUILD') ? CHEOPS_BUILD : '', 'wordpress' => get_bloginfo('version'),
                    'units' => $count('cheops_unit'), 'projects' => $count('cheops_project'), 'pages' => $count('page'), 'posts' => $count('post'), 'bookings' => $count('cheops_booking'), 'subscribers' => $count('cheops_subscriber'),
                    'communities' => array_keys(CHEOPS_MCP_COMMUNITIES), 'unit_meta_keys_in_use' => cheops_mcp_meta_keys('cheops_unit')];
            },
        ],
        'list_units' => [
            'description' => 'List units (properties) with reference, project, listing and type. Filter by search text or project name.',
            'schema' => cheops_mcp_obj($list_args + ['project' => ['type' => 'string', 'description' => 'Exact project name, e.g. "Lake Town".']]), 'annotations' => CHEOPS_MCP_RO,
            'run' => static function ($a) {
                return cheops_mcp_list('cheops_unit', $a, static function ($q, $a) { if (!empty($a['project'])) { $q['meta_key'] = '_cheops_project'; $q['meta_value'] = (string) $a['project']; } return $q; });
            },
        ],
        'get_unit' => [
            'description' => 'Everything about one unit: title, description, status, all _cheops_* details (reference, area, beds, baths, layout, rooms, floor plan, prices kept hidden on the site), type, location, developer, photos.',
            'schema' => cheops_mcp_obj(['id' => ['type' => 'integer']], ['id']), 'annotations' => CHEOPS_MCP_RO,
            'run' => static function ($a) { return cheops_mcp_full((int) $a['id'], '_cheops_'); },
        ],
        'save_unit' => [
            'description' => 'Create a unit or change one. Send only what changes. meta takes _cheops_* keys (null deletes one), e.g. _cheops_reference, _cheops_project, _cheops_area, _cheops_beds, _cheops_baths, _cheops_layout, _cheops_rooms ("Room | Area" per line), _cheops_floor, _cheops_finishing, _cheops_listing_type (sale/rent). gallery replaces the unit photos.',
            'schema' => cheops_mcp_obj($post_fields + [
                'meta' => ['type' => 'object', 'additionalProperties' => true],
                'gallery' => ['type' => 'array', 'items' => ['type' => ['string', 'integer']], 'description' => 'Media ids or image URLs, in order.'],
                'unit_type' => ['type' => 'array', 'items' => ['type' => 'string']],
                'unit_location' => ['type' => 'array', 'items' => ['type' => 'string']],
                'unit_developer' => ['type' => 'array', 'items' => ['type' => 'string']],
            ]), 'annotations' => CHEOPS_MCP_RW,
            'run' => static function ($a) { $id = cheops_mcp_save('cheops_unit', $a, '_cheops_'); return is_wp_error($id) ? $id : cheops_mcp_full($id, '_cheops_'); },
        ],
        'list_projects' => [
            'description' => 'List projects (compounds) with their city.',
            'schema' => cheops_mcp_obj($list_args), 'annotations' => CHEOPS_MCP_RO,
            'run' => static function ($a) { $r = cheops_mcp_list('cheops_project', $a); foreach ($r['items'] as &$i) $i['city'] = implode(', ', cheops_mcp_terms($i['id'], 'project_city')); return $r; },
        ],
        'get_project' => [
            'description' => 'One project with its description, map position (_cheops_project_lat/_cheops_project_lng) and other _cheops_* details.',
            'schema' => cheops_mcp_obj(['id' => ['type' => 'integer']], ['id']), 'annotations' => CHEOPS_MCP_RO,
            'run' => static function ($a) { return cheops_mcp_full((int) $a['id'], '_cheops_'); },
        ],
        'save_project' => [
            'description' => 'Create or change a project. meta takes _cheops_* keys such as _cheops_project_lat and _cheops_project_lng.',
            'schema' => cheops_mcp_obj($post_fields + ['meta' => ['type' => 'object', 'additionalProperties' => true], 'project_city' => ['type' => 'array', 'items' => ['type' => 'string']]]), 'annotations' => CHEOPS_MCP_RW,
            'run' => static function ($a) { $id = cheops_mcp_save('cheops_project', $a, '_cheops_'); return is_wp_error($id) ? $id : cheops_mcp_full($id, '_cheops_'); },
        ],
        'list_pages' => [
            'description' => 'List pages or blog posts.',
            'schema' => cheops_mcp_obj($list_args + ['type' => ['type' => 'string', 'enum' => ['page', 'post'], 'default' => 'page']]), 'annotations' => CHEOPS_MCP_RO,
            'run' => static function ($a) { return cheops_mcp_list(($a['type'] ?? 'page') === 'post' ? 'post' : 'page', $a); },
        ],
        'get_page' => [
            'description' => 'One page or blog post with its content.',
            'schema' => cheops_mcp_obj(['id' => ['type' => 'integer']], ['id']), 'annotations' => CHEOPS_MCP_RO,
            'run' => static function ($a) { $p = get_post((int) $a['id']); if (!$p || !in_array($p->post_type, ['page', 'post'], true)) return new WP_Error('get', 'No page or post ' . (int) $a['id']); return cheops_mcp_full($p->ID, '_cheops_'); },
        ],
        'save_page' => [
            'description' => 'Create or change a page or blog post.',
            'schema' => cheops_mcp_obj($post_fields + ['type' => ['type' => 'string', 'enum' => ['page', 'post'], 'default' => 'page'], 'category' => ['type' => 'array', 'items' => ['type' => 'string']], 'post_tag' => ['type' => 'array', 'items' => ['type' => 'string']]]), 'annotations' => CHEOPS_MCP_RW,
            'run' => static function ($a) {
                $type = ($a['type'] ?? 'page') === 'post' ? 'post' : 'page';
                if (!empty($a['id'])) { $p = get_post((int) $a['id']); if ($p) $type = $p->post_type; }
                $id = cheops_mcp_save($type, $a, '_cheops_'); return is_wp_error($id) ? $id : cheops_mcp_full($id, '_cheops_');
            },
        ],
        'get_community' => [
            'description' => 'Shared settings of a community shown on all its units: photos, intro, map title, Google Maps link, map tabs (label, time, image), features, story sections, services, and for Lake Town the floor plans per unit range; for LVLS plans, layout and rooms.',
            'schema' => cheops_mcp_obj(['community' => ['type' => 'string', 'enum' => array_keys(CHEOPS_MCP_COMMUNITIES)]], ['community']), 'annotations' => CHEOPS_MCP_RO,
            'run' => static function ($a) {
                $c = CHEOPS_MCP_COMMUNITIES[$a['community']] ?? null; if (!$c) return new WP_Error('community', 'Unknown community');
                return function_exists($c[1]) ? call_user_func($c[1]) : (array) get_option($c[0], []);
            },
        ],
        'update_community' => [
            'description' => 'Change community settings. Send only the keys that change, with their full new value (lists are replaced, not merged). Read them first with get_community.',
            'schema' => cheops_mcp_obj(['community' => ['type' => 'string', 'enum' => array_keys(CHEOPS_MCP_COMMUNITIES)], 'settings' => ['type' => 'object', 'additionalProperties' => true]], ['community', 'settings']), 'annotations' => CHEOPS_MCP_RW,
            'run' => static function ($a) {
                $c = CHEOPS_MCP_COMMUNITIES[$a['community']] ?? null; if (!$c) return new WP_Error('community', 'Unknown community');
                $current = function_exists($c[1]) ? call_user_func($c[1]) : (array) get_option($c[0], []);
                $new = array_merge((array) $current, (array) $a['settings']);
                update_option($c[0], $new, false);
                cheops_mcp_bump();
                return $new;
            },
        ],
        'get_theme_settings' => [
            'description' => 'Theme settings from Appearance → Customize (phone, WhatsApp, email, address, logos, hero images, intro video, header button links, price switch, USD rate, and so on).',
            'schema' => cheops_mcp_obj(), 'annotations' => CHEOPS_MCP_RO,
            'run' => static function () { $mods = (array) get_theme_mods(); unset($mods['custom_css_post_id']); ksort($mods); return $mods; },
        ],
        'update_theme_settings' => [
            'description' => 'Change Customizer settings. Send only the keys that change, e.g. {"cheops_phone": "0127..."}. null removes a setting so its default shows.',
            'schema' => cheops_mcp_obj(['settings' => ['type' => 'object', 'additionalProperties' => true]], ['settings']), 'annotations' => CHEOPS_MCP_RW,
            'run' => static function ($a) {
                foreach ((array) $a['settings'] as $k => $v) { if ($v === null) remove_theme_mod($k); else set_theme_mod($k, $v); }
                do_action('customize_save_after', null);
                cheops_mcp_bump();
                return (array) get_theme_mods();
            },
        ],
        'get_option' => [
            'description' => 'Read a site option whose name starts with cheops_ (for example cheops_i18n, the saved Arabic translations), or blogname / blogdescription.',
            'schema' => cheops_mcp_obj(['name' => ['type' => 'string']], ['name']), 'annotations' => CHEOPS_MCP_RO,
            'run' => static function ($a) { $n = (string) $a['name']; if (!cheops_mcp_option_ok($n)) return new WP_Error('option', 'Not allowed: ' . $n); return ['name' => $n, 'value' => get_option($n)]; },
        ],
        'update_option' => [
            'description' => 'Change a cheops_* option (or blogname / blogdescription). Read it first; the value replaces the old one.',
            'schema' => cheops_mcp_obj(['name' => ['type' => 'string'], 'value' => new stdClass()], ['name', 'value']), 'annotations' => CHEOPS_MCP_RW,
            'run' => static function ($a) {
                $n = (string) $a['name']; if (!cheops_mcp_option_ok($n)) return new WP_Error('option', 'Not allowed: ' . $n);
                update_option($n, $a['value']); cheops_mcp_bump(); return ['name' => $n, 'value' => get_option($n)];
            },
        ],
        'list_media' => [
            'description' => 'Find images in the Media Library.',
            'schema' => cheops_mcp_obj(['search' => ['type' => 'string'], 'limit' => ['type' => 'integer', 'default' => 40], 'offset' => ['type' => 'integer', 'default' => 0]]), 'annotations' => CHEOPS_MCP_RO,
            'run' => static function ($a) {
                $q = new WP_Query(['post_type' => 'attachment', 'post_status' => 'inherit', 'posts_per_page' => min(200, max(1, (int) ($a['limit'] ?? 40))), 'offset' => (int) ($a['offset'] ?? 0), 's' => (string) ($a['search'] ?? '')]);
                return ['total' => (int) $q->found_posts, 'items' => array_map(static function ($p) { return ['id' => $p->ID, 'title' => $p->post_title, 'url' => wp_get_attachment_url($p->ID), 'date' => $p->post_date]; }, $q->posts)];
            },
        ],
        'upload_media' => [
            'description' => 'Copy an image from a public URL into the Media Library. Returns its id and URL.',
            'schema' => cheops_mcp_obj(['url' => ['type' => 'string'], 'title' => ['type' => 'string']], ['url']), 'annotations' => CHEOPS_MCP_RW,
            'run' => static function ($a) { $id = cheops_mcp_attachment((string) $a['url'], (string) ($a['title'] ?? '')); return is_wp_error($id) ? $id : ['id' => $id, 'url' => wp_get_attachment_url($id)]; },
        ],
        'list_requests' => [
            'description' => 'Meeting requests (bookings) and newsletter subscribers, newest first.',
            'schema' => cheops_mcp_obj(['kind' => ['type' => 'string', 'enum' => ['bookings', 'subscribers'], 'default' => 'bookings'], 'limit' => ['type' => 'integer', 'default' => 30]]), 'annotations' => CHEOPS_MCP_RO,
            'run' => static function ($a) {
                $type = ($a['kind'] ?? 'bookings') === 'subscribers' ? 'cheops_subscriber' : 'cheops_booking';
                $posts = get_posts(['post_type' => $type, 'post_status' => 'any', 'posts_per_page' => min(200, max(1, (int) ($a['limit'] ?? 30))), 'orderby' => 'date', 'order' => 'DESC']);
                return array_map(static function ($p) { return ['id' => $p->ID, 'title' => $p->post_title, 'date' => $p->post_date, 'content' => wp_strip_all_tags($p->post_content), 'meta' => cheops_mcp_meta_of($p->ID, '')]; }, $posts);
            },
        ],
        'trash_item' => [
            'description' => 'Move a unit, project, page or post to the Trash (it can be restored from the dashboard for 30 days).',
            'schema' => cheops_mcp_obj(['id' => ['type' => 'integer']], ['id']), 'annotations' => ['readOnlyHint' => false, 'destructiveHint' => true, 'openWorldHint' => false],
            'run' => static function ($a) {
                $p = get_post((int) $a['id']);
                if (!$p || !in_array($p->post_type, ['cheops_unit', 'cheops_project', 'page', 'post'], true)) return new WP_Error('trash', 'Nothing to trash with id ' . (int) $a['id']);
                wp_trash_post($p->ID); cheops_mcp_bump(); return ['trashed' => $p->ID, 'title' => $p->post_title];
            },
        ],
        'clear_cache' => [
            'description' => 'Refresh the site after changes: new content version for the theme caches and LiteSpeed Purge All.',
            'schema' => cheops_mcp_obj(), 'annotations' => CHEOPS_MCP_RW,
            'run' => static function () { cheops_mcp_bump(); do_action('litespeed_purge_all'); if (function_exists('wp_cache_flush')) wp_cache_flush(); return ['cleared' => true]; },
        ],
    ];
}

function cheops_mcp_option_ok($name) { return (strpos($name, 'cheops_') === 0 && strpos($name, 'cheops_mcp_') !== 0) || in_array($name, ['blogname', 'blogdescription'], true); }

function cheops_mcp_meta_keys($type) {
    global $wpdb;
    return $wpdb->get_col($wpdb->prepare("SELECT DISTINCT pm.meta_key FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type = %s AND pm.meta_key LIKE %s ORDER BY pm.meta_key", $type, $wpdb->esc_like('_cheops_') . '%'));
}

/* ---------- Settings → Cheops MCP ---------- */

add_action('admin_menu', static function () {
    add_options_page('Cheops MCP', 'Cheops MCP', 'manage_options', 'cheops-mcp', 'cheops_mcp_settings_page');
});

add_action('admin_post_cheops_mcp_save', static function () {
    if (!current_user_can('manage_options')) wp_die('Not allowed.');
    check_admin_referer('cheops_mcp_save');
    update_option('cheops_mcp_enabled', empty($_POST['enabled']) ? 0 : 1, false);
    $uid = (int) ($_POST['user'] ?? 0);
    if ($uid && user_can($uid, 'manage_options')) update_option('cheops_mcp_user', $uid, false);
    if (!empty($_POST['new_key'])) update_option('cheops_mcp_key', wp_generate_password(48, false, false), false);
    if (!empty($_POST['clear_log'])) delete_option('cheops_mcp_log');
    wp_safe_redirect(admin_url('options-general.php?page=cheops-mcp&saved=1'));
    exit;
});

function cheops_mcp_settings_page() {
    $link = cheops_mcp_link();
    $log = (array) get_option('cheops_mcp_log', []);
    $admins = get_users(['role' => 'administrator', 'fields' => ['ID', 'display_name', 'user_login']]);
    ?>
    <div class="wrap">
      <h1>Cheops MCP</h1>
      <p>Connect Claude to this dashboard. In Claude open <strong>Settings → Connectors → Add custom connector</strong>, name it <em>Cheops Privé</em> and paste the link below. Anyone with this link can change the site, so keep it private. Make a new link at any time to cut off the old one.</p>
      <?php if (isset($_GET['saved'])): ?><div class="notice notice-success is-dismissible"><p>Saved.</p></div><?php endif; ?>
      <table class="form-table" role="presentation">
        <tr><th scope="row">Connector link</th><td>
          <input type="text" readonly class="large-text code" id="cheops-mcp-link" value="<?php echo esc_attr($link); ?>" onclick="this.select()">
          <p><button type="button" class="button" onclick="navigator.clipboard.writeText(document.getElementById('cheops-mcp-link').value);this.textContent='Copied'">Copy link</button></p>
        </td></tr>
      </table>
      <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <input type="hidden" name="action" value="cheops_mcp_save"><?php wp_nonce_field('cheops_mcp_save'); ?>
        <table class="form-table" role="presentation">
          <tr><th scope="row">Access</th><td><label><input type="checkbox" name="enabled" value="1" <?php checked(cheops_mcp_enabled()); ?>> Claude can use the link</label></td></tr>
          <tr><th scope="row">Acts as</th><td><select name="user"><?php foreach ($admins as $u): ?><option value="<?php echo (int) $u->ID; ?>" <?php selected((int) get_option('cheops_mcp_user'), (int) $u->ID); ?>><?php echo esc_html($u->display_name . ' (' . $u->user_login . ')'); ?></option><?php endforeach; ?></select>
            <p class="description">Changes show in the dashboard as made by this administrator.</p></td></tr>
          <tr><th scope="row">New link</th><td><label><input type="checkbox" name="new_key" value="1"> Make a new link (the old one stops working)</label></td></tr>
        </table>
        <?php submit_button('Save'); ?>
      </form>
      <h2>Recent activity</h2>
      <?php if (!$log): ?><p>Nothing yet.</p><?php else: ?>
      <table class="widefat striped" style="max-width:900px"><thead><tr><th>When</th><th>Action</th><th>Result</th><th>Note</th></tr></thead><tbody>
        <?php foreach ($log as $row): ?><tr><td><?php echo esc_html(wp_date('Y-m-d H:i', (int) $row['t'])); ?></td><td><code><?php echo esc_html($row['tool']); ?></code></td><td><?php echo $row['ok'] ? 'Done' : 'Failed'; ?></td><td><?php echo esc_html($row['note']); ?></td></tr><?php endforeach; ?>
      </tbody></table>
      <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="margin-top:10px"><input type="hidden" name="action" value="cheops_mcp_save"><input type="hidden" name="enabled" value="<?php echo cheops_mcp_enabled() ? 1 : ''; ?>"><input type="hidden" name="user" value="<?php echo (int) get_option('cheops_mcp_user'); ?>"><input type="hidden" name="clear_log" value="1"><?php wp_nonce_field('cheops_mcp_save'); ?><button class="button">Clear activity</button></form>
      <?php endif; ?>
    </div>
    <?php
}

add_filter('plugin_action_links_' . plugin_basename(__FILE__), static function ($links) {
    array_unshift($links, '<a href="' . esc_url(admin_url('options-general.php?page=cheops-mcp')) . '">Settings</a>');
    return $links;
});
