<?php
if (!defined('ABSPATH')) exit;
$city=get_queried_object();
$cover='https://cheopsprive.com/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-24-at-11.42.06-PM.jpeg?v=20260924-2344';
$desc=($city && !empty($city->description)) ? wp_kses_post(wpautop($city->description)) : '';
$q=new WP_Query([
  'post_type'=>'cheops_project','post_status'=>'publish','posts_per_page'=>-1,
  'orderby'=>['menu_order'=>'ASC','date'=>'DESC'],
  'tax_query'=>[['taxonomy'=>'project_city','field'=>'term_id','terms'=>(int)$city->term_id]],
]);
?><!doctype html><html <?php language_attributes(); ?>><head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1">
<?php wp_head(); ?></head>
<body <?php body_class('tax-project_city'); ?>><?php wp_body_open(); cheops_site_header(); ?>
<main class="cheops-city-page">
  <section class="cheops-city-hero">
    <div class="cheops-city-hero-media" style="background-image:url('<?php echo esc_url($cover); ?>')"></div>
    <div class="cheops-city-hero-overlay"></div>
    <div class="cheops-city-hero-content reveal">
      <p class="cheops-city-hero-kicker"><span class="rule-gold" style="display:inline-block;width:38px;margin-right:12px;vertical-align:middle"></span> </p>
      <h1 class="cheops-city-hero-title d"><?php echo esc_html($city->name); ?></h1>
      <div class="cheops-city-hero-meta"><span><?php echo esc_html((int)$city->count); ?> projects</span><span>Curated opportunities</span><span>Cheops Privé</span></div>
    </div>
  </section>

  <section class="cheops-city-intro">
    <div class="reveal"><p class="eyebrow gold">Projects in <?php echo esc_html($city->name); ?></p><h2 class="d"><span class="rl"><span>Explore the city.</span></span><span class="rl"><span>Choose the address.</span></span></h2></div>
    <div class="cheops-city-intro-copy reveal"><?php echo $desc ?: '<p>Discover our curated projects in '.esc_html($city->name).'. Compare each destination, property mix, starting price and availability through one consistent Cheops Privé experience.</p>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
  </section>

  <section class="cheops-city-project-list">
    <a class="cheops-city-back link-arrow" href="<?php echo esc_url(home_url('/#projects')); ?>"><span class="ar">←</span> All cities</a>
    <?php if($q->have_posts()): $n=0; while($q->have_posts()): $q->the_post(); $n++; cheops_render_project_row(get_the_ID(),$city,$n); endwhile; wp_reset_postdata(); else: ?>
      <article class="proj cheops-city-project-row reveal"><div class="cheops-project-copy"><p class="eyebrow gold">Coming soon</p><h3 class="d">No projects published yet.</h3></div></article>
    <?php endif; ?>
  </section>
</main>
<?php wp_footer(); ?></body></html>
