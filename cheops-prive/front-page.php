<?php if ( ! defined( 'ABSPATH' ) ) exit; ?>
<?php cheops_use_icon_footer(); ?>
<?php $cheops_video_id = cheops_get_youtube_id( get_theme_mod('cheops_hero_video_url', 'https://youtu.be/nt0bdK3USr8?feature=shared') ); ?>
<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<title>Cheops Privé | Luxury Property in New Cairo &amp; Beyond</title>
<link data-cheops-hero-preload rel="preload" as="image" fetchpriority="high" href="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/f9474888e9cc.jpg' ); ?>">


<meta content="A cinematic property discovery platform for luxury residences, offices, clinics and retail across New Cairo, Mostakbal City, the New Capital and the coast." name="description"/>
<meta content="Cheops Privé | Define Your Next Address" property="og:title"/>
<meta content="Discover projects, destinations, developers and properties across Egypt's most prime addresses." property="og:description"/>
<meta content="website" property="og:type"/>
<link href="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>" rel="icon"/>
<!-- CHEOPS VIDEO PRELOADER: added without changing existing site styles -->

<!-- Section boxed layout: body stays full width, each section is individually framed -->




<?php cheops_page_css('front-page', ['home-refinements']); ?>
<?php wp_head(); ?>


</head>
<body <?php body_class('cheops-home-edited'); ?>><?php cheops_site_header(); ?>
<?php wp_body_open(); ?>
<!-- CHEOPS VIDEO PRELOADER: added without changing existing page content -->
<div aria-label="Loading" id="cheops-video-preloader">
<video id="cheops-preloader-video" muted playsinline preload="auto" aria-hidden="true"
  data-desktop-src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/72bcbd3c625e.mp4' ); ?>"
  data-mobile-src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/72bcbd3c625e.mp4' ); ?>"></video>
</div>
<script id="cheops-preloader-script">
(function(){
  var preloader=document.getElementById('cheops-video-preloader');
  var video=document.getElementById('cheops-preloader-video');
  if(!preloader||!video)return;
  var sessionKey='cheops_preloader_seen_v11';
  try{
    if(sessionStorage.getItem(sessionKey)){preloader.remove();return;}
    sessionStorage.setItem(sessionKey,'1');
  }catch(e){}

  var closed=false;
  function closePreloader(){
    if(closed)return;
    closed=true;
    preloader.classList.add('cheops-preloader-hidden');
    setTimeout(function(){
      if(preloader&&preloader.parentNode)preloader.parentNode.removeChild(preloader);
    },850);
  }

  var mobile=window.matchMedia('(max-width: 767px)').matches;
  var src=mobile?video.dataset.mobileSrc:video.dataset.desktopSrc;
  if(!src){closePreloader();return;}

  video.addEventListener('ended',closePreloader,{once:true});
  video.addEventListener('error',closePreloader,{once:true});
  video.src=src;
  video.load();
  var playPromise=video.play();
  if(playPromise&&typeof playPromise.catch==='function'){
    playPromise.catch(closePreloader);
  }

  setTimeout(function(){if(!closed)closePreloader();},4000);
})();
</script>
<div class="cursor" id="cursor"><b></b></div>
<header class="nav" id="nav">
<div class="wrap nav-inner">
<a aria-label="Cheops Privé home" href="#top"><img alt="Cheops Privé" class="logo" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>"/></a>
<nav aria-label="Primary" class="nav-links">
<a href="#projects">Projects</a>
<a href="#destinations">Communities</a>
<a href="#properties">Properties</a>
<a href="#destinations">Destinations</a>
<a href="#about">About</a>
<a href="#insights">Insights</a>
</nav>
<div style="display:flex;align-items:center;gap:18px">
<a class="eyebrow" href="#search" id="navSearch" style="display:none">Search</a>
<a class="eyebrow" href="#contact" style="letter-spacing:.22em">Contact</a>
<button aria-expanded="false" aria-label="Open menu" class="burger" id="burger"><span></span><span></span><span></span></button>
</div>
</div>
</header>
<div class="menu" id="menu">
<div style="display:flex;align-items:center;justify-content:space-between">
<img alt="Cheops Privé" class="logo" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>" style="filter:brightness(0) invert(1)"/>
<button aria-label="Close menu" class="burger" id="close" style="color:#fff"><span style="transform:rotate(45deg) translateY(3px)"></span><span style="transform:rotate(-45deg) translateY(-3px)"></span></button>
</div>
<nav aria-label="Mobile" style="margin-top:40px">
<a href="#projects">Projects</a><a href="#destinations">Communities</a><a href="#properties">Properties</a>
<a href="#destinations">Destinations</a><a href="#about">About</a><a href="#insights">Insights</a><a href="#contact">Contact</a>
</nav>
</div>
<main id="top">
<section class="hero" id="hero">

<div class="cheops-yt-bg" aria-hidden="true">
  <iframe id="cheopsHeroVideo" data-src="https://www.youtube-nocookie.com/embed/<?php echo esc_attr($cheops_video_id); ?>?autoplay=1&amp;mute=1&amp;controls=0&amp;loop=1&amp;playlist=<?php echo esc_attr($cheops_video_id); ?>&amp;playsinline=1&amp;rel=0&amp;modestbranding=1&amp;iv_load_policy=3&amp;disablekb=1" title="" allow="autoplay; encrypted-media; picture-in-picture" tabindex="-1"></iframe>
</div>
<div class="cheops-yt-overlay" aria-hidden="true"></div>
<script id="cheops-hero-video-defer">
/* The hero image paints first; the YouTube player (~1MB) loads once the page has finished loading. */
(function(){
  var f=document.getElementById('cheopsHeroVideo'); if(!f)return;
  function start(){ if(f.src)return; f.addEventListener('load',function(){setTimeout(function(){f.classList.add('is-ready');},700);}); f.src=f.getAttribute('data-src'); }
  function later(){ setTimeout(function(){ (window.requestIdleCallback||function(cb){cb();})(start,{timeout:2000}); },600); }
  if(document.readyState==='complete')later(); else window.addEventListener('load',later);
})();
</script>

<img alt="Luxury residential architecture in New Cairo" id="heroImg" fetchpriority="high" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/f9474888e9cc.jpg' ); ?>"/>
<div class="overlay" style="position:absolute;inset:0"></div>
<div class="wrap" style="position:relative;z-index:2;color:#fff;padding-bottom:56px;width:100%">
<p class="eyebrow hero-eyebrow">Define your next address</p>
<h1 class="d d-xl hero-title-single" style="margin:18px 0 0">
  <span class="hero-title-line hero-title-line-main">
    <span class="rl"><span>Live</span></span>
    <span class="rl hero-title-accent"><span>Beyond</span></span>
  </span>
  <span class="hero-title-line hero-title-line-sub">
    <span class="rl"><span>Expectations</span></span>
  </span>
</h1>
<p class="hero-lead">Curated properties, remarkable communities and prime destinations <br> All brought together in one considered search experience.</p>
<div class="hero-actions" style="margin-top:22px;display:flex;flex-wrap:wrap;gap:12px">
<a class="btn btn-light" href="<?php echo esc_url( home_url('/properties/') ); ?>">Explore properties <span class="ar">→</span></a>
<a class="btn btn-light" href="<?php echo esc_url( home_url('/about/') ); ?>">About us <span class="ar">→</span></a>
</div>
<div id="search" style="margin-top:46px;max-width:1180px">
<form class="search" data-search="" action="<?php echo esc_url( home_url('/properties/') ); ?>" method="get" style="color:#fff">
<div class="fields">
<div class="field"><label>Search by</label><select name="loc"><option value="">Location, compound or developer</option><?php cheops_taxonomy_options_html('unit_location',['New Cairo','Mostakbal City','New Capital','North Coast','Ain Sokhna','Sheikh Zayed']); ?></select></div>
<div class="field"><label>Listing</label><select name="deal"><option value="">Sale or Rent</option><option value="sale">For Sale</option><option value="rent">For Rent</option></select></div><div class="field"><label>Property type</label><select name="type"><option value="">Any type</option><?php cheops_taxonomy_options_html('unit_type',['Apartment','Villa','Townhouse','Twinhouse','Duplex','Penthouse','Chalet','Office','Clinic','Retail']); ?></select></div>
<div class="field"><label>Bedrooms</label><select name="beds"><option value="">Any</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5+</option></select></div>
<div class="field"><label>Price range (EGP)</label><div style="display:flex;gap:10px"><input inputmode="numeric" name="min" placeholder="Min"/><input inputmode="numeric" name="max" placeholder="Max"/></div></div>
</div>
<div class="search-actions" style="margin-top:14px;display:flex;align-items:center;gap:16px">
<button class="btn btn-light" type="submit">Search <span class="ar">→</span></button>
<button class="eyebrow" style="background:none;border:0;cursor:pointer;color:inherit;opacity:.7" type="reset">Reset</button>
</div>
</form>
</div>
</div>
</section>
<section class="sec" id="office-choices" aria-label="Office options">
  <div class="office-choice-grid">
    <a class="office-choice buy reveal" href="<?php echo esc_url( home_url('/properties/?deal=sale&type=Office') ); ?>">
      <span class="eyebrow">Own your workspace</span>
      <h2 class="d">Buy Office</h2>
      <p>Find a premium office space to own, invest in and grow your business from.</p>
      <span class="btn">Explore to buy <span class="ar">→</span></span>
    </a>
    <a class="office-choice rent reveal" href="<?php echo esc_url( home_url('/properties/?deal=rent&type=Office') ); ?>">
      <span class="eyebrow">Find the right fit</span>
      <h2 class="d">Rent Office</h2>
      <p>Discover flexible office spaces in prime locations that work for your business today.</p>
      <span class="btn">Explore to rent <span class="ar">→</span></span>
    </a>
    <a class="office-choice residential reveal" href="<?php echo esc_url( home_url('/properties/?type=Residential') ); ?>">
      <span class="eyebrow">Find your next address</span>
      <h2 class="d">Residential</h2>
      <p>Explore apartments, villas, townhouses and more across Egypt’s most sought-after communities.</p>
      <span class="btn">Explore residential <span class="ar">→</span></span>
    </a>
  </div>
</section>


<section class="sec wrap" id="about">
  <div class="about-shell reveal">
    <div class="about-top">
      <div class="about-kicker">About Cheops Privé</div>
    </div>
    <div class="about-grid">
      <div class="about-intro">
        <h2 class="about-title d">Temple of Opulence</h2>
        <p class="about-lead">At the heart of Cheops Privé lies a reverence for timeless luxury and enduring elegance, expressed through curated environments and bespoke service.</p>
        <a class="btn btn-light cheops-about-properties" href="<?php echo esc_url(home_url('/properties/')); ?>">Explore Properties <span class="ar">→</span></a>
      </div>
      <div class="about-copy">
        <p>Cheops Privé takes a more considered approach to property discovery. We bring together exceptional projects, destinations and individual residences into one curated experience, designed to make finding your next address feel more personal, refined and effortless.</p>
        <div class="about-points">
          <div class="about-point"><div class="about-num" data-count="228" data-suffix="+">0</div><div class="about-label">Projects indexed</div></div>
          <div class="about-point"><div class="about-num" data-count="6130">0</div><div class="about-label">Live properties</div></div>
        </div>
      </div>
    </div>
  </div>
</section>
<?php
// Keep the live tenant logos and add a shortcut using the existing Properties filters.
$cheops_home_rental_url = add_query_arg(
    ['project' => 'Lake Town', 'type' => 'Office', 'deal' => 'rent'],
    home_url('/properties/')
);
ob_start();
cheops_render_business_tenants();
$cheops_home_tenants = ob_get_clean();
$cheops_home_tenants_title = '<p class="cheops-logo-band-title">Our Business Tenants</p>';
$cheops_home_tenants_button = '<a class="btn btn-ghost cheops-tenants-rentals" href="' . esc_url($cheops_home_rental_url) . '" aria-label="Explore administrative offices for rent in Lake Town">Offices For Rent <span class="ar">→</span></a>';
echo str_replace($cheops_home_tenants_title, $cheops_home_tenants_title . $cheops_home_tenants_button, $cheops_home_tenants);
?>
<?php
// City cards use the image assigned to each City in WordPress.
$cheops_home_cities = get_terms(['taxonomy' => 'project_city', 'hide_empty' => false, 'orderby' => 'term_id', 'order' => 'ASC']);
if (!is_wp_error($cheops_home_cities) && $cheops_home_cities) :
?>
<section class="wrap cheops-city-projects" id="projects">
  <div class="cheops-city-projects-head">
    <div><p class="eyebrow gold">Explore by city</p><h2 class="d d-lg reveal" style="margin-top:20px"><span class="rl"><span>Choose your</span></span><span class="rl"><span>dream home.</span></span></h2></div>
    <a class="btn btn-ghost" href="<?php echo esc_url(home_url('/properties/')); ?>">All properties <span class="ar">→</span></a>
  </div>
  <div class="cheops-city-links" aria-label="Project cities">
    <?php foreach ($cheops_home_cities as $cheops_home_city) :
        $cheops_home_city_url = get_term_link($cheops_home_city);
        if (is_wp_error($cheops_home_city_url)) continue;
        $cheops_home_city_cover = cheops_city_cover_url($cheops_home_city->term_id);
        $cheops_home_city_count = $cheops_home_city->count > 0
            ? $cheops_home_city->count . ' ' . ($cheops_home_city->count === 1 ? 'project' : 'projects')
            : 'New destination';
    ?>
    <a class="cheops-city-link reveal" href="<?php echo esc_url($cheops_home_city_url); ?>">
      <span class="cheops-city-tab-bg" style="background-image:url('<?php echo esc_url($cheops_home_city_cover); ?>')"></span>
      <span class="cheops-city-tab-shade"></span>
      <span class="cheops-city-tab-copy"><small><?php echo esc_html($cheops_home_city_count); ?></small><strong class="d"><?php echo esc_html($cheops_home_city->name); ?></strong><em>View projects <b>→</b></em></span>
    </a>
    <?php endforeach; ?>
  </div>
</section>
<?php endif; ?>
<section class="sec" id="properties" style="background:#f7f5f2">
<div class="wrap">
<div class="home-section-heading" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px">
<div><p class="eyebrow gold">Property search</p><h2 class="d d-lg reveal" style="margin-top:14px;font-size:clamp(2.7rem,4.5vw,4.86rem);line-height:1.02"><span class="rl"><span>Find your next home.</span></span></h2></div>
<div></div></div>
<div style="margin-top:0"><form class="search light" data-search="" action="<?php echo esc_url( home_url('/properties/') ); ?>" method="get">
<div class="fields">
<div class="field"><label>Search by</label><select name="loc"><option value="">Location, compound or developer</option><?php cheops_taxonomy_options_html('unit_location',['New Cairo','Mostakbal City','New Capital','North Coast','Ain Sokhna','Sheikh Zayed']); ?></select></div>
<div class="field"><label>Listing</label><select name="deal"><option value="">Sale or Rent</option><option value="sale">For Sale</option><option value="rent">For Rent</option></select></div><div class="field"><label>Property type</label><select name="type"><option value="">Any type</option><?php cheops_taxonomy_options_html('unit_type',['Apartment','Villa','Townhouse','Twinhouse','Duplex','Penthouse','Chalet','Office','Clinic','Retail']); ?></select></div>
<div class="field"><label>Bedrooms</label><select name="beds"><option value="">Any</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5+</option></select></div>
<div class="field"><label>Price range (EGP)</label><div style="display:flex;gap:10px"><input inputmode="numeric" name="min" placeholder="Min"/><input inputmode="numeric" name="max" placeholder="Max"/></div></div>
</div>
<div class="search-actions" style="margin-top:14px;display:flex;align-items:center;gap:16px">
<button class="btn" type="submit">Search <span class="ar">→</span></button>
<button class="eyebrow" style="background:none;border:0;cursor:pointer;color:inherit;opacity:.7" type="reset">Reset</button>
</div>
</form></div>
<div class="grid3" id="propGrid" style="margin-top:0;display:grid;gap:24px"><?php if (!cheops_render_unit_cards(['limit'=>6,'featured'=>true])): ?><article class="pcard reveal" data-deal="sale" data-beds="3" data-loc="Mostakbal City" data-type="Apartment">
<div class="zoom" data-cursor="View property" style="position:relative;aspect-ratio:4/3">
<img alt="Luxury Apartment in Sarai, Mostakbal City" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/5c624eb97e16.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">Apartment</span>
<button aria-label="Save property" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border:0;width:34px;height:34px;cursor:pointer;font-size:.81rem">♡</button>
</div>
<div style="padding:20px">
<h3 class="d" style="font-size:1.35rem;margin:0">Luxury Apartment</h3>
<p class="meta" style="margin-top:8px">Sarai · Mostakbal City</p>
<p style="margin-top:14px;font-size:.738rem;color:var(--muted)">3 Beds · 3 Baths · 185 m²</p>
<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
<p class="d" style="font-size:1.17rem;margin:0">EGP 8,500,000</p>
<span class="gold">→</span>
</div>
</div><div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="<?php echo esc_url( cheops_phone_url() ); ?>">Call <span class="ar">→</span></a></div></article><article class="pcard reveal" data-deal="sale" data-beds="4" data-loc="New Cairo" data-type="Penthouse">
<div class="zoom" data-cursor="View property" style="position:relative;aspect-ratio:4/3">
<img alt="Signature Penthouse in Talala, New Cairo" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/fb144638dcc9.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">Penthouse</span>
<button aria-label="Save property" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border:0;width:34px;height:34px;cursor:pointer;font-size:.81rem">♡</button>
</div>
<div style="padding:20px">
<h3 class="d" style="font-size:1.35rem;margin:0">Signature Penthouse</h3>
<p class="meta" style="margin-top:8px">Talala · New Cairo</p>
<p style="margin-top:14px;font-size:.738rem;color:var(--muted)">4 Beds · 4 Baths · 320 m²</p>
<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
<p class="d" style="font-size:1.17rem;margin:0">EGP 19,750,000</p>
<span class="gold">→</span>
</div>
</div><div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="<?php echo esc_url( cheops_phone_url() ); ?>">Call <span class="ar">→</span></a></div></article><article class="pcard reveal" data-deal="sale" data-beds="5" data-loc="New Cairo" data-type="Villa">
<div class="zoom" data-cursor="View property" style="position:relative;aspect-ratio:4/3">
<img alt="Garden Villa in Taj City, New Cairo" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/d9f92ab0fa62.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">Villa</span>
<button aria-label="Save property" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border:0;width:34px;height:34px;cursor:pointer;font-size:.81rem">♡</button>
</div>
<div style="padding:20px">
<h3 class="d" style="font-size:1.35rem;margin:0">Garden Villa</h3>
<p class="meta" style="margin-top:8px">Taj City · New Cairo</p>
<p style="margin-top:14px;font-size:.738rem;color:var(--muted)">5 Beds · 5 Baths · 415 m²</p>
<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
<p class="d" style="font-size:1.17rem;margin:0">EGP 26,400,000</p>
<span class="gold">→</span>
</div>
</div><div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="<?php echo esc_url( cheops_phone_url() ); ?>">Call <span class="ar">→</span></a></div></article><article class="pcard reveal" data-deal="sale" data-beds="0" data-loc="New Cairo" data-type="Office">
<div class="zoom" data-cursor="View property" style="position:relative;aspect-ratio:4/3">
<img alt="Corner Office Floor in Talala, New Cairo" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/ed8441727632.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">Office</span>
<button aria-label="Save property" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border:0;width:34px;height:34px;cursor:pointer;font-size:.81rem">♡</button>
</div>
<div style="padding:20px">
<h3 class="d" style="font-size:1.35rem;margin:0">Corner Office Floor</h3>
<p class="meta" style="margin-top:8px">Talala · New Cairo</p>
<p style="margin-top:14px;font-size:.738rem;color:var(--muted)">2 Baths · 240 m²</p>
<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
<p class="d" style="font-size:1.17rem;margin:0">EGP 17,800,000</p>
<span class="gold">→</span>
</div>
</div><div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="<?php echo esc_url( cheops_phone_url() ); ?>">Call <span class="ar">→</span></a></div></article><article class="pcard reveal" data-deal="sale" data-beds="0" data-loc="Mostakbal City" data-type="Medical">
<div class="zoom" data-cursor="View property" style="position:relative;aspect-ratio:4/3">
<img alt="Medical Clinic Suite in Sarai, Mostakbal City" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/f205048fec6d.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">Medical</span>
<button aria-label="Save property" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border:0;width:34px;height:34px;cursor:pointer;font-size:.81rem">♡</button>
</div>
<div style="padding:20px">
<h3 class="d" style="font-size:1.35rem;margin:0">Medical Clinic Suite</h3>
<p class="meta" style="margin-top:8px">Sarai · Mostakbal City</p>
<p style="margin-top:14px;font-size:.738rem;color:var(--muted)">2 Baths · 140 m²</p>
<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
<p class="d" style="font-size:1.17rem;margin:0">EGP 8,900,000</p>
<span class="gold">→</span>
</div>
</div><div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="<?php echo esc_url( cheops_phone_url() ); ?>">Call <span class="ar">→</span></a></div></article><article class="pcard reveal" data-deal="sale" data-beds="0" data-loc="New Cairo" data-type="Retail">
<div class="zoom" data-cursor="View property" style="position:relative;aspect-ratio:4/3">
<img alt="Boulevard Retail Unit in Taj City, New Cairo" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/aad1f08ab9f5.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">Retail</span>
<button aria-label="Save property" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border:0;width:34px;height:34px;cursor:pointer;font-size:.81rem">♡</button>
</div>
<div style="padding:20px">
<h3 class="d" style="font-size:1.35rem;margin:0">Boulevard Retail Unit</h3>
<p class="meta" style="margin-top:8px">Taj City · New Cairo</p>
<p style="margin-top:14px;font-size:.738rem;color:var(--muted)">1 Baths · 96 m²</p>
<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
<p class="d" style="font-size:1.17rem;margin:0">EGP 9,400,000</p>
<span class="gold">→</span>
</div>
</div><div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="<?php echo esc_url( cheops_phone_url() ); ?>">Call <span class="ar">→</span></a></div></article><?php endif; ?></div>
<!-- WhatsApp + Call actions directly under the property/unit cards -->

<div class="browse-properties" style="margin-top:24px"><a class="btn" href="<?php echo esc_url( home_url('/properties/') ); ?>">Browse all properties <span class="ar">→</span></a></div>
</div>
</section>

<?php cheops_render_developers_band(); ?>

<section class="sec" id="insights" style="background:#f7f5f2">
<div class="wrap">
<div class="home-section-heading" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px">
<div><p class="eyebrow gold">Insights</p><h2 class="d d-lg reveal" style="margin-top:20px"><span class="rl"><span style="white-space:nowrap">Notes from the market.</span></span></h2></div>
<div></div></div>
<div class="grid4" style="margin-top:0;display:grid;gap:32px"><a class="reveal" data-cursor="Read" href="#insights" style="display:block">
<div class="zoom" style="position:relative;aspect-ratio:4/3;background:#eee"><img alt="The Art of Modern Living" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/681a7aa58f9a.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/></div>
<p class="meta" style="margin-top:18px">Market · 19 Aug 2026</p>
<h3 class="d" style="font-size:1.305rem;margin-top:10px;line-height:1.15">The Art of Modern Living</h3>
<span class="link-arrow eyebrow" style="margin-top:14px;display:inline-block">Read <span class="ar">→</span></span></a><a class="reveal" data-cursor="Read" href="#insights" style="display:block">
<div class="zoom" style="position:relative;aspect-ratio:4/3;background:#eee"><img alt="Where Cairo Is Moving Next" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c08f3f70cf69.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/></div>
<p class="meta" style="margin-top:18px">Cities · 02 Aug 2026</p>
<h3 class="d" style="font-size:1.305rem;margin-top:10px;line-height:1.15">Where Cairo Is Moving Next</h3>
<span class="link-arrow eyebrow" style="margin-top:14px;display:inline-block">Read <span class="ar">→</span></span></a><a class="reveal" data-cursor="Read" href="#insights" style="display:block">
<div class="zoom" style="position:relative;aspect-ratio:4/3;background:#eee"><img alt="Investing in Tomorrow's Communities" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/fb144638dcc9.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/></div>
<p class="meta" style="margin-top:18px">Investment · 21 Jul 2026</p>
<h3 class="d" style="font-size:1.305rem;margin-top:10px;line-height:1.15">Investing in Tomorrow's Communities</h3>
<span class="link-arrow eyebrow" style="margin-top:14px;display:inline-block">Read <span class="ar">→</span></span></a><a class="reveal" data-cursor="Read" href="#insights" style="display:block">
<div class="zoom" style="position:relative;aspect-ratio:4/3;background:#eee"><img alt="How to Choose Your Next Home" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/80b3ea65ee72.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/></div>
<p class="meta" style="margin-top:18px">Guides · 08 Jul 2026</p>
<h3 class="d" style="font-size:1.305rem;margin-top:10px;line-height:1.15">How to Choose Your Next Home</h3>
<span class="link-arrow eyebrow" style="margin-top:14px;display:inline-block">Read <span class="ar">→</span></span></a></div>
</div>
</section>
<?php
// Use the theme's current project data; selecting a marker never navigates away.
$cheops_home_map_items = cheops_project_map_items();
if ($cheops_home_map_items) :
    $cheops_home_map_first = $cheops_home_map_items[0];
?>
    <section class="ink sec cheops-project-map" id="map">
      <div class="wrap">
        <p class="eyebrow">Projects on the map</p>
        <h2 class="d d-lg map-title"><span class="rl"><span>Explore projects</span></span><span class="rl"><span>by address.</span></span></h2>
        <div class="cheops-map-grid">
          <div id="mapBox"><div id="real-map" aria-label="Interactive project map"></div></div>
          <div class="cheops-map-info" aria-live="polite" aria-atomic="true">
            <p class="eyebrow gold" id="mDest"><?php echo esc_html($cheops_home_map_first['dest']); ?></p>
            <h3 class="d d-md" id="mName"><?php echo esc_html($cheops_home_map_first['name']); ?></h3>
            <p id="mStatement"><?php echo esc_html($cheops_home_map_first['statement']); ?></p>
            <dl><div><dt>Starting price</dt><dd class="d" id="mPrice"><?php echo esc_html($cheops_home_map_first['price']); ?></dd></div><div><dt>Available units</dt><dd class="d" id="mUnits"><?php echo esc_html($cheops_home_map_first['units']); ?></dd></div></dl>
            <a class="link-arrow" id="mLink" href="<?php echo esc_url($cheops_home_map_first['link']); ?>">View project units <span class="ar">→</span></a>
          </div>
        </div>
      </div>
    </section>
    <?php cheops_leaflet_loader_js(); ?>
    <script>(function(){
      var data=<?php echo wp_json_encode($cheops_home_map_items,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE); ?>;
      function boot(){var el=document.getElementById('real-map');if(!el||!window.L)return;if(el._leaflet_id)return;
        var map=L.map(el,{scrollWheelZoom:false,zoomControl:true,attributionControl:true});
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
        function icon(on){return L.divIcon({className:'cheops-map-icon',html:'<span class="cheops-pin'+(on?' active':'')+'"><i></i></span>',iconSize:[26,26],iconAnchor:[13,26]});}
        var markers=[];
        function select(i,fly){var p=data[i];if(!p)return;document.getElementById('mDest').textContent=p.dest;document.getElementById('mName').textContent=p.name;document.getElementById('mStatement').textContent=p.statement;document.getElementById('mPrice').textContent=p.price;document.getElementById('mUnits').textContent=p.units;document.getElementById('mLink').href=p.link;markers.forEach(function(m,n){m.setIcon(icon(n===i));});if(fly)map.flyTo(p.coords,p.dest==='North Coast'?10:12,{duration:1.05});}
        data.forEach(function(p,i){var m=L.marker(p.coords,{icon:icon(i===0),title:p.name,keyboard:true}).addTo(map).bindTooltip(p.name,{direction:'top',offset:[0,-20],className:'cheops-tooltip'});m.on('click',function(){select(i,false);});markers.push(m)});
        map.fitBounds(L.latLngBounds(data.map(function(p){return p.coords})),{padding:[44,44],maxZoom:9});select(0,false);
        var fix=function(){try{map.invalidateSize(true)}catch(e){}};[50,300,900].forEach(function(t){setTimeout(fix,t)});addEventListener('resize',fix);
      } window.cheopsWhenMapNear(boot);
    })();</script>
<?php endif; ?>

<section class="sec" id="faqs" style="background:#f7f5f2;padding-top:26px!important;padding-bottom:30px!important">
  <div class="wrap">
    <div>
      <p class="eyebrow gold">FAQs</p>
      <h2 class="d d-lg reveal" style="margin-top:14px">
        <span class="rl"><span>Questions, answered.</span></span>
      </h2>
    </div>

    <div class="faq-list" style="margin-top:0;max-width:880px">
      <details class="faq-item reveal">
        <summary>What is Cheops Privé?</summary>
        <p>Cheops Privé is a curated discovery platform for luxury residences, offices, clinics and retail across New Cairo, Mostakbal City, the New Capital and the coast. We focus on clarity and quality, not volume.</p>
      </details>
      <details class="faq-item reveal">
        <summary>Do you charge buyers a commission?</summary>
        <p>No. Our service is free for buyers and end users. We are compensated by partner developers and sellers when a transaction completes through our introduction.</p>
      </details>
      <details class="faq-item reveal">
        <summary>Which areas do you cover?</summary>
        <p>Primarily New Cairo, Shorouk, Mostakbal City and the North Coast, with selected opportunities in other prime destinations on request.</p>
      </details>
      <details class="faq-item reveal">
        <summary>Can I request a private viewing?</summary>
        <p>Yes. Once you shortlist a unit or project, our team arranges a private visit at a time that suits you. Off-market and pre-release options can also be shared on request.</p>
      </details>
      <details class="faq-item reveal">
        <summary>Are prices shown final?</summary>
        <p>Listed prices are starting or indicative figures provided by developers. Final pricing, payment plans and availability are confirmed at the time of inquiry and may change.</p>
      </details>
      <details class="faq-item reveal">
        <summary>How do I get off-market or new releases?</summary>
        <p>Join the private list at the bottom of this page, or contact us directly. We share selected new releases and off-market floors with subscribers twice a month.</p>
      </details>
    </div>
  </div>
</section>


</main>
<footer class="ink grain" style="position:relative">
<div class="wrap" style="padding-top:80px;padding-bottom:70px">
<h2 class="d d-lg reveal" style="max-width:900px"><span class="rl"><span>An address is not bought.</span></span><span class="rl"><span>It is chosen.</span></span></h2>
<div class="foot-grid" style="margin-top:56px;border-top:1px solid rgba(255,255,255,.1);padding-top:48px;display:grid;gap:44px">
<div>
<img alt="Cheops Privé" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>" style="height:34px;filter:brightness(0) invert(1)"/>
<p style="margin-top:22px;max-width:360px;font-size:.792rem;line-height:1.8;opacity:.6">A curated discovery platform for luxury residences, offices, clinics and retail across New Cairo, the New Capital and the coast.</p>
<div style="margin-top:28px;display:grid;gap:12px;font-size:.792rem;opacity:.85">
<a href="<?php echo esc_url( cheops_phone_url() ); ?>"><?php echo esc_html( cheops_phone_display() ); ?></a>
<a href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noreferrer" target="_blank">WhatsApp</a>
<a href="mailto:<?php echo esc_attr( antispambot( cheops_email() ) ); ?>"><?php echo esc_html( cheops_email() ); ?></a>
<p style="margin:0;opacity:.75"><?php echo esc_html( cheops_address() ); ?></p>
</div>
</div>
<div class="grid4" style="display:grid;gap:36px">
<div class="col"><h3 class="eyebrow gold">Projects</h3><div style="margin-top:18px;display:grid;gap:12px"><a href="#projects">All projects</a><a href="#properties">Residences</a><a href="#destinations">Communities</a><a href="#insights">Insights</a></div></div>
<div class="col"><h3 class="eyebrow gold">Destinations</h3><div style="margin-top:18px;display:grid;gap:12px"><a href="#destinations">All destinations</a><a href="#destinations">New Cairo</a><a href="#destinations">New Capital</a><a href="#destinations">North Coast</a></div></div>
<div class="col"><h3 class="eyebrow gold">Properties</h3><div style="margin-top:18px;display:grid;gap:12px"><a href="#properties">Browse all</a><a href="#properties">Apartments</a><a href="#properties">Villas</a><a href="#properties">Offices &amp; clinics</a></div></div>
<div class="col"><h3 class="eyebrow gold">Company</h3><div style="margin-top:18px;display:grid;gap:12px"><a href="#about">About</a><a href="#map">Developers</a><a href="#insights">Insights</a><a href="#contact">Contact</a></div></div>
</div>
</div>
<div style="margin-top:56px;border-top:1px solid rgba(255,255,255,.1);padding-top:40px;display:flex;flex-wrap:wrap;gap:24px;align-items:flex-end;justify-content:space-between">
<div style="max-width:420px">
<h3 class="d d-md">Join the private list</h3>
<p style="margin-top:12px;font-size:.792rem;opacity:.55">New releases, off-market floors and market notes. Twice a month.</p>
</div>
<form id="newsForm" style="display:flex;width:100%;max-width:420px;align-items:center;border-bottom:0px solid rgba(255,255,255,.25)">
<label for="news" style="position:absolute;left:-9999px">Email address</label>
<input id="news" placeholder="your@email.com" required="" style="flex:1;background:transparent;border:0;padding:16px 0;color:inherit;font:inherit;font-size:.774rem;outline:none" type="email"/>
<button id="newsBtn" style="background:none;border:0;padding:16px 0;color:var(--gold);font:inherit;font-size:.54rem;font-weight:800;letter-spacing:.24em;text-transform:uppercase;cursor:pointer" type="submit">Subscribe →</button>
</form>
</div>
<p class="eyebrow" style="margin-top:48px;opacity:.35">© 2026 Cheops Privé. All rights reserved.</p>
</div>
</footer>
<?php cheops_print_motion_scripts(); ?>
<script>
const MAP = [{"name": "Mountain View LVLS", "destination": "New Cairo", "statement": "Panoramic sea views from a gated community elevated up to +45 meters above sea level.", "price": "EGP 7.4M", "units": "218"}, {"name": "LAKE TOWN", "destination": "Shorouk City", "statement": "A refined destination designed around elevated business and lifestyle experiences.", "price": "EGP 5.9M", "units": "164"}, {"name": "Mountain View Aliva", "destination": "New Cairo", "statement": "A city built around interaction, connectivity and being present in every moment.", "price": "EGP 11.2M", "units": "76"}, {"name": "The MarQ Gardens", "destination": "New Cairo", "statement": "Where serenity meets sophistication, blending modern living with lush green spaces.", "price": "EGP 6.3M", "units": "142"}];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Legacy preloader disabled by WordPress theme */
(function(){ start(); })();

/* Reveals */
function start(){
  document.querySelectorAll('.hero .rl>span').forEach((s,i)=>{s.style.transitionDelay=(i*0.11)+'s';});
  document.getElementById('hero').classList.add('on');
  const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target);}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal,h2.d,.rl').forEach(n=>io.observe(n));

  /* count up */
  const cio=new IntersectionObserver((es)=>{es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;cio.unobserve(el);
    const to=+el.dataset.count, sfx=el.dataset.suffix||''; const dur=1500; const t0=performance.now();
    (function tick(t){const p=Math.min(1,(t-t0)/dur);const eased=1-Math.pow(1-p,3);
      el.textContent=Math.round(to*eased).toLocaleString('en-US')+sfx; if(p<1)requestAnimationFrame(tick);})(t0);
  })},{threshold:.4});
  document.querySelectorAll('[data-count]').forEach(n=>cio.observe(n));

  if(reduce || !window.Lenis || !window.gsap || !window.ScrollTrigger) return;
  /* Lenis + GSAP */
  const lenis=new Lenis({duration:1.25,smoothWheel:true});
  lenis.on('scroll',()=>ScrollTrigger.update());
  gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0);
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href')); if(!t)return; e.preventDefault(); closeMenu(); lenis.scrollTo(t,{offset:-10});
  }));

  /* hero parallax */
  gsap.to('#heroImg',{yPercent:12,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});

}

/* header state */
const nav=document.getElementById('nav');
addEventListener('scroll',()=>{nav.classList.toggle('scrolled',scrollY>60);},{passive:true});

/* mobile menu */
const menu=document.getElementById('menu');
function closeMenu(){menu.classList.remove('open');document.getElementById('burger').setAttribute('aria-expanded','false');}
document.getElementById('burger').onclick=()=>{menu.classList.add('open');document.getElementById('burger').setAttribute('aria-expanded','true');
  menu.querySelectorAll('nav a').forEach((a,i)=>{a.style.animationDelay=(i*0.06)+'s';a.style.animationName='none';requestAnimationFrame(()=>a.style.animationName='mi');});};
document.getElementById('close').onclick=closeMenu;

/* hero mouse parallax */
const hero=document.getElementById('hero');
hero.addEventListener('pointermove',e=>{
  if(reduce)return; const r=hero.getBoundingClientRect();
  const x=(e.clientX-r.width/2)/r.width, y=(e.clientY-r.height/2)/r.height;
  document.getElementById('heroImg').style.transform=`translate3d(${x*-14}px,${y*-10}px,0) scale(1.06)`;
});

/* custom cursor */
const cur=document.getElementById('cursor'), curT=cur.querySelector('b');
addEventListener('pointermove',e=>{cur.style.opacity=1;cur.style.transform=`translate(${e.clientX-cur.offsetWidth/2}px,${e.clientY-cur.offsetHeight/2}px)`;});
document.addEventListener('pointerover',e=>{
  const t=e.target.closest('[data-cursor]');
  if(t){cur.classList.add('big');curT.textContent=t.dataset.cursor;} else {cur.classList.remove('big');curT.textContent='';}
});

/* map (legacy dots disabled — Leaflet real-map handles the section) */
/* setPoint intentionally removed to avoid overwriting #mDest/#mName from Leaflet */

/* Home search forms submit to the full Properties page with their GET filters. */

/* newsletter */
document.getElementById('newsForm').addEventListener('submit',e=>{e.preventDefault();document.getElementById('newsBtn').textContent='Thank you';e.target.reset();});

</script>
<script>
/* ============ ULTRA MOTION v2 ============ */
(function(){
  /* scroll progress */
  const p=document.createElement('div');p.id='prog';document.body.appendChild(p);
  addEventListener('scroll',()=>{const h=document.documentElement;
    p.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';},{passive:true});

  /* decorative blobs */
  ['#projects','#destinations','#properties'].forEach((s,i)=>{
    const el=document.querySelector(s);if(!el)return;
    el.style.position='relative';
    const b=document.createElement('span');b.className='blob';
    b.style.cssText+=`width:${380+i*90}px;height:${380+i*90}px;top:${i%2?'auto':'6%'};bottom:${i%2?'4%':'auto'};${i%2?'right':'left'}:-8%;background:${i%2?'rgba(109,91,208,.16)':'rgba(229,207,167,.35)'}`;
    el.prepend(b);
  });

  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const boot=()=>{
    if(!window.gsap||!window.ScrollTrigger){return setTimeout(boot,200);}
    gsap.registerPlugin(ScrollTrigger);

    /* split-char reveal for display headings (word-safe: letters stay grouped per word) */
    document.querySelectorAll('h2.d, h3.d').forEach(h=>{
      if(h.dataset.split)return;h.dataset.split='1';
      const walk=(node)=>{
        [...node.childNodes].forEach(n=>{
          if(n.nodeType===3){
            const frag=document.createDocumentFragment();
            const parts=n.textContent.split(/(\s+)/);
            parts.forEach(part=>{
              if(!part)return;
              if(/\s+/.test(part)){frag.appendChild(document.createTextNode(' '));return;}
              const word=document.createElement('span');word.className='word';
              [...part].forEach(c=>{
                const s=document.createElement('span');s.className='ch';s.textContent=c;word.appendChild(s);
              });
              frag.appendChild(word);
            });
            n.replaceWith(frag);
          } else if(n.nodeType===1){walk(n);}
        });
      };
      walk(h);
      const chars=h.querySelectorAll('.ch');
      if(!chars.length)return;
      gsap.from(chars,{yPercent:120,opacity:0,rotate:6,duration:.9,ease:'expo.out',stagger:.014,
        scrollTrigger:{trigger:h,start:'top 88%'}});
    });

    /* image mask reveals + parallax */
    document.querySelectorAll('.zoom img, .pcard img, .story-card img').forEach(img=>{
      gsap.fromTo(img,{clipPath:'inset(14% 14% 14% 14% round 22px)',scale:1.14},
        {clipPath:'inset(0% 0% 0% 0% round 22px)',scale:1,duration:1.5,ease:'expo.out',
         scrollTrigger:{trigger:img,start:'top 92%'}});
      gsap.to(img,{yPercent:-8,ease:'none',scrollTrigger:{trigger:img,start:'top bottom',end:'bottom top',scrub:true}});
    });

    /* staggered card entrances (IntersectionObserver = pin-safe) */
    const cio=new IntersectionObserver((es)=>{es.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);
      gsap.fromTo(e.target,{y:70,autoAlpha:0,scale:.96},{y:0,autoAlpha:1,scale:1,duration:1,ease:'expo.out',clearProps:'all'});});},{threshold:.08});
    document.querySelectorAll('#propGrid > *, #destinations article, #destinations a.zoom, #insights article, #insights a').forEach((c,i)=>{
      c.style.willChange='transform';cio.observe(c);});
    document.querySelectorAll('.pcard, .proj').forEach(c=>{
      c.style.transformStyle='preserve-3d';
      c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        gsap.to(c,{rotateY:x*7,rotateX:-y*6,y:-8,duration:.5,ease:'power2.out',transformPerspective:900});});
      c.addEventListener('pointerleave',()=>gsap.to(c,{rotateY:0,rotateX:0,y:0,duration:.7,ease:'expo.out'}));
    });

    /* magnetic buttons */
    document.querySelectorAll('.btn, .link-arrow').forEach(b=>{
      b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();
        gsap.to(b,{x:(e.clientX-(r.left+r.width/2))*.18,y:(e.clientY-(r.top+r.height/2))*.25,duration:.4});});
      b.addEventListener('pointerleave',()=>gsap.to(b,{x:0,y:0,duration:.6,ease:'elastic.out(1,.4)'}));
    });

    /* section panes rise */
    document.querySelectorAll('section').forEach(s=>{
      if(s.classList.contains('hero') || s.id==='map')return; // scale breaks Leaflet map
      gsap.fromTo(s,{scale:.985,opacity:.72},{scale:1,opacity:1,duration:1,ease:'expo.out',
        scrollTrigger:{trigger:s,start:'top 92%'}});
    });

    /* gold rules grow */
    document.querySelectorAll('.rule-gold').forEach(r=>{
      gsap.from(r,{scaleX:0,transformOrigin:'left center',duration:1.1,ease:'expo.out',
        scrollTrigger:{trigger:r,start:'top 95%'}});
    });

    ScrollTrigger.refresh();
  };
  setTimeout(boot,900);
})();

</script>

<?php wp_footer(); ?>


</body>
</html>
