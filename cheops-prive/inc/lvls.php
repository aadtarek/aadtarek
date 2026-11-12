<?php
/**
 * LVLS by Mountain View: photos, floor plans, rooms, location map and project
 * story shown on its unit pages, editable under Property Manager → LVLS.
 * Map drawings, plans and the logo ship in assets/lvls; photos live in the
 * Media Library (copied there once from the LVLS reference page).
 */
if (!defined('ABSPATH')) exit;

const CHEOPS_LVLS_PROJECT = 'LVLS';

function cheops_lvls_defaults() {
    $ref = 'https://cheops.front.aait-d.com/wp-content/uploads/2025/11/';
    $u = get_template_directory_uri() . '/assets/lvls/';
    return [
        // Homes, sea views and interiors only: no people.
        'photos' => [$ref . 'Lv-Mu-scaled.jpg', $ref . 'Lv-Mu2-scaled.jpg', $ref . 'Lv-Image-Sq1.jpg', $ref . 'Lv-Ft-2-scaled.jpg', $ref . 'Lv-Furn-2-scaled.jpg', $ref . 'Lv-Furn-3-1-scaled.jpg', $ref . 'Lv-Ls-1-scaled.webp'],
        'intro' => 'Coastal living by Mountain View on the North Coast, with uninterrupted sea views from every unit.',
        'map_title' => 'Just minutes away from everything that truly matters.',
        'google_maps' => 'https://www.google.com/maps?q=31.0722,28.2358',
        'map_views' => [
            ['label' => 'LVLS', 'time' => '', 'image' => $u . 'map-main.svg'],
            ['label' => 'North Coast Road', 'time' => '2 Min', 'image' => ''],
            ['label' => 'El Alamein', 'time' => '17 Min', 'image' => $u . 'map-el-alamein.svg'],
            ['label' => 'Ras El Hekma', 'time' => '20 Min', 'image' => $u . 'map-ras-el-hekma.svg'],
            ['label' => 'El Alamein Int. Airport', 'time' => '30 Min', 'image' => $u . 'map-airport.svg'],
        ],
        'features' => ['24/7 Security', 'Gated Community', 'Sea Views', '600 m Beachfront', 'Smart Home App', 'Fully Finished'],
        'sections' => [
            ['title' => 'A Custom-Built Elevated Design', 'text' => 'Offering one-of-a-kind uninterrupted views of the sea for each unit.'],
            ['title' => 'The Seawalk', 'text' => 'Embark on a journey along a stunning 600m beach path, embraced by breathtaking scenery.'],
            ['title' => 'Sea Mount', 'text' => 'Enjoy panoramic views of the sea from this remarkable gated community spanning over 133 Feddan, featuring five levels with elevations of up to +45 meters above sea level. Experience a 600-meter beachfront and immerse yourself in this extraordinary haven, where natural beauty and elevated living converge.'],
            ['title' => 'Elevation At Its Best', 'text' => 'Your elevated home is designed to embrace the sea\'s enchanting views, catering to your preferences and ensuring peace of mind.'],
            ['title' => 'Mountain View E-Services', 'text' => 'Experience the future of living with Smart Home Technology through the Mountain View Mobile App. It brings essential community services to your fingertips, including home management tools and exclusive community updates, whether you are scheduling maintenance, exploring local amenities, or connecting with neighbors.'],
            ['title' => 'Fully Finished Units', 'text' => 'Ready to embrace your unique style.'],
        ],
        'services' => [],
        // Sea Town House Corner, 185 sqm (all three LVLS units share this layout).
        'plans' => [
            ['label' => 'Ground Floor', 'image' => $u . 'plan-185-gf.png'],
            ['label' => 'First Floor', 'image' => $u . 'plan-185-ff.png'],
            ['label' => 'Roof', 'image' => $u . 'plan-185-rf.png'],
        ],
        'layout' => '3 Bedrooms + 3 Bathrooms + Living Room + Kitchen + Pergola + Roof + Parking',
        'rooms' => "Ground Floor | 55 sqm\nReception | 19.9 sqm\nMaid Room | 4.6 sqm\nMaid Bathroom | 3.54 sqm\nCorridor | 3.25 sqm\nMaster Bathroom 2 | 5.81 sqm\nLiving & Kitchenette | 11.92 sqm\nPergola | 10 sqm\nFirst Floor | 60 sqm\nStaircase 1 | 6.95 sqm\nEntrance | 3.32 sqm\nMaster Bedroom 1 | 19.88 sqm\nMaster Bathroom 1 | 4.72 sqm\nTerrace | 5.38 sqm\nBedroom 1 | 11.66 sqm\nParking | 10 sqm\nSecond Floor | 35 sqm\nKitchen | 11.6 sqm\nGuest Toilet | 4.57 sqm\nStaircase 2 | 8.08 sqm\nMaster Bedroom 2 | 13.01 sqm\nStaircase 3 | 5.15 sqm\nBathroom 1 | 5.55 sqm\nRoof | 15 sqm",
    ];
}

function cheops_lvls_settings() {
    static $cache = null;
    if ($cache !== null) return $cache;
    $saved = get_option('cheops_lvls', []);
    return $cache = array_merge(cheops_lvls_defaults(), is_array($saved) ? $saved : []);
}

function cheops_lvls_kit($post_id) {
    if (stripos((string) get_post_meta($post_id, '_cheops_project', true), CHEOPS_LVLS_PROJECT) === false) return null;
    $s = cheops_lvls_settings();
    return [
        'photos' => array_map('cheops_lake_town_img', array_values(array_filter((array) $s['photos']))),
        'logo' => get_template_directory_uri() . '/assets/lvls/logo.svg',
        'intro' => (string) $s['intro'],
        'map_title' => (string) $s['map_title'],
        'google_maps' => (string) $s['google_maps'],
        'map' => cheops_map_views((array) $s['map_views']),
        'features' => array_values(array_filter(array_map('trim', (array) ($s['features'] ?? [])))),
        'sections' => array_values(array_filter((array) $s['sections'], static function ($r) { return !empty($r['title']) || !empty($r['text']); })),
        'services' => array_values(array_filter(array_map('trim', (array) $s['services']))),
        'name' => 'LVLS',
        'plans' => array_values(array_filter((array) ($s['plans'] ?? []), static function ($r) { return !empty($r['image']); })),
        'layout' => (string) ($s['layout'] ?? ''),
        'rooms' => (string) ($s['rooms'] ?? ''),
    ];
}

/* ---------- Photos copied into the Media Library once ---------- */

function cheops_lvls_import_media() {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $s = cheops_lvls_settings();
    $host = wp_parse_url(home_url(), PHP_URL_HOST);
    $copied = 0; $failed = 0;
    foreach ($s['photos'] as $i => $url) {
        if (!$url || wp_parse_url($url, PHP_URL_HOST) === $host) continue;
        $tmp = download_url($url, 60);
        if (is_wp_error($tmp)) { $failed++; continue; }
        $id = media_handle_sideload(['name' => sanitize_file_name('lvls-' . basename(strtok($url, '?'))), 'tmp_name' => $tmp], 0, CHEOPS_LVLS_PROJECT);
        if (is_wp_error($id)) { @unlink($tmp); $failed++; continue; }
        $s['photos'][$i] = (string) wp_get_attachment_url($id);
        $copied++;
    }
    update_option('cheops_lvls', $s, false);
    update_option('cheops_lvls_imported', ['copied' => $copied, 'failed' => $failed, 'time' => time()], false);
    if (function_exists('cheops_bump_content_version')) cheops_bump_content_version();
    return [$copied, $failed];
}
add_action('cheops_lvls_import_event', 'cheops_lvls_import_media');
add_action('init', static function () {
    if (get_option('cheops_lvls_imported') || wp_next_scheduled('cheops_lvls_import_event')) return;
    wp_schedule_single_event(time() + 90, 'cheops_lvls_import_event');
}, 40);

/* ---------- Dashboard: Property Manager → LVLS ---------- */

add_action('admin_menu', static function () {
    add_submenu_page('edit.php?post_type=cheops_unit', CHEOPS_LVLS_PROJECT, CHEOPS_LVLS_PROJECT, 'edit_posts', 'cheops-lvls', 'cheops_lvls_admin_page');
});
add_action('admin_enqueue_scripts', static function ($hook) {
    if (strpos((string) $hook, 'cheops-lvls') === false) return;
    wp_enqueue_media();
    wp_enqueue_script('jquery-ui-sortable');
});

function cheops_lvls_admin_page() {
    $s = cheops_lvls_settings();
    ?>
    <div class="wrap cheops-lt">
      <div class="cheops-lt-head"><div><h1>LVLS</h1><p>Photos, floor plans, rooms, location map and project story shown on every LVLS unit page.</p></div>
        <a class="button" href="<?php echo esc_url(add_query_arg('project', 'Mountain View - LVLS', home_url('/properties/'))); ?>" target="_blank" rel="noopener">View units ↗</a></div>
      <?php if (isset($_GET['saved'])): ?><div class="notice notice-success is-dismissible"><p>Saved. The unit pages are updated.</p></div><?php endif; ?>
      <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <input type="hidden" name="action" value="cheops_lvls_save"><?php wp_nonce_field('cheops_lvls_save'); ?>
        <section class="cheops-lt-card"><h2>Photos</h2><p class="cheops-lt-hint">Shown after each unit's own photos. Drag to reorder.</p>
          <div class="cheops-lt-thumbs" data-input="lv-photos">
            <?php foreach ((array) $s['photos'] as $url): if (!$url) continue; ?><figure data-url="<?php echo esc_attr($url); ?>"><img src="<?php echo esc_url(cheops_lake_town_img($url, 'medium')); ?>" alt=""><button type="button" class="cheops-lt-remove" aria-label="Remove">×</button></figure><?php endforeach; ?>
          </div>
          <textarea hidden id="lv-photos" name="lv[photos]"><?php echo esc_textarea(implode("\n", (array) $s['photos'])); ?></textarea>
          <button type="button" class="button cheops-lt-add" data-input="lv-photos">+ Add photos</button>
        </section>
        <section class="cheops-lt-card"><h2>Location map</h2>
          <div class="cheops-lt-fields">
            <label><span>Title under "Location Map"</span><input type="text" name="lv[map_title]" value="<?php echo esc_attr($s['map_title']); ?>"></label>
            <label><span>Google Maps link</span><input type="url" name="lv[google_maps]" value="<?php echo esc_attr($s['google_maps']); ?>"></label>
          </div>
          <div class="cheops-lt-views">
            <?php foreach (array_values(array_merge((array) $s['map_views'], [['label' => '', 'time' => '', 'image' => ''], ['label' => '', 'time' => '', 'image' => '']])) as $i => $v): ?>
            <div class="cheops-lt-view"><div class="cheops-lt-preview"><?php if (!empty($v['image'])): ?><img src="<?php echo esc_url($v['image']); ?>" alt=""><?php endif; ?></div>
              <label><span><?php echo $i ? 'Destination' : 'Main view'; ?></span><input type="text" name="lv[map_views][<?php echo (int) $i; ?>][label]" value="<?php echo esc_attr($v['label'] ?? ''); ?>"></label>
              <?php if ($i): ?><label><span>Drive time</span><input type="text" name="lv[map_views][<?php echo (int) $i; ?>][time]" value="<?php echo esc_attr($v['time'] ?? ''); ?>"></label><?php endif; ?>
              <input type="hidden" class="cheops-lt-image" name="lv[map_views][<?php echo (int) $i; ?>][image]" value="<?php echo esc_attr($v['image'] ?? ''); ?>">
              <button type="button" class="button cheops-lt-pick"><?php echo $i ? 'Map drawing (optional)' : 'Change map'; ?></button></div>
            <?php endforeach; ?>
          </div>
        </section>
        <section class="cheops-lt-card"><h2>About the location</h2><textarea name="lv[intro]" rows="3" class="large-text"><?php echo esc_textarea($s['intro']); ?></textarea></section>
        <section class="cheops-lt-card"><h2>Life at LVLS</h2><p class="cheops-lt-hint">Leave a title and text empty to hide that block.</p>
          <?php foreach (array_values(array_pad((array) $s['sections'], count((array) $s['sections']) + 1, ['title' => '', 'text' => ''])) as $i => $r): ?>
          <div class="cheops-lt-fields"><label><span>Title</span><input type="text" name="lv[sections][<?php echo (int) $i; ?>][title]" value="<?php echo esc_attr($r['title'] ?? ''); ?>"></label>
            <label><span>Text</span><textarea name="lv[sections][<?php echo (int) $i; ?>][text]" rows="3" class="large-text"><?php echo esc_textarea($r['text'] ?? ''); ?></textarea></label></div>
          <?php endforeach; ?>
        </section>
        <section class="cheops-lt-card"><h2>Floor plans</h2><p class="cheops-lt-hint">Shown on every LVLS unit instead of the brochure page. Leave the image empty to hide a floor.</p>
          <div class="cheops-lt-views">
            <?php foreach (array_values(array_merge((array) ($s['plans'] ?? []), [['label' => '', 'image' => '']])) as $i => $p): ?>
            <div class="cheops-lt-view"><div class="cheops-lt-preview"><?php if (!empty($p['image'])): ?><img src="<?php echo esc_url($p['image']); ?>" alt=""><?php endif; ?></div>
              <label><span>Floor</span><input type="text" name="lv[plans][<?php echo (int) $i; ?>][label]" value="<?php echo esc_attr($p['label'] ?? ''); ?>"></label>
              <input type="hidden" class="cheops-lt-image" name="lv[plans][<?php echo (int) $i; ?>][image]" value="<?php echo esc_attr($p['image'] ?? ''); ?>">
              <button type="button" class="button cheops-lt-pick">Choose plan</button></div>
            <?php endforeach; ?>
          </div>
        </section>
        <section class="cheops-lt-card"><h2>Rooms</h2><p class="cheops-lt-hint">Used on any LVLS unit whose own Rooms box is empty.</p>
          <div class="cheops-lt-fields"><label><span>Layout</span><input type="text" name="lv[layout]" value="<?php echo esc_attr($s['layout'] ?? ''); ?>"></label>
            <label><span>Room areas (Room | Area, one per line)</span><textarea name="lv[rooms]" rows="8" class="large-text"><?php echo esc_textarea($s['rooms'] ?? ''); ?></textarea></label></div>
        </section>
        <section class="cheops-lt-card"><h2>Features</h2><p class="cheops-lt-hint">One per line, for example 24/7 Security, Elevators, Wi-Fi. Shown under Amenities on every unit.</p><textarea name="lv[features]" rows="6" class="large-text"><?php echo esc_textarea(implode("\n", (array) ($s['features'] ?? []))); ?></textarea></section>
        <div class="cheops-lt-actions"><span>Changes show on every LVLS unit after you save.</span><button class="button button-primary" type="submit">Save changes</button></div>
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

add_action('admin_post_cheops_lvls_save', static function () {
    if (!current_user_can('edit_posts')) wp_die('Not allowed.');
    check_admin_referer('cheops_lvls_save');
    $in = wp_unslash($_POST['lv'] ?? []);
    $out = [
        'photos' => array_values(array_filter(array_map('esc_url_raw', preg_split('/\s+/', (string) ($in['photos'] ?? ''))))),
        'intro' => sanitize_textarea_field($in['intro'] ?? ''),
        'map_title' => sanitize_text_field($in['map_title'] ?? ''),
        'google_maps' => esc_url_raw($in['google_maps'] ?? ''),
        'map_views' => [], 'sections' => [], 'plans' => [],
        'layout' => sanitize_text_field($in['layout'] ?? ''),
        'rooms' => sanitize_textarea_field($in['rooms'] ?? ''),
        'services' => array_values(array_filter(array_map('sanitize_text_field', preg_split('/\r?\n/', (string) ($in['services'] ?? ''))))),
    ];
    foreach ((array) ($in['map_views'] ?? []) as $v) {
        $row = ['label' => sanitize_text_field($v['label'] ?? ''), 'time' => sanitize_text_field($v['time'] ?? ''), 'image' => esc_url_raw($v['image'] ?? '')];
        if ($row['label'] !== '' || $row['image'] !== '') $out['map_views'][] = $row;
    }
    $out['features'] = array_values(array_filter(array_map('sanitize_text_field', preg_split('/\r?\n/', (string) ($in['features'] ?? '')))));
    foreach ((array) ($in['plans'] ?? []) as $p) {
        $row = ['label' => sanitize_text_field($p['label'] ?? ''), 'image' => esc_url_raw($p['image'] ?? '')];
        if ($row['image'] !== '') $out['plans'][] = $row;
    }
    foreach ((array) ($in['sections'] ?? []) as $r) {
        $row = ['title' => sanitize_text_field($r['title'] ?? ''), 'text' => sanitize_textarea_field($r['text'] ?? '')];
        if ($row['title'] !== '' || $row['text'] !== '') $out['sections'][] = $row;
    }
    update_option('cheops_lvls', $out, false);
    if (function_exists('cheops_bump_content_version')) cheops_bump_content_version();
    do_action('litespeed_purge_all');
    wp_safe_redirect(admin_url('edit.php?post_type=cheops_unit&page=cheops-lvls&saved=1'));
    exit;
});
