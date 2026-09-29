<?php
if (!defined('ABSPATH')) exit;

/**
 * Insights / Articles.
 * Articles are ordinary WordPress Posts, so they can be edited, added or
 * removed from Posts in the dashboard. The six launch articles are imported
 * once from assets/articles/articles.json; a post's Featured Image, when set,
 * replaces the theme image it was imported with.
 */

function cheops_articles_data() {
    $file = get_template_directory() . '/assets/articles/articles.json';
    if (!is_readable($file)) return [];
    $data = json_decode((string) file_get_contents($file), true);
    return is_array($data) ? $data : [];
}

function cheops_import_articles() {
    $imported = 0;
    foreach (cheops_articles_data() as $a) {
        if (empty($a['slug']) || empty($a['title'])) continue;
        $existing = get_posts(['post_type' => 'post', 'name' => $a['slug'], 'post_status' => 'any', 'posts_per_page' => 1, 'fields' => 'ids']);
        if ($existing) continue; // never overwrite edits made in the dashboard
        $cat = term_exists($a['category'], 'category');
        if (!$cat) $cat = wp_insert_term($a['category'], 'category');
        $cat_id = is_array($cat) ? (int) $cat['term_id'] : (int) $cat;
        $post_id = wp_insert_post([
            'post_type' => 'post',
            'post_status' => 'publish',
            'post_title' => $a['title'],
            'post_name' => $a['slug'],
            'post_excerpt' => $a['excerpt'] ?? '',
            'post_content' => $a['content'] ?? '',
            'post_date' => $a['date'] ?? current_time('mysql'),
            'post_category' => $cat_id ? [$cat_id] : [],
        ], true);
        if (is_wp_error($post_id) || !$post_id) continue;
        update_post_meta($post_id, '_cheops_article_image', sanitize_text_field($a['image'] ?? ''));
        $imported++;
    }
    return $imported;
}

function cheops_maybe_import_articles() {
    if (get_option('cheops_articles_imported') === '1') return;
    if (!current_user_can('edit_posts')) return;
    cheops_import_articles();
    update_option('cheops_articles_imported', '1', false);
    // WordPress's untouched sample post would otherwise show up as an article.
    $sample = get_page_by_path('hello-world', OBJECT, 'post');
    if ($sample && strpos($sample->post_content, 'Welcome to WordPress') !== false) wp_trash_post($sample->ID);
    // The Insights page lists every article.
    if (!get_page_by_path('insights')) {
        wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Insights', 'post_name' => 'insights', 'post_content' => '']);
    }
}
add_action('admin_init', 'cheops_maybe_import_articles', 35);

function cheops_article_image_url($post_id, $size = 'large') {
    $url = get_the_post_thumbnail_url($post_id, $size);
    if ($url) return $url;
    $asset = get_post_meta($post_id, '_cheops_article_image', true);
    if ($asset) return get_template_directory_uri() . '/assets/' . ltrim($asset, '/');
    return get_template_directory_uri() . '/assets/generated/681a7aa58f9a.jpg';
}

function cheops_article_category($post_id) {
    $cats = get_the_category($post_id);
    return $cats ? $cats[0]->name : 'Insights';
}

function cheops_insights_url() {
    $page = get_page_by_path('insights');
    return $page ? get_permalink($page) : home_url('/insights/');
}

/** Article cards in the Insights section (Home, About) and on the Insights page. */
function cheops_render_insight_cards($limit = 4, $class = 'grid4') {
    $q = new WP_Query(['post_type' => 'post', 'post_status' => 'publish', 'posts_per_page' => (int) $limit, 'ignore_sticky_posts' => true, 'no_found_rows' => true]);
    if (!$q->have_posts()) return false;
    echo '<div class="' . esc_attr($class) . ' cheops-insight-grid" style="margin-top:0;display:grid;gap:32px">';
    while ($q->have_posts()) {
        $q->the_post();
        $id = get_the_ID();
        $title = get_the_title();
        echo '<a class="reveal cheops-insight-card" data-cursor="Read" href="' . esc_url(get_permalink()) . '" style="display:block">';
        echo '<div class="zoom" style="position:relative;aspect-ratio:4/3;background:#eee"><img alt="' . esc_attr(wp_strip_all_tags($title)) . '" loading="lazy" decoding="async" src="' . esc_url(cheops_img_variant(cheops_article_image_url($id), 800)) . '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/></div>';
        echo '<p class="meta" style="margin-top:18px">' . esc_html(cheops_article_category($id) . ' · ' . get_the_date('d M Y')) . '</p>';
        echo '<h3 class="d" style="font-size:1.305rem;margin-top:10px;line-height:1.15">' . esc_html(wp_strip_all_tags($title)) . '</h3>';
        echo '<span class="link-arrow eyebrow" style="margin-top:14px;display:inline-block">Read <span class="ar">→</span></span></a>';
    }
    echo '</div>';
    wp_reset_postdata();
    return true;
}
