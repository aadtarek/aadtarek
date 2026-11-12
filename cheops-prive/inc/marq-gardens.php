<?php
/**
 * The MarQ Gardens: photos, location map, project story and on-demand services
 * shown on its unit pages, editable under Property Manager → The MarQ Gardens.
 * Map drawings and the logo ship in assets/marq-gardens; photos live in the
 * Media Library (copied there once from the MarQ reference page).
 */
if (!defined('ABSPATH')) exit;

const CHEOPS_MQG_PROJECT = 'The MarQ Gardens';

function cheops_mqg_defaults() {
    $ref = 'https://cheops.front.aait-d.com/wp-content/uploads/2025/11/';
    $u = get_template_directory_uri() . '/assets/marq-gardens/';
    return [
        // House exteriors only: no people, nothing unrelated to the homes.
        'photos' => [$ref . 'Marq-Mu-3-scaled.jpg', $ref . 'Marq-Mu-4-scaled.jpg', $ref . 'Mq-Ft-2-scaled.jpg', $ref . 'Mq-Ft-3-scaled.jpg', $ref . 'Marq-Sub-1.jpg'],
        'intro' => 'A contemporary lifestyle in the heart of New Cairo, with convenient access to Suez Road, Sokhna Capital Road, and the New Capital, as well as easy connectivity to the Ring Road and Cairo Airport.',
        'map_title' => 'How to get to The MarQ Gardens?',
        'google_maps' => 'https://www.google.com/maps?q=30.0735,31.5887',
        'map_views' => [
            ['label' => 'The MarQ Gardens', 'time' => '', 'image' => $u . 'map-main.svg'],
            // Roads and landmarks only. Suez Road and Ring Road times are from the MarQ page; the others are drive estimates.
            ['label' => 'Suez Road', 'time' => '5 Min', 'image' => $u . 'map-suez.svg'],
            ['label' => 'Ring Road', 'time' => '4 Min', 'image' => $u . 'map-ring-road.svg'],
            ['label' => 'Cairo Airport', 'time' => '30 Min', 'image' => ''],
            ['label' => 'New Capital', 'time' => '25 Min', 'image' => ''],
        ],
        'features' => ['24/7 Security', 'Gated Community', 'Community Center', 'Fitness Facilities', 'Sports Courts', 'Yoga Pavilion', '1.5 km MarQ Walk', 'Landscaped Gardens'],
        'sections' => [
            ['title' => 'Your Home, Your Identity', 'text' => 'We take pride in being the first personally-branded residence, offering a truly unique living experience that blends luxury with individuality. Each home is personalized with your initials and thoughtfully designed to complement your style and taste, ensuring a living space that is as distinctive as you are.'],
            ['title' => 'The MarQ Walk', 'text' => 'Featuring a 1.5 km scenic path that encircles the community, offering the perfect space for running, walking, and cycling, ideal for those seeking an active lifestyle in a serene setting. This path is designed to reduce car dependence, encouraging more sustainable, pedestrian-friendly transport options and fostering a sense of community connection.'],
            ['title' => 'A Unique Experience in Every Corner', 'text' => 'At The MarQ Gardens, every corner is meticulously crafted to elevate your living experience. Our thoughtfully curated garden spaces are more than just landscapes, they are destinations in their own right. From serene tranquility to vibrant, colorful energy, each garden is a testament to our commitment to creating an environment where nature and luxury coexist in perfect harmony.'],
            ['title' => 'On-Demand Hotel Services', 'text' => 'Experience the convenience of hotel-serviced living within your community. Enjoy premium amenities and services typically found in luxury hotels, all within the comfort of your home.'],
            ['title' => 'The Design Story', 'text' => 'The architecture of The MarQ Gardens is carefully crafted to capture the essence of timeless elegance and contemporary luxury. Each home features a striking pitched roof, accentuated by large Georgian windows that invite natural light, creating a warm and cozy atmosphere for its residents. The facade seamlessly blends rustic stonework with shingle siding, evoking the charm and beauty of a true classic house.'],
            ['title' => 'Community Center', 'text' => 'The Community Center acts as the vibrant hub of the community, featuring modern fitness facilities, relaxing open spaces, and sports courts. It provides a diverse array of experiences, from physical exercise and mindful practice in the yoga pavilion to engaging recreational sports.'],
        ],
        'services' => ['Dry Cleaning', 'Housekeeping', 'Community Communication Platform', 'Automated Visitor Management Platform', 'Maintenance', 'Car Wash'],
    ];
}

function cheops_mqg_settings() {
    static $cache = null;
    if ($cache !== null) return $cache;
    $saved = get_option('cheops_marq_gardens', []);
    return $cache = array_merge(cheops_mqg_defaults(), is_array($saved) ? $saved : []);
}

function cheops_mqg_kit($post_id) {
    if (strcasecmp(trim((string) get_post_meta($post_id, '_cheops_project', true)), CHEOPS_MQG_PROJECT) !== 0) return null;
    $s = cheops_mqg_settings();
    return [
        'photos' => array_map('cheops_lake_town_img', array_values(array_filter((array) $s['photos']))),
        'logo' => get_template_directory_uri() . '/assets/marq-gardens/logo.svg',
        'intro' => (string) $s['intro'],
        'map_title' => (string) $s['map_title'],
        'google_maps' => (string) $s['google_maps'],
        'map' => cheops_map_views((array) $s['map_views']),
        'features' => array_values(array_filter(array_map('trim', (array) ($s['features'] ?? [])))),
        'sections' => array_values(array_filter((array) $s['sections'], static function ($r) { return !empty($r['title']) || !empty($r['text']); })),
        'services' => array_values(array_filter(array_map('trim', (array) $s['services']))),
    ];
}

/** Project story and on-demand services on a MarQ Gardens unit page. */
function cheops_render_mqg_story($kit) {
    if ($kit['sections']) {
        echo '<section class="sp-section sp-story"><h2>Life at ' . esc_html($kit['name'] ?? CHEOPS_MQG_PROJECT) . '</h2><div class="sp-story-grid">';
        foreach ($kit['sections'] as $r) echo '<article><h3>' . esc_html($r['title'] ?? '') . '</h3><p>' . esc_html($r['text'] ?? '') . '</p></article>';
        echo '</div></section>';
    }
    if ($kit['services']) {
        echo '<section class="sp-section"><h2>On-Demand Services</h2><div class="sp-chips">';
        foreach ($kit['services'] as $sv) echo '<span class="sp-chip">' . esc_html($sv) . '</span>';
        echo '</div></section>';
    }
}

/* ---------- Rooms: layout line and room areas on any unit ---------- */

/** Rooms as [name, area] pairs from lines like "Dining | 13.7 sqm". */
function cheops_unit_rooms($post_id) {
    $rows = [];
    foreach (preg_split('/\r?\n/', (string) get_post_meta($post_id, '_cheops_rooms', true)) as $line) {
        $parts = array_map('trim', explode('|', $line, 2));
        if ($parts[0] !== '') $rows[] = [$parts[0], $parts[1] ?? ''];
    }
    return $rows;
}

add_action('add_meta_boxes', static function () {
    add_meta_box('cheops_unit_rooms', 'Rooms', static function ($post) {
        wp_nonce_field('cheops_unit_rooms', 'cheops_unit_rooms_nonce');
        echo '<p><label><strong>Layout</strong><br><input type="text" name="_cheops_layout" value="' . esc_attr(get_post_meta($post->ID, '_cheops_layout', true)) . '" style="width:100%" placeholder="3 Bedrooms + 4 Bathrooms + Reception + Kitchen + Terrace + Roof"></label></p>';
        echo '<p><label><strong>Room areas</strong> <small>(one per line: Room | Area)</small><br><textarea name="_cheops_rooms" rows="8" style="width:100%" placeholder="Reception | 31 sqm&#10;Master Bedroom | 14.44 sqm">' . esc_textarea(get_post_meta($post->ID, '_cheops_rooms', true)) . '</textarea></label></p>';
        echo '<p class="description">Shown on the unit page under "Rooms". Bedrooms and bathrooms counts stay in the main details box.</p>';
    }, 'cheops_unit', 'normal', 'default');
});
add_action('save_post_cheops_unit', static function ($post_id) {
    if (!isset($_POST['cheops_unit_rooms_nonce']) || !wp_verify_nonce($_POST['cheops_unit_rooms_nonce'], 'cheops_unit_rooms') || !current_user_can('edit_post', $post_id)) return;
    update_post_meta($post_id, '_cheops_layout', sanitize_text_field(wp_unslash($_POST['_cheops_layout'] ?? '')));
    update_post_meta($post_id, '_cheops_rooms', sanitize_textarea_field(wp_unslash($_POST['_cheops_rooms'] ?? '')));
});

/* ---------- Photos copied into the Media Library once ---------- */

function cheops_mqg_import_media() {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $s = cheops_mqg_settings();
    $host = wp_parse_url(home_url(), PHP_URL_HOST);
    $copied = 0; $failed = 0;
    foreach ($s['photos'] as $i => $url) {
        if (!$url || wp_parse_url($url, PHP_URL_HOST) === $host) continue;
        $tmp = download_url($url, 60);
        if (is_wp_error($tmp)) { $failed++; continue; }
        $id = media_handle_sideload(['name' => sanitize_file_name('marq-gardens-' . basename(strtok($url, '?'))), 'tmp_name' => $tmp], 0, CHEOPS_MQG_PROJECT);
        if (is_wp_error($id)) { @unlink($tmp); $failed++; continue; }
        $s['photos'][$i] = (string) wp_get_attachment_url($id);
        $copied++;
    }
    update_option('cheops_marq_gardens', $s, false);
    update_option('cheops_marq_gardens_imported', ['copied' => $copied, 'failed' => $failed, 'time' => time()], false);
    if (function_exists('cheops_bump_content_version')) cheops_bump_content_version();
    return [$copied, $failed];
}
add_action('cheops_mqg_import_event', 'cheops_mqg_import_media');
add_action('init', static function () {
    if (get_option('cheops_marq_gardens_imported') || wp_next_scheduled('cheops_mqg_import_event')) return;
    wp_schedule_single_event(time() + 90, 'cheops_mqg_import_event');
}, 40);

/* ---------- Dashboard: Property Manager → The MarQ Gardens ---------- */

add_action('admin_menu', static function () {
    add_submenu_page('edit.php?post_type=cheops_unit', CHEOPS_MQG_PROJECT, CHEOPS_MQG_PROJECT, 'edit_posts', 'cheops-marq-gardens', 'cheops_mqg_admin_page');
});
add_action('admin_enqueue_scripts', static function ($hook) {
    if (strpos((string) $hook, 'cheops-marq-gardens') === false) return;
    wp_enqueue_media();
    wp_enqueue_script('jquery-ui-sortable');
});

function cheops_mqg_admin_page() {
    $s = cheops_mqg_settings();
    ?>
    <div class="wrap cheops-lt">
      <div class="cheops-lt-head"><div><h1>The MarQ Gardens</h1><p>Photos, location map, project story and services shown on every MarQ Gardens unit page. Bedrooms and room areas are set on each unit (Rooms box).</p></div>
        <a class="button" href="<?php echo esc_url(add_query_arg('project', CHEOPS_MQG_PROJECT, home_url('/properties/'))); ?>" target="_blank" rel="noopener">View units ↗</a></div>
      <?php if (isset($_GET['saved'])): ?><div class="notice notice-success is-dismissible"><p>Saved. The unit pages are updated.</p></div><?php endif; ?>
      <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <input type="hidden" name="action" value="cheops_mqg_save"><?php wp_nonce_field('cheops_mqg_save'); ?>
        <section class="cheops-lt-card"><h2>Photos</h2><p class="cheops-lt-hint">Shown after each unit's own photos. Drag to reorder.</p>
          <div class="cheops-lt-thumbs" data-input="mq-photos">
            <?php foreach ((array) $s['photos'] as $url): if (!$url) continue; ?><figure data-url="<?php echo esc_attr($url); ?>"><img src="<?php echo esc_url(cheops_lake_town_img($url, 'medium')); ?>" alt=""><button type="button" class="cheops-lt-remove" aria-label="Remove">×</button></figure><?php endforeach; ?>
          </div>
          <textarea hidden id="mq-photos" name="mq[photos]"><?php echo esc_textarea(implode("\n", (array) $s['photos'])); ?></textarea>
          <button type="button" class="button cheops-lt-add" data-input="mq-photos">+ Add photos</button>
        </section>
        <section class="cheops-lt-card"><h2>Location map</h2>
          <div class="cheops-lt-fields">
            <label><span>Title under "Location Map"</span><input type="text" name="mq[map_title]" value="<?php echo esc_attr($s['map_title']); ?>"></label>
            <label><span>Google Maps link</span><input type="url" name="mq[google_maps]" value="<?php echo esc_attr($s['google_maps']); ?>"></label>
          </div>
          <div class="cheops-lt-views">
            <?php foreach (array_values(array_merge((array) $s['map_views'], [['label' => '', 'time' => '', 'image' => ''], ['label' => '', 'time' => '', 'image' => '']])) as $i => $v): ?>
            <div class="cheops-lt-view"><div class="cheops-lt-preview"><?php if (!empty($v['image'])): ?><img src="<?php echo esc_url($v['image']); ?>" alt=""><?php endif; ?></div>
              <label><span><?php echo $i ? 'Destination' : 'Main view'; ?></span><input type="text" name="mq[map_views][<?php echo (int) $i; ?>][label]" value="<?php echo esc_attr($v['label'] ?? ''); ?>"></label>
              <?php if ($i): ?><label><span>Drive time</span><input type="text" name="mq[map_views][<?php echo (int) $i; ?>][time]" value="<?php echo esc_attr($v['time'] ?? ''); ?>"></label><?php endif; ?>
              <input type="hidden" class="cheops-lt-image" name="mq[map_views][<?php echo (int) $i; ?>][image]" value="<?php echo esc_attr($v['image'] ?? ''); ?>">
              <button type="button" class="button cheops-lt-pick"><?php echo $i ? 'Map drawing (optional)' : 'Change map'; ?></button></div>
            <?php endforeach; ?>
          </div>
        </section>
        <section class="cheops-lt-card"><h2>About the location</h2><textarea name="mq[intro]" rows="3" class="large-text"><?php echo esc_textarea($s['intro']); ?></textarea></section>
        <section class="cheops-lt-card"><h2>Life at The MarQ Gardens</h2><p class="cheops-lt-hint">Leave a title and text empty to hide that block.</p>
          <?php foreach (array_values(array_pad((array) $s['sections'], count((array) $s['sections']) + 1, ['title' => '', 'text' => ''])) as $i => $r): ?>
          <div class="cheops-lt-fields"><label><span>Title</span><input type="text" name="mq[sections][<?php echo (int) $i; ?>][title]" value="<?php echo esc_attr($r['title'] ?? ''); ?>"></label>
            <label><span>Text</span><textarea name="mq[sections][<?php echo (int) $i; ?>][text]" rows="3" class="large-text"><?php echo esc_textarea($r['text'] ?? ''); ?></textarea></label></div>
          <?php endforeach; ?>
        </section>
        <section class="cheops-lt-card"><h2>On-Demand Services</h2><p class="cheops-lt-hint">One per line.</p><textarea name="mq[services]" rows="6" class="large-text"><?php echo esc_textarea(implode("\n", (array) $s['services'])); ?></textarea></section>
        <section class="cheops-lt-card"><h2>Features</h2><p class="cheops-lt-hint">One per line, for example 24/7 Security, Elevators, Wi-Fi. Shown under Amenities on every unit.</p><textarea name="mq[features]" rows="6" class="large-text"><?php echo esc_textarea(implode("\n", (array) ($s['features'] ?? []))); ?></textarea></section>
        <div class="cheops-lt-actions"><span>Changes show on every MarQ Gardens unit after you save.</span><button class="button button-primary" type="submit">Save changes</button></div>
      </form>
    </div>
    <script>
    jQuery(function($){
      function sync($b){ $('#'+$b.data('input')).val($b.children('figure').map(function(){return $(this).data('url');}).get().join('\n')); }
      $('.cheops-lt-thumbs').each(function(){ var $b=$(this); if($.fn.sortable) $b.sortable({items:'figure',update:function(){sync($b);}}); });
      $(document).on('click','.cheops-lt-remove',function(){ var $b=$(this).closest('.cheops-lt-thumbs'); $(this).closest('figure').remove(); sync($b); });
      $(document).on('click','.cheops-lt-add',function(e){ e.preventDefault(); var $b=$('.cheops-lt-thumbs[data-input="'+$(this).data('input')+'"]');
        var f=wp.media({title:'Choose photos',multiple:true,library:{type:'image'}}); f.on('select',function(){ f.state().get('selection').each(function(a){ a=a.toJSON(); var t=(a.sizes&&a.sizes.medium)?a.sizes.medium.url:a.url; $b.append('<figure data-url="'+a.url+'"><img src="'+t+'" alt=""><button type="button" class="cheops-lt-remove" aria-label="Remove">×</button></figure>'); }); sync($b); }); f.open(); });
      $(document).on('click','.cheops-lt-pick',function(e){ e.preventDefault(); var $w=$(this).closest('.cheops-lt-view');
        var f=wp.media({title:'Choose an image',multiple:false,library:{type:'image'}}); f.on('select',function(){ var a=f.state().get('selection').first().toJSON(); $w.find('.cheops-lt-image').val(a.url); $w.find('.cheops-lt-preview').html('<img src="'+a.url+'" alt="">'); }); f.open(); });
    });
    </script>
    <?php
}

add_action('admin_post_cheops_mqg_save', static function () {
    if (!current_user_can('edit_posts')) wp_die('Not allowed.');
    check_admin_referer('cheops_mqg_save');
    $in = wp_unslash($_POST['mq'] ?? []);
    $out = [
        'photos' => array_values(array_filter(array_map('esc_url_raw', preg_split('/\s+/', (string) ($in['photos'] ?? ''))))),
        'intro' => sanitize_textarea_field($in['intro'] ?? ''),
        'map_title' => sanitize_text_field($in['map_title'] ?? ''),
        'google_maps' => esc_url_raw($in['google_maps'] ?? ''),
        'map_views' => [], 'sections' => [],
        'services' => array_values(array_filter(array_map('sanitize_text_field', preg_split('/\r?\n/', (string) ($in['services'] ?? ''))))),
    ];
    foreach ((array) ($in['map_views'] ?? []) as $v) {
        $row = ['label' => sanitize_text_field($v['label'] ?? ''), 'time' => sanitize_text_field($v['time'] ?? ''), 'image' => esc_url_raw($v['image'] ?? '')];
        if ($row['label'] !== '' || $row['image'] !== '') $out['map_views'][] = $row;
    }
    $out['features'] = array_values(array_filter(array_map('sanitize_text_field', preg_split('/\r?\n/', (string) ($in['features'] ?? '')))));
    foreach ((array) ($in['sections'] ?? []) as $r) {
        $row = ['title' => sanitize_text_field($r['title'] ?? ''), 'text' => sanitize_textarea_field($r['text'] ?? '')];
        if ($row['title'] !== '' || $row['text'] !== '') $out['sections'][] = $row;
    }
    update_option('cheops_marq_gardens', $out, false);
    if (function_exists('cheops_bump_content_version')) cheops_bump_content_version();
    do_action('litespeed_purge_all');
    wp_safe_redirect(admin_url('edit.php?post_type=cheops_unit&page=cheops-marq-gardens&saved=1'));
    exit;
});

/** One-time: compound destinations on the location map become roads and landmarks, if the saved tabs are still the old ones. */
add_action('init', static function () {
    if (get_option('cheops_marq_gardens_roads_v1')) return;
    update_option('cheops_marq_gardens_roads_v1', 1, true);
    $saved = get_option('cheops_marq_gardens');
    if (!is_array($saved) || empty($saved['map_views'])) return;
    $labels = array_map(static function ($v) { return $v['label'] ?? ''; }, (array) $saved['map_views']);
    if (!array_intersect($labels, ['MV Hyde Park', 'The MarQ Gardens', 'MV 1', 'MV i City']) || count($labels) !== 5) return;
    $defaults = cheops_mqg_defaults();
    $saved['map_views'] = $defaults['map_views'];
    update_option('cheops_marq_gardens', $saved, false);
    if (function_exists('cheops_bump_content_version')) cheops_bump_content_version();
}, 36);
