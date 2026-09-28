<?php
if (!defined('ABSPATH')) exit;

/**
 * Curated Portfolio AUG26 importer.
 * Source data and page renders live in assets/portfolio/.
 * The importer is idempotent: projects are matched by title/legacy title and
 * units are matched by their unique reference code.
 */
function cheops_portfolio_aug26_data() {
    static $data = null;
    if ($data !== null) return $data;
    $file = get_template_directory() . '/assets/portfolio/portfolio-aug26.json';
    if (!is_readable($file)) return $data = [];
    $decoded = json_decode((string) file_get_contents($file), true);
    return $data = is_array($decoded) ? $decoded : [];
}

function cheops_portfolio_asset_url($file) {
    $file = ltrim((string)$file, '/');
    if ($file === '') return '';
    return get_template_directory_uri() . '/assets/portfolio/' . rawurlencode($file);
}

function cheops_portfolio_project_by_key($key) {
    $data = cheops_portfolio_aug26_data();
    foreach (($data['projects'] ?? []) as $project) {
        if (($project['key'] ?? '') === $key) return $project;
    }
    return [];
}

function cheops_portfolio_project_cover_for_title($title) {
    $data = cheops_portfolio_aug26_data();
    foreach (($data['projects'] ?? []) as $project) {
        if (($project['title'] ?? '') === $title) return cheops_portfolio_asset_url($project['cover_asset'] ?? '');
    }
    return '';
}

function cheops_portfolio_find_project($project) {
    $titles = array_values(array_filter(array_merge([$project['title'] ?? ''], $project['legacy'] ?? [])));
    foreach ($titles as $title) {
        $existing = get_page_by_title($title, OBJECT, 'cheops_project');
        if ($existing) return $existing->ID;
    }
    return 0;
}

function cheops_portfolio_find_unit_by_reference($reference) {
    $ids = get_posts([
        'post_type' => 'cheops_unit',
        'post_status' => 'any',
        'posts_per_page' => 1,
        'fields' => 'ids',
        'meta_key' => '_cheops_reference',
        'meta_value' => $reference,
        'no_found_rows' => true,
    ]);
    return $ids ? (int)$ids[0] : 0;
}

function cheops_portfolio_unit_content($unit, $project) {
    $lines = [];
    if (!empty($unit['description'])) $lines[] = '<p>' . esc_html($unit['description']) . '</p>';
    $lines[] = '<p><strong>Reference:</strong> ' . esc_html($unit['reference']) . '<br>' .
        '<strong>Project:</strong> ' . esc_html($project['title']) . '<br>' .
        '<strong>Area:</strong> ' . esc_html($unit['area']) . ' m²</p>';

    $payment = [];
    if (!empty($unit['down'])) $payment[] = '<strong>Down payment:</strong> ' . esc_html($unit['down']);
    if (!empty($unit['remaining'])) $payment[] = '<strong>Remaining balance:</strong> ' . esc_html($unit['remaining']);
    if (!empty($unit['maintenance'])) $payment[] = '<strong>Maintenance:</strong> ' . esc_html($unit['maintenance']);
    if (!empty($unit['due'])) $payment[] = '<strong>Due date:</strong> ' . esc_html($unit['due']);
    if (!empty($unit['payment'])) $payment[] = '<strong>Payment schedule:</strong> ' . esc_html($unit['payment']);
    if ($payment) $lines[] = '<p>' . implode('<br>', $payment) . '</p>';

    $promo = $unit['promo'] ?? [];
    if (!empty($promo)) {
        $promo_lines = [];
        if (!empty($promo['cash'])) $promo_lines[] = '<strong>50% cash promotion:</strong> ' . esc_html($promo['cash']);
        if (!empty($promo['discounted_price'])) $promo_lines[] = '<strong>40% promotion - price after discount:</strong> ' . esc_html($promo['discounted_price']);
        if (!empty($promo['discounted_maintenance'])) $promo_lines[] = '<strong>Promotional maintenance:</strong> ' . esc_html($promo['discounted_maintenance']);
        if (!empty($promo['discounted_down'])) $promo_lines[] = '<strong>Promotional down payment:</strong> ' . esc_html($promo['discounted_down']);
        if (!empty($promo['discounted_installment'])) $promo_lines[] = '<strong>Promotional quarterly installment:</strong> ' . esc_html($promo['discounted_installment']);
        if ($promo_lines) $lines[] = '<p><strong>Cheops Privé promotion</strong><br>' . implode('<br>', $promo_lines) . '</p>';
    }
    $lines[] = '<p><em>Source: Curated Portfolio AUG26.</em></p>';
    return implode("\n", $lines);
}

function cheops_import_portfolio_aug26($manual = false) {
    $data = cheops_portfolio_aug26_data();
    if (empty($data['projects']) || empty($data['units'])) {
        return new WP_Error('portfolio_missing', 'Curated Portfolio AUG26 data file is missing or invalid.');
    }

    $project_ids = [];
    $created_projects = $updated_projects = $created_units = $updated_units = 0;

    foreach ($data['projects'] as $index => $project) {
        $title = sanitize_text_field($project['title'] ?? '');
        if (!$title) continue;
        $pid = cheops_portfolio_find_project($project);
        $postarr = [
            'post_type' => 'cheops_project',
            'post_status' => 'publish',
            'post_title' => $title,
            'post_excerpt' => 'Curated residences selected by Cheops Privé at ' . $title . '.',
            'post_content' => '<p>Curated residences selected by Cheops Privé at ' . esc_html($title) . '.</p>',
            'menu_order' => 20 + $index,
        ];
        if ($pid) {
            $postarr['ID'] = $pid;
            $result = wp_update_post(wp_slash($postarr), true);
            if (!is_wp_error($result)) $updated_projects++;
        } else {
            $result = wp_insert_post(wp_slash($postarr), true);
            if (is_wp_error($result) || !$result) continue;
            $pid = (int)$result;
            $created_projects++;
        }
        $project_ids[$project['key']] = $pid;

        $city = sanitize_text_field($project['city'] ?? '');
        if ($city) {
            if (!term_exists($city, 'project_city')) wp_insert_term($city, 'project_city');
            wp_set_object_terms($pid, $city, 'project_city', false);
        }
        update_post_meta($pid, '_cheops_project_type', sanitize_text_field($project['types'] ?? ''));
        update_post_meta($pid, '_cheops_project_start_price', !empty($project['start_price']) ? 'EGP ' . number_format_i18n((float)$project['start_price'], 0) : 'On request');
        update_post_meta($pid, '_cheops_project_units', (string)absint($project['units'] ?? 0));
        update_post_meta($pid, '_cheops_project_portfolio_cover', sanitize_file_name($project['cover_asset'] ?? ''));
        update_post_meta($pid, '_cheops_portfolio_source', 'Curated Portfolio AUG26');
    }

    $featured_seen = [];
    foreach ($data['units'] as $index => $unit) {
        $project = cheops_portfolio_project_by_key($unit['project'] ?? '');
        if (!$project) continue;
        $reference = sanitize_text_field($unit['reference'] ?? '');
        if (!$reference) continue;
        $title = trim(($unit['marketing_type'] ?? $unit['type'] ?? 'Property') . ' - ' . $reference);
        $post_id = cheops_portfolio_find_unit_by_reference($reference);
        $postarr = [
            'post_type' => 'cheops_unit',
            'post_status' => 'publish',
            'post_title' => $title,
            'post_excerpt' => sanitize_text_field($unit['description'] ?? ''),
            'post_content' => cheops_portfolio_unit_content($unit, $project),
            'menu_order' => 1000 + $index,
        ];
        if ($post_id) {
            $postarr['ID'] = $post_id;
            $result = wp_update_post(wp_slash($postarr), true);
            if (is_wp_error($result)) continue;
            $updated_units++;
        } else {
            $result = wp_insert_post(wp_slash($postarr), true);
            if (is_wp_error($result) || !$result) continue;
            $post_id = (int)$result;
            $created_units++;
        }

        update_post_meta($post_id, '_cheops_listing_type', 'sale');
        update_post_meta($post_id, '_cheops_sale_type', 'developer-sale');
        update_post_meta($post_id, '_cheops_price', (float)($unit['price'] ?? 0));
        delete_post_meta($post_id, '_cheops_price_override_text');
        update_post_meta($post_id, '_cheops_area', (string)($unit['area'] ?? ''));
        update_post_meta($post_id, '_cheops_beds', absint($unit['beds'] ?? 0));
        update_post_meta($post_id, '_cheops_baths', 0);
        update_post_meta($post_id, '_cheops_floor', sanitize_text_field($unit['floor'] ?? ''));
        update_post_meta($post_id, '_cheops_project', sanitize_text_field($project['title'] ?? ''));
        update_post_meta($post_id, '_cheops_reference', $reference);
        update_post_meta($post_id, '_cheops_payment', sanitize_text_field($unit['payment'] ?? ''));
        update_post_meta($post_id, '_cheops_downpayment', sanitize_text_field($unit['down'] ?? ''));
        update_post_meta($post_id, '_cheops_installment', sanitize_text_field($unit['payment'] ?? ''));
        update_post_meta($post_id, '_cheops_maintenance', sanitize_text_field($unit['maintenance'] ?? ''));
        update_post_meta($post_id, '_cheops_remaining_balance', sanitize_text_field($unit['remaining'] ?? ''));
        update_post_meta($post_id, '_cheops_due_date', sanitize_text_field($unit['due'] ?? ''));
        update_post_meta($post_id, '_cheops_portfolio_cover', sanitize_file_name($project['cover_asset'] ?? ''));
        update_post_meta($post_id, '_cheops_floorplan_asset', sanitize_file_name($unit['floor_asset'] ?? ''));
        update_post_meta($post_id, '_cheops_masterplan_asset', sanitize_file_name($unit['locator_asset'] ?? ''));
        update_post_meta($post_id, '_cheops_portfolio_source', 'Curated Portfolio AUG26');
        update_post_meta($post_id, '_cheops_source_floor_page', absint($unit['floor_page'] ?? 0));
        update_post_meta($post_id, '_cheops_source_locator_page', absint($unit['locator_page'] ?? 0));
        update_post_meta($post_id, '_cheops_label', 'Curated Portfolio');
        $project_key = $unit['project'] ?? '';
        if (empty($featured_seen[$project_key])) {
            update_post_meta($post_id, '_cheops_featured', '1');
            $featured_seen[$project_key] = true;
        } else {
            update_post_meta($post_id, '_cheops_featured', '0');
        }

        $type = sanitize_text_field($unit['type'] ?? 'Property');
        if ($type) wp_set_object_terms($post_id, $type, 'unit_type', false);
        $city = sanitize_text_field($project['city'] ?? '');
        if ($city) {
            if (!term_exists($city, 'unit_location')) wp_insert_term($city, 'unit_location');
            wp_set_object_terms($post_id, $city, 'unit_location', false);
        }
        $developer = sanitize_text_field($project['developer'] ?? '');
        if ($developer) {
            if (!term_exists($developer, 'unit_developer')) wp_insert_term($developer, 'unit_developer');
            wp_set_object_terms($post_id, $developer, 'unit_developer', false);
        }
    }

    update_option('cheops_portfolio_aug26_imported_v1', gmdate('c'), false);
    update_option('cheops_portfolio_aug26_counts_v1', [
        'created_projects'=>$created_projects,'updated_projects'=>$updated_projects,
        'created_units'=>$created_units,'updated_units'=>$updated_units,
    ], false);

    return compact('created_projects','updated_projects','created_units','updated_units');
}

function cheops_portfolio_aug26_auto_import() {
    if (!is_admin() || wp_doing_ajax() || !current_user_can('manage_options')) return;
    if (get_option('cheops_portfolio_aug26_imported_v1')) return;
    $result = cheops_import_portfolio_aug26(false);
    if (!is_wp_error($result)) set_transient('cheops_portfolio_aug26_notice', $result, 120);
}
add_action('admin_init', 'cheops_portfolio_aug26_auto_import', 30);

function cheops_portfolio_aug26_manual_import() {
    if (!current_user_can('manage_options')) wp_die('Not allowed.');
    check_admin_referer('cheops_import_portfolio_aug26');
    $result = cheops_import_portfolio_aug26(true);
    $args = ['post_type'=>'cheops_unit','page'=>'cheops-property-dashboard'];
    if (is_wp_error($result)) $args['portfolio_error'] = rawurlencode($result->get_error_message());
    else {
        $args['portfolio_units_created'] = (int)$result['created_units'];
        $args['portfolio_units_updated'] = (int)$result['updated_units'];
        $args['portfolio_projects_created'] = (int)$result['created_projects'];
        $args['portfolio_projects_updated'] = (int)$result['updated_projects'];
    }
    wp_safe_redirect(add_query_arg($args, admin_url('edit.php')));
    exit;
}
add_action('admin_post_cheops_import_portfolio_aug26', 'cheops_portfolio_aug26_manual_import');

function cheops_portfolio_aug26_admin_notice() {
    $result = get_transient('cheops_portfolio_aug26_notice');
    if (!$result || !is_array($result)) return;
    delete_transient('cheops_portfolio_aug26_notice');
    echo '<div class="notice notice-success is-dismissible"><p><strong>Cheops Privé:</strong> Curated Portfolio AUG26 imported: ' .
        (int)$result['created_projects'] . ' projects created, ' . (int)$result['updated_projects'] . ' refreshed, ' .
        (int)$result['created_units'] . ' units created, ' . (int)$result['updated_units'] . ' refreshed.</p></div>';
}
add_action('admin_notices', 'cheops_portfolio_aug26_admin_notice');
