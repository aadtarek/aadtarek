<?php
/**
 * Lake Town material for its units, taken from the Lake Town mall pages:
 * each unit gets the photos, floor plan and location map of its building
 * (C = administrative offices, CX = the CX floor, A = medical clinics).
 * Files live in assets/lake-town/.
 */
if (!defined('ABSPATH')) exit;

/** Building letter from a Lake Town unit title such as "C-301 — Lake Town", or ''. */
function cheops_lake_town_building($post_id) {
    $number = cheops_lake_town_unit_number($post_id);
    return $number ? strtoupper(strtok($number, '-')) : '';
}

/** Unit number such as "C-301" from a Lake Town unit title ("C-301 — Lake Town"), or ''. */
function cheops_lake_town_unit_number($post_id) {
    $project = trim((string) get_post_meta($post_id, '_cheops_project', true));
    if (strcasecmp($project, 'Lake Town') !== 0) return '';
    return preg_match('/^\s*(CX|C|A)\s*-?\s*(\d+)/i', (string) get_post_field('post_title', $post_id), $m) ? strtoupper($m[1]) . '-' . $m[2] : '';
}

function cheops_lake_town_kit($post_id) {
    $building = cheops_lake_town_building($post_id);
    if (!$building) return null;
    $u = get_template_directory_uri() . '/assets/lake-town/';
    $offices = $building !== 'A';
    $photos = $offices
        ? ['mall.jpg', 'office-1.jpg', 'office-2.jpg', 'office-3.jpg', 'office-4.jpg', 'offices-2.jpg', 'offices-3.jpg', 'mall-court.jpg', 'mall-sign.jpg']
        : ['mall.jpg', 'clinic-1.jpg', 'clinic-2.jpg', 'clinic-3.jpg', 'clinic-4.jpg', 'clinic-5.jpg', 'clinic-6.jpg', 'clinic-7.jpg', 'mall-court.jpg', 'mall-sign.jpg'];
    // Covers rotate by unit number so neighbouring units do not all show the same photo.
    $covers = $offices ? ['hero-offices.jpg', 'offices-2.jpg', 'offices-3.jpg', 'office-4.jpg'] : ['hero-clinics.jpg', 'clinic-1.jpg', 'clinic-6.jpg', 'clinic-5.jpg'];
    $n = (int) preg_replace('/\D/', '', cheops_lake_town_unit_number($post_id));
    return [
        'building' => $building,
        'number' => cheops_lake_town_unit_number($post_id),
        'hero' => $u . $covers[$n % count($covers)],
        'photos' => array_map(static function ($f) use ($u) { return $u . $f; }, array_values(array_diff($photos, [$covers[$n % count($covers)]]))),
        'plan' => $u . ['C' => 'plan-c.webp', 'CX' => 'plan-cx.webp', 'A' => 'plan-a.webp'][$building],
        'logo' => $u . 'logo-lake-town.svg',
        'intro' => 'Laketown is a bustling commercial mall located at the heart of the Golden Square in the Fifth Settlement. Serving as the focal point of Lakeview Residence, the mall offers a comprehensive experience for shopping, dining, and working.',
        // Location map: the main view, then one view per destination with its drive time.
        'map' => [
            ['Lake Town', '', $u . 'map-main.svg'],
            ['South 90 St.', '3 Min', $u . 'map-south-90.svg'],
            ['MV Hyde Park', '3 Min', $u . 'map-hyde-park.svg'],
            ['The MarQ Gardens', '6 Min', $u . 'map-marq-gardens.svg'],
            ['MV 1', '5 Min', $u . 'map-mv1.svg'],
        ],
    ];
}

/** Stock photos the old Lake Town importer attached; real Lake Town photos replace them. */
function cheops_lake_town_pool_ids() {
    $ids = get_option('cheops_lake_town_image_pool', []);
    return is_array($ids) ? array_map('absint', array_values($ids)) : [];
}

/** Cover photo for a unit card: the unit's own photo, or its building's photo for Lake Town. */
function cheops_unit_cover_url($post_id, $size = 'large') {
    $thumb = (int) get_post_thumbnail_id($post_id);
    $kit = cheops_lake_town_kit($post_id);
    if ($kit && (!$thumb || in_array($thumb, cheops_lake_town_pool_ids(), true))) return $kit['hero'];
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
    echo '<section class="sp-section sp-lt-map" id="location"><h2>Location Map</h2><div class="sp-lt-map-media">';
    foreach ($kit['map'] as $i => $view) {
        echo '<img src="' . esc_url($view[2]) . '" alt="' . esc_attr('Lake Town · ' . $view[0]) . '"' . ($i ? ' hidden loading="lazy"' : '') . ' decoding="async" data-view="' . (int) $i . '">';
    }
    echo '</div><div class="sp-lt-map-tabs" role="tablist">';
    foreach ($kit['map'] as $i => $view) {
        if (!$i) continue;
        echo '<button type="button" role="tab" aria-selected="false" data-view="' . (int) $i . '"><strong>' . esc_html($view[0]) . '</strong><span>' . esc_html($view[1]) . '</span></button>';
    }
    echo '</div><p class="sp-lt-map-note">How to get to the bustling commercial mall?</p></section>';
    echo "<script>(function(){var s=document.currentScript.previousElementSibling,imgs=s.querySelectorAll('.sp-lt-map-media img'),tabs=s.querySelectorAll('.sp-lt-map-tabs button');tabs.forEach(function(t){t.addEventListener('click',function(){var v=t.getAttribute('aria-selected')==='true'?'0':t.dataset.view;tabs.forEach(function(b){b.setAttribute('aria-selected',b===t&&v!=='0'?'true':'false');});imgs.forEach(function(im){im.hidden=im.dataset.view!==v;});});});})();</script>";
}

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
