<?php
/**
 * Lake Town: photos, floor plans and location map for its units, all editable
 * under Properties → Lake Town. Each unit gets the floor plan whose unit list
 * includes it, the office or clinic photos of its building (A = clinics), and
 * the location map. The map drawings ship in assets/lake-town as defaults.
 */
if (!defined('ABSPATH')) exit;

function cheops_lake_town_defaults() {
    $ref = 'https://cheops.front.aait-d.com/wp-content/uploads/';
    $own = 'https://cheopsprive.com/wp-content/uploads/2026/11/Screenshot-2026-10-26-at-';
    $maps = get_template_directory_uri() . '/assets/lake-town/';
    return [
        'intro' => 'Laketown is a bustling commercial mall located at the heart of the Golden Square in the Fifth Settlement. Serving as the focal point of Lakeview Residence, the mall offers a comprehensive experience for shopping, dining, and working.',
        'map_title' => 'How to get to Lake Town?',
        'google_maps' => 'https://www.google.com/maps?q=30.0259,31.5402',
        'map_views' => [
            ['label' => 'Lake Town', 'time' => '', 'image' => $maps . 'map-main.svg'],
            ['label' => 'South 90 St.', 'time' => '3 Min', 'image' => $maps . 'map-south-90.svg'],
            ['label' => 'MV Hyde Park', 'time' => '3 Min', 'image' => $maps . 'map-hyde-park.svg'],
            ['label' => 'The MarQ Gardens', 'time' => '6 Min', 'image' => $maps . 'map-marq-gardens.svg'],
            ['label' => 'MV 1', 'time' => '5 Min', 'image' => $maps . 'map-mv1.svg'],
        ],
        // Office interiors only, no people; clinic units use the same photos.
        'office_covers' => [$ref . '2025/12/LT-Bus-1-scaled.jpg', $ref . '2025/12/LT-Bus-2-scaled.jpg', $ref . '2025/12/LT-Bus-3-scaled.jpg', $ref . '2025/12/LTB4.jpg'],
        'office_photos' => [$ref . '2025/12/LTB3.jpg', $ref . '2025/12/LTB4.jpg', $ref . '2025/12/LT-Bus-1-scaled.jpg', $ref . '2025/12/LT-Bus-2-scaled.jpg', $ref . '2025/12/LT-Bus-3-scaled.jpg'],
        'clinic_covers' => [$ref . '2025/12/LT-Bus-1-scaled.jpg', $ref . '2025/12/LT-Bus-2-scaled.jpg', $ref . '2025/12/LT-Bus-3-scaled.jpg', $ref . '2025/12/LTB4.jpg'],
        'clinic_photos' => [$ref . '2025/12/LTB3.jpg', $ref . '2025/12/LTB4.jpg', $ref . '2025/12/LT-Bus-1-scaled.jpg', $ref . '2025/12/LT-Bus-2-scaled.jpg', $ref . '2025/12/LT-Bus-3-scaled.jpg'],
        'plans' => [
            ['label' => 'Lake Town Building A', 'units' => 'A-321 - A-325', 'image' => $own . '1.38.32-PM.png'],
            ['label' => 'Lake Town Building C', 'units' => 'C-301 - C-304', 'image' => $own . '1.38.46-PM.png'],
            ['label' => 'Lake Town Building C', 'units' => 'C-305 - C-313', 'image' => $own . '1.39.00-PM.png'],
            ['label' => 'Lake Town Building C', 'units' => 'C-314 - C-321', 'image' => $own . '1.39.09-PM.png'],
            ['label' => 'Lake Town Building CX', 'units' => 'CX-301', 'image' => $own . '1.39.19-PM.png'],
            ['label' => 'Lake Town Building CX', 'units' => 'CX-305', 'image' => $own . '1.39.33-PM.png'],
            ['label' => 'Lake Town Building BX', 'units' => 'BX-127', 'image' => $own . '1.39.51-PM.png'],
        ],
    ];
}

/** Saved settings over the defaults. */
function cheops_lake_town_settings() {
    static $cache = null;
    if ($cache !== null) return $cache;
    $saved = get_option('cheops_lake_town', []);
    return $cache = array_merge(cheops_lake_town_defaults(), is_array($saved) ? $saved : []);
}

/** Unit number such as "C-301" from a Lake Town unit title ("C-301 — Lake Town"), or ''. */
function cheops_lake_town_unit_number($post_id) {
    $project = trim((string) get_post_meta($post_id, '_cheops_project', true));
    if (strcasecmp($project, 'Lake Town') !== 0) return '';
    return preg_match('/^\s*([A-Z]{1,2})\s*-?\s*(\d+)/i', (string) get_post_field('post_title', $post_id), $m) ? strtoupper($m[1]) . '-' . $m[2] : '';
}

function cheops_lake_town_building($post_id) {
    $number = cheops_lake_town_unit_number($post_id);
    return $number ? strtok($number, '-') : '';
}

/** True when "C-307" is in a list such as "C-301 - C-304, C-307". */
function cheops_lake_town_unit_in($number, $list) {
    if (!preg_match('/^([A-Z]+)-(\d+)$/', $number, $u)) return false;
    foreach (preg_split('/\s*,\s*/', strtoupper((string) $list)) as $part) {
        if (!preg_match('/^([A-Z]+)\s*-?\s*(\d+)(?:\s*(?:-|–|TO)\s*(?:([A-Z]+)\s*-?\s*)?(\d+))?$/', trim($part), $p)) continue;
        $from = (int) $p[2]; $to = isset($p[4]) && $p[4] !== '' ? (int) $p[4] : $from;
        if ($p[1] === $u[1] && (int) $u[2] >= min($from, $to) && (int) $u[2] <= max($from, $to)) return true;
    }
    return false;
}

/** A Media Library picture at a web size; other links as they are. */
function cheops_lake_town_img($url, $size = 'large') {
    static $ids = [];
    if (!$url || preg_match('/\.svg(\?|$)/i', $url)) return $url;
    if (!isset($ids[$url])) $ids[$url] = attachment_url_to_postid($url);
    return $ids[$url] ? (string) wp_get_attachment_image_url($ids[$url], $size) : $url;
}

function cheops_lake_town_kit($post_id) {
    $number = cheops_lake_town_unit_number($post_id);
    if (!$number) return null;
    $s = cheops_lake_town_settings();
    $clinic = strtok($number, '-') === 'A';
    $covers = array_values(array_filter((array) $s[$clinic ? 'clinic_covers' : 'office_covers']));
    $photos = array_values(array_filter((array) $s[$clinic ? 'clinic_photos' : 'office_photos']));
    $n = (int) preg_replace('/\D/', '', $number);
    $cover = $covers ? $covers[$n % count($covers)] : ($photos[0] ?? '');
    $plan = ['', ''];
    foreach ((array) $s['plans'] as $row) {
        if (!empty($row['image']) && cheops_lake_town_unit_in($number, $row['units'] ?? '')) { $plan = [$row['image'], $row['label'] ?? '']; break; }
    }
    $u = get_template_directory_uri() . '/assets/lake-town/';
    return [
        'building' => strtok($number, '-'),
        'number' => $number,
        'hero' => cheops_lake_town_img($cover),
        'photos' => array_map('cheops_lake_town_img', array_values(array_diff($photos, [$cover]))),
        'plan' => cheops_lake_town_img($plan[0], 'full'),
        'plan_label' => $plan[1],
        'logo' => $u . 'logo-lake-town.svg',
        'intro' => (string) $s['intro'],
        'map_title' => (string) $s['map_title'],
        'google_maps' => (string) $s['google_maps'],
        'map' => array_values(array_filter((array) $s['map_views'], static function ($v) { return !empty($v['image']); })),
    ];
}

/** Stock photos the old Lake Town importer attached; Lake Town photos replace them. */
function cheops_lake_town_pool_ids() {
    $ids = get_option('cheops_lake_town_image_pool', []);
    return is_array($ids) ? array_map('absint', array_values($ids)) : [];
}

/** Cover photo for a unit card: the unit's own photo, or its building's photo for Lake Town. */
function cheops_unit_cover_url($post_id, $size = 'large') {
    $thumb = (int) get_post_thumbnail_id($post_id);
    $kit = cheops_lake_town_kit($post_id);
    if ($kit && $kit['hero'] && (!$thumb || in_array($thumb, cheops_lake_town_pool_ids(), true))) return $kit['hero'];
    $img = $thumb ? wp_get_attachment_image_url($thumb, $size) : '';
    if (!$img) {
        $ids = array_filter(array_map('absint', explode(',', (string) get_post_meta($post_id, '_cheops_gallery_ids', true))));
        if ($ids) $img = wp_get_attachment_image_url(reset($ids), $size);
    }
    if (!$img && function_exists('cheops_portfolio_asset_url')) {
        $asset = get_post_meta($post_id, '_cheops_portfolio_cover', true);
        if ($asset) $img = cheops_portfolio_asset_url($asset);
    }
    return (string) $img;
}

/** Location map with a tab per destination; the first view shows Lake Town itself. */
function cheops_render_lake_town_map($kit) {
    if (!$kit['map']) return;
    echo '<section class="sp-section sp-lt-map" id="location"><h2>Location Map</h2>';
    if ($kit['map_title']) echo '<p class="sp-lt-map-note">' . esc_html($kit['map_title']) . '</p>';
    echo '<div class="sp-lt-map-media">';
    foreach ($kit['map'] as $i => $view) {
        echo '<img src="' . esc_url($view['image']) . '" alt="' . esc_attr('Lake Town · ' . ($view['label'] ?? '')) . '"' . ($i ? ' hidden loading="lazy"' : '') . ' decoding="async" data-view="' . (int) $i . '">';
    }
    echo '</div><div class="sp-lt-map-tabs" role="tablist">';
    foreach ($kit['map'] as $i => $view) {
        if (!$i) continue;
        echo '<button type="button" role="tab" aria-selected="false" data-view="' . (int) $i . '"><strong>' . esc_html($view['label'] ?? '') . '</strong><span>' . esc_html($view['time'] ?? '') . '</span></button>';
    }
    echo '</div>';
    if ($kit['google_maps']) echo '<a class="sp-map-link" href="' . esc_url($kit['google_maps']) . '" target="_blank" rel="noopener">' . 'Open in Google Maps ↗' . '</a>';
    echo '</section>';
    echo "<script>(function(){var s=document.currentScript.previousElementSibling,imgs=s.querySelectorAll('.sp-lt-map-media img'),tabs=s.querySelectorAll('.sp-lt-map-tabs button');tabs.forEach(function(t){t.addEventListener('click',function(){var v=t.getAttribute('aria-selected')==='true'?'0':t.dataset.view;tabs.forEach(function(b){b.setAttribute('aria-selected',b===t&&v!=='0'?'true':'false');});imgs.forEach(function(im){im.hidden=im.dataset.view!==v;});});});})();</script>";
}

/* ---------- Copy photos from other sites into the Media Library ---------- */

/** Downloads every Lake Town picture that is not in this site's Media Library yet and points the settings at the copies. */
function cheops_lake_town_import_media() {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    if (function_exists('set_time_limit')) @set_time_limit(300);
    $s = cheops_lake_town_settings();
    $host = wp_parse_url(home_url(), PHP_URL_HOST);
    $copied = 0; $failed = 0; $done = [];
    $copy = static function ($url) use ($host, &$copied, &$failed, &$done) {
        if (!$url || !preg_match('/\.(jpe?g|png|webp)(\?|$)/i', $url) || wp_parse_url($url, PHP_URL_HOST) === $host) return $url;
        if (isset($done[$url])) return $done[$url]; // the same photo in two lists is copied once
        $tmp = download_url($url, 60);
        if (is_wp_error($tmp)) { $failed++; return $url; }
        $id = media_handle_sideload(['name' => sanitize_file_name('lake-town-' . basename(strtok($url, '?'))), 'tmp_name' => $tmp], 0, 'Lake Town');
        if (is_wp_error($id)) { @unlink($tmp); $failed++; return $url; }
        $copied++;
        return $done[$url] = (string) wp_get_attachment_url($id);
    };
    foreach (['office_covers', 'office_photos', 'clinic_covers', 'clinic_photos'] as $key) $s[$key] = array_map($copy, (array) $s[$key]);
    foreach ($s['plans'] as $i => $row) $s['plans'][$i]['image'] = $copy($row['image'] ?? '');
    update_option('cheops_lake_town', $s, false);
    update_option('cheops_lake_town_imported', ['copied' => $copied, 'failed' => $failed, 'time' => time()], false);
    if (function_exists('cheops_bump_content_version')) cheops_bump_content_version();
    return [$copied, $failed];
}
add_action('cheops_lake_town_import_event', 'cheops_lake_town_import_media');
add_action('init', static function () {
    if (get_option('cheops_lake_town_imported') || wp_next_scheduled('cheops_lake_town_import_event')) return;
    wp_schedule_single_event(time() + 60, 'cheops_lake_town_import_event');
}, 40);

/** One-time: take photos with people (and the mall, courtyard and sign shots) out of saved lists; clinics use the office photos. */
add_action('init', static function () {
    if (get_option('cheops_lake_town_offices_only')) return;
    update_option('cheops_lake_town_offices_only', 1, true);
    $saved = get_option('cheops_lake_town');
    if (!is_array($saved)) return;
    $keep = static function ($list) { return array_values(array_filter((array) $list, static function ($u) { return !preg_match('/(LT-+scaled|LT46|LT44|LTBM|LTM\d|LT-Med)/i', basename((string) $u)); })); };
    foreach (['office_covers', 'office_photos'] as $k) if (isset($saved[$k])) $saved[$k] = $keep($saved[$k]);
    if (isset($saved['office_covers'])) $saved['clinic_covers'] = $saved['office_covers'];
    if (isset($saved['office_photos'])) $saved['clinic_photos'] = $saved['office_photos'];
    update_option('cheops_lake_town', $saved, false);
    if (function_exists('cheops_bump_content_version')) cheops_bump_content_version();
}, 35);

/** Lake Town units are by Lake View Development; filled in once where no developer is set. */
add_action('init', static function () {
    if (get_option('cheops_lake_town_developer_v1')) return;
    if (!taxonomy_exists('unit_developer')) return;
    update_option('cheops_lake_town_developer_v1', 1, true);
    $ids = get_posts(['post_type' => 'cheops_unit', 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids', 'meta_key' => '_cheops_project', 'meta_value' => 'Lake Town', 'no_found_rows' => true]);
    foreach ($ids as $id) {
        $has = wp_get_object_terms($id, 'unit_developer', ['fields' => 'ids']);
        if (!is_wp_error($has) && !$has) wp_set_object_terms($id, 'Lake View Development', 'unit_developer', false);
    }
}, 30);

/* ---------- Dashboard: Properties → Lake Town ---------- */

add_action('admin_menu', static function () {
    add_submenu_page('edit.php?post_type=cheops_unit', 'Lake Town', 'Lake Town', 'edit_posts', 'cheops-lake-town', 'cheops_lake_town_admin_page');
});

add_action('admin_enqueue_scripts', static function ($hook) {
    if (strpos((string) $hook, 'cheops-lake-town') === false) return;
    wp_enqueue_media();
    wp_enqueue_script('jquery-ui-sortable');
});

function cheops_lake_town_admin_page() {
    $s = cheops_lake_town_settings();
    $done = get_option('cheops_lake_town_imported');
    $lists = [
        'office_covers' => ['Office covers', 'Main photo of each office unit (they take turns by unit number) and on its card in listings.'],
        'office_photos' => ['Office photos', 'More photos shown on every office unit page.'],
        'clinic_covers' => ['Clinic covers', 'Main photo of each clinic unit (building A). Office photos for now.'],
        'clinic_photos' => ['Clinic photos', 'More photos shown on every clinic unit page.'],
    ];
    ?>
    <div class="wrap cheops-lt">
      <div class="cheops-lt-head"><div><h1>Lake Town</h1><p>Photos, floor plans and the location map shown on every Lake Town unit page.</p></div>
        <a class="button" href="<?php echo esc_url(add_query_arg('project', 'Lake Town', home_url('/properties/'))); ?>" target="_blank" rel="noopener">View Lake Town units ↗</a></div>
      <?php if (isset($_GET['saved'])): ?><div class="notice notice-success is-dismissible"><p>Saved. The unit pages are updated.</p></div><?php endif; ?>
      <?php if (isset($_GET['imported'])): ?><div class="notice notice-success is-dismissible"><p>Copied <?php echo (int) $_GET['imported']; ?> pictures into the Media Library<?php echo !empty($_GET['failed']) ? ' (' . (int) $_GET['failed'] . ' could not be downloaded and keep their link)' : ''; ?>.</p></div><?php endif; ?>
      <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <input type="hidden" name="action" value="cheops_lake_town_save"><?php wp_nonce_field('cheops_lake_town_save'); ?>

        <section class="cheops-lt-card"><h2>Floor plans</h2><p class="cheops-lt-hint">Each plan appears on the units listed next to it. Write unit numbers like <code>C-301 - C-304, C-307</code>.</p>
          <div class="cheops-lt-plans" data-next="<?php echo count($s['plans']); ?>">
            <?php foreach (array_values((array) $s['plans']) as $i => $row) cheops_lake_town_plan_row($i, $row); ?>
          </div>
          <button type="button" class="button cheops-lt-add-plan">+ Add a floor plan</button>
          <template id="cheops-lt-plan-template"><?php cheops_lake_town_plan_row('__i__', ['label' => '', 'units' => '', 'image' => '']); ?></template>
        </section>

        <?php foreach ($lists as $key => $info): ?>
        <section class="cheops-lt-card"><h2><?php echo esc_html($info[0]); ?></h2><p class="cheops-lt-hint"><?php echo esc_html($info[1]); ?> Drag to reorder.</p>
          <div class="cheops-lt-thumbs" data-input="lt-<?php echo esc_attr($key); ?>">
            <?php foreach ((array) $s[$key] as $url): if (!$url) continue; ?><figure data-url="<?php echo esc_attr($url); ?>"><img src="<?php echo esc_url(cheops_lake_town_img($url, 'medium')); ?>" alt=""><button type="button" class="cheops-lt-remove" aria-label="Remove">×</button></figure><?php endforeach; ?>
          </div>
          <textarea hidden id="lt-<?php echo esc_attr($key); ?>" name="lt[<?php echo esc_attr($key); ?>]"><?php echo esc_textarea(implode("\n", (array) $s[$key])); ?></textarea>
          <button type="button" class="button cheops-lt-add" data-input="lt-<?php echo esc_attr($key); ?>">+ Add photos</button>
        </section>
        <?php endforeach; ?>

        <section class="cheops-lt-card"><h2>Location map</h2>
          <div class="cheops-lt-fields">
            <label><span>Title under "Location Map"</span><input type="text" name="lt[map_title]" value="<?php echo esc_attr($s['map_title']); ?>"></label>
            <label><span>Google Maps link</span><input type="url" name="lt[google_maps]" value="<?php echo esc_attr($s['google_maps']); ?>"><small>Open Lake Town in Google Maps, press Share, copy the link and paste it here.</small></label>
          </div>
          <div class="cheops-lt-views">
            <?php foreach (array_values((array) $s['map_views']) as $i => $v): ?>
            <div class="cheops-lt-view"><div class="cheops-lt-preview"><?php if (!empty($v['image'])): ?><img src="<?php echo esc_url($v['image']); ?>" alt=""><?php endif; ?></div>
              <label><span><?php echo $i ? 'Destination' : 'Main view'; ?></span><input type="text" name="lt[map_views][<?php echo (int) $i; ?>][label]" value="<?php echo esc_attr($v['label'] ?? ''); ?>"></label>
              <?php if ($i): ?><label><span>Drive time</span><input type="text" name="lt[map_views][<?php echo (int) $i; ?>][time]" value="<?php echo esc_attr($v['time'] ?? ''); ?>"></label><?php endif; ?>
              <input type="hidden" class="cheops-lt-image" name="lt[map_views][<?php echo (int) $i; ?>][image]" value="<?php echo esc_attr($v['image'] ?? ''); ?>">
              <button type="button" class="button cheops-lt-pick">Change map</button></div>
            <?php endforeach; ?>
          </div>
        </section>

        <section class="cheops-lt-card"><h2>About Lake Town</h2>
          <textarea name="lt[intro]" rows="4" class="large-text"><?php echo esc_textarea($s['intro']); ?></textarea></section>

        <div class="cheops-lt-actions"><span>Changes show on every Lake Town unit after you save.</span><button class="button button-primary" type="submit">Save changes</button></div>

      </form>

      <form class="cheops-lt-card cheops-lt-import" method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <input type="hidden" name="action" value="cheops_lake_town_import"><?php wp_nonce_field('cheops_lake_town_import'); ?>
        <div><h2>Keep the photos on this site</h2><p class="cheops-lt-hint">Copies any picture above that is linked from another website into your Media Library, so the pages do not depend on that site.<?php if ($done) echo ' Last run: ' . esc_html(wp_date('j M Y, H:i', (int) $done['time'])) . '.'; ?></p></div>
        <button class="button" type="submit">Copy into Media Library</button>
      </form>
    </div>
    <script>
    jQuery(function($){
      function sync($box){ $('#'+$box.data('input')).val($box.children('figure').map(function(){return $(this).data('url');}).get().join('\n')); }
      $('.cheops-lt-thumbs').each(function(){ var $b=$(this); if($.fn.sortable) $b.sortable({items:'figure',update:function(){sync($b);}}); });
      $(document).on('click','.cheops-lt-remove',function(){ var $b=$(this).closest('.cheops-lt-thumbs'); $(this).closest('figure').remove(); sync($b); });
      $(document).on('click','.cheops-lt-add',function(e){ e.preventDefault(); var $b=$('.cheops-lt-thumbs[data-input="'+$(this).data('input')+'"]');
        var f=wp.media({title:'Choose photos',multiple:true,library:{type:'image'}}); f.on('select',function(){ f.state().get('selection').each(function(a){ a=a.toJSON(); var t=(a.sizes&&a.sizes.medium)?a.sizes.medium.url:a.url; $b.append('<figure data-url="'+a.url+'"><img src="'+t+'" alt=""><button type="button" class="cheops-lt-remove" aria-label="Remove">×</button></figure>'); }); sync($b); }); f.open(); });
      $(document).on('click','.cheops-lt-pick',function(e){ e.preventDefault(); var $w=$(this).closest('.cheops-lt-view, .cheops-lt-plan');
        var f=wp.media({title:'Choose an image',multiple:false,library:{type:'image'}}); f.on('select',function(){ var a=f.state().get('selection').first().toJSON(); $w.find('.cheops-lt-image').val(a.url); $w.find('.cheops-lt-preview').html('<img src="'+a.url+'" alt="">'); }); f.open(); });
      $(document).on('click','.cheops-lt-del-plan',function(){ $(this).closest('.cheops-lt-plan').remove(); });
      $('.cheops-lt-add-plan').on('click',function(){ var $l=$('.cheops-lt-plans'), i=+$l.data('next'); $l.data('next',i+1); $l.append($('#cheops-lt-plan-template').html().replace(/__i__/g,i)); });
    });
    </script>
    <?php
}

function cheops_lake_town_plan_row($i, $row) {
    $img = $row['image'] ?? '';
    echo '<div class="cheops-lt-plan"><div class="cheops-lt-preview">' . ($img ? '<img src="' . esc_url(cheops_lake_town_img($img, 'medium')) . '" alt="">' : '') . '</div><div class="cheops-lt-plan-fields">'
        . '<label><span>Name</span><input type="text" name="lt[plans][' . esc_attr($i) . '][label]" value="' . esc_attr($row['label'] ?? '') . '" placeholder="Lake Town Building C"></label>'
        . '<label><span>Units</span><input type="text" name="lt[plans][' . esc_attr($i) . '][units]" value="' . esc_attr($row['units'] ?? '') . '" placeholder="C-301 - C-304"></label>'
        . '<input type="hidden" class="cheops-lt-image" name="lt[plans][' . esc_attr($i) . '][image]" value="' . esc_attr($img) . '">'
        . '<div class="cheops-lt-row-actions"><button type="button" class="button cheops-lt-pick">Choose plan</button><button type="button" class="button-link-delete cheops-lt-del-plan">Remove</button></div></div></div>';
}

add_action('admin_post_cheops_lake_town_save', static function () {
    if (!current_user_can('edit_posts')) wp_die('Not allowed.');
    check_admin_referer('cheops_lake_town_save');
    $in = wp_unslash($_POST['lt'] ?? []);
    $urls = static function ($text) { return array_values(array_filter(array_map('esc_url_raw', preg_split('/\s+/', (string) $text)))); };
    $out = [
        'intro' => sanitize_textarea_field($in['intro'] ?? ''),
        'map_title' => sanitize_text_field($in['map_title'] ?? ''),
        'google_maps' => esc_url_raw($in['google_maps'] ?? ''),
        'map_views' => [], 'plans' => [],
    ];
    foreach (['office_covers', 'office_photos', 'clinic_covers', 'clinic_photos'] as $key) $out[$key] = $urls($in[$key] ?? '');
    foreach ((array) ($in['map_views'] ?? []) as $v) $out['map_views'][] = ['label' => sanitize_text_field($v['label'] ?? ''), 'time' => sanitize_text_field($v['time'] ?? ''), 'image' => esc_url_raw($v['image'] ?? '')];
    foreach ((array) ($in['plans'] ?? []) as $p) {
        $row = ['label' => sanitize_text_field($p['label'] ?? ''), 'units' => sanitize_text_field($p['units'] ?? ''), 'image' => esc_url_raw($p['image'] ?? '')];
        if ($row['image'] || $row['units']) $out['plans'][] = $row;
    }
    update_option('cheops_lake_town', $out, false);
    if (function_exists('cheops_bump_content_version')) cheops_bump_content_version();
    do_action('litespeed_purge_all');
    wp_safe_redirect(admin_url('edit.php?post_type=cheops_unit&page=cheops-lake-town&saved=1'));
    exit;
});

add_action('admin_post_cheops_lake_town_import', static function () {
    if (!current_user_can('upload_files')) wp_die('Not allowed.');
    check_admin_referer('cheops_lake_town_import');
    [$copied, $failed] = cheops_lake_town_import_media();
    do_action('litespeed_purge_all');
    wp_safe_redirect(admin_url('edit.php?post_type=cheops_unit&page=cheops-lake-town&imported=' . $copied . '&failed=' . $failed));
    exit;
});
