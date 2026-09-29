<?php
if (!defined('ABSPATH')) exit;
cheops_use_icon_footer();
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Insights from Cheops Privé on leasing, buying and choosing clinics, offices and homes in New Cairo and beyond.">
<?php cheops_page_css('article', ['home-refinements']); ?>
<?php wp_head(); ?>
</head>
<body <?php body_class('cheops-home-edited cheops-insights-page'); ?>><?php wp_body_open(); cheops_site_header(); ?>
<main id="top" class="cheops-insights">
  <header class="cheops-insights-hero">
    <div class="wrap">
      <p class="eyebrow">Insights</p>
      <h1 class="d">Notes from the market.</h1>
      <p class="cheops-article-dek">Practical guidance on leasing, buying and choosing clinics, offices and homes in New Cairo and beyond.</p>
    </div>
  </header>
  <section class="sec" id="insights">
    <div class="wrap">
      <?php if (!cheops_render_insight_cards(-1, 'cheops-insight-grid-3')) : ?>
        <p>New articles are on the way.</p>
      <?php endif; ?>
    </div>
  </section>
</main>
<?php wp_footer(); ?>
</body>
</html>
