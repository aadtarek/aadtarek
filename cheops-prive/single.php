<?php
if (!defined('ABSPATH')) exit;
cheops_use_icon_footer();
the_post();
$id = get_the_ID();
$cheops_more = new WP_Query(['post_type' => 'post', 'post_status' => 'publish', 'posts_per_page' => 3, 'post__not_in' => [$id], 'ignore_sticky_posts' => true, 'no_found_rows' => true]);
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width,initial-scale=1">
<?php if (has_excerpt()) : ?><meta name="description" content="<?php echo esc_attr(wp_strip_all_tags(get_the_excerpt())); ?>"><?php endif; ?>
<?php cheops_page_css('article', ['home-refinements']); ?>
<?php wp_head(); ?>
</head>
<body <?php body_class('cheops-home-edited cheops-article-page'); ?>><?php wp_body_open(); cheops_site_header(); ?>
<main id="top" class="cheops-article">
  <header class="cheops-article-hero">
    <img class="cheops-article-hero-img" src="<?php echo esc_url(cheops_article_image_url($id, 'full')); ?>" alt="" fetchpriority="high">
    <div class="cheops-article-hero-shade"></div>
    <div class="wrap cheops-article-hero-copy">
      <p class="eyebrow"><?php echo esc_html(cheops_article_category($id) . ' · ' . get_the_date('d M Y')); ?></p>
      <h1 class="d"><?php the_title(); ?></h1>
      <?php if (has_excerpt()) : ?><p class="cheops-article-dek"><?php echo esc_html(wp_strip_all_tags(get_the_excerpt())); ?></p><?php endif; ?>
    </div>
  </header>

  <article class="cheops-article-body">
    <a class="cheops-article-back" href="<?php echo esc_url(cheops_insights_url()); ?>"><span class="ar">←</span> All articles</a>
    <div class="cheops-article-content"><?php the_content(); ?></div>
    <aside class="cheops-article-cta">
      <p class="eyebrow gold">Speak to an advisor</p>
      <p>Looking at a specific unit, building or decision? A Cheops Privé advisor can walk you through it.</p>
      <div class="cheops-article-cta-actions">
        <a class="btn btn-dark" href="<?php echo esc_url(home_url('/contact/')); ?>">Talk to us <span class="ar">→</span></a>
        <a class="btn" href="<?php echo esc_url(home_url('/properties/')); ?>">Browse properties <span class="ar">→</span></a>
      </div>
    </aside>
  </article>

  <?php if ($cheops_more->have_posts()) : ?>
  <section class="sec cheops-article-more" id="insights">
    <div class="wrap">
      <div class="home-section-heading" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px">
        <div><p class="eyebrow gold">Insights</p><h2 class="d d-lg" style="margin-top:10px">More from the market.</h2></div>
        <div><a class="btn" href="<?php echo esc_url(cheops_insights_url()); ?>">All articles <span class="ar">→</span></a></div>
      </div>
      <div class="cheops-insight-grid cheops-insight-grid-3">
        <?php while ($cheops_more->have_posts()) : $cheops_more->the_post(); $mid = get_the_ID(); ?>
        <a class="cheops-insight-card" href="<?php the_permalink(); ?>">
          <div class="zoom" style="position:relative;aspect-ratio:4/3;background:#eee"><img alt="<?php the_title_attribute(); ?>" loading="lazy" decoding="async" src="<?php echo esc_url(cheops_article_image_url($mid)); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></div>
          <p class="meta"><?php echo esc_html(cheops_article_category($mid) . ' · ' . get_the_date('d M Y')); ?></p>
          <h3 class="d"><?php the_title(); ?></h3>
          <span class="link-arrow eyebrow">Read <span class="ar">→</span></span>
        </a>
        <?php endwhile; wp_reset_postdata(); ?>
      </div>
    </div>
  </section>
  <?php endif; ?>
</main>
<?php wp_footer(); ?>
</body>
</html>
