<?php if ( ! defined( 'ABSPATH' ) ) exit; ?>
<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<title>Properties | Cheops Privé, Curated Property in Egypt</title>

<meta content="Explore a curated collection of residences, offices, clinics and retail opportunities across Egypt’s prime addresses." name="description"/>
<meta content="Cheops Privé | Define Your Next Address" property="og:title"/>
<meta content="Browse curated properties across New Cairo, Mostakbal City, the New Capital, the coast and selected prime destinations." property="og:description"/>
<meta content="website" property="og:type"/>
<link href="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>" rel="icon"/>
<!-- CHEOPS VIDEO PRELOADER: added without changing existing site styles -->

<!-- Section boxed layout: body stays full width, each section is individually framed -->





<?php cheops_page_css('properties'); ?>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>><?php cheops_site_header(); ?>
<?php wp_body_open(); ?>
<!-- CHEOPS VIDEO PRELOADER: added without changing existing page content -->
<div aria-label="Loading" id="cheops-video-preloader">
<video id="cheops-preloader-video" muted="" playsinline="" preload="none">
<source src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/72bcbd3c625e.mp4' ); ?>" type="video/mp4"/>
</video>
</div>
<div id="pre">
<div style="text-align:center">
<img alt="Cheops Privé" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>" style="height:44px;margin:0 auto;filter:brightness(0) invert(1)"/>
<div class="cnt" id="preCount">00</div>
<div class="bar"><i id="preBar"></i></div>
<p class="eyebrow" style="margin-top:22px;opacity:.5">Define your next address</p>
</div>
</div>
<div class="cursor" id="cursor"><b></b></div>
<header class="nav" id="nav">
<div class="wrap nav-inner">
<a aria-label="Cheops Privé home" href="<?php echo esc_url( home_url('/') ); ?>"><img alt="Cheops Privé" class="logo" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>"/></a>
<nav aria-label="Primary" class="nav-links">
<a href="<?php echo esc_url( home_url('/#projects') ); ?>">Projects</a>
<a href="<?php echo esc_url( home_url('/#destinations') ); ?>">Communities</a>
<a class="active" href="#properties">Properties</a>
<a href="<?php echo esc_url( home_url('/#destinations') ); ?>">Destinations</a>
<a href="<?php echo esc_url( home_url('/about/') ); ?>">About</a>
<a href="<?php echo esc_url( home_url('/#insights') ); ?>">Insights</a>
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
<a href="<?php echo esc_url( home_url('/#projects') ); ?>">Projects</a><a href="<?php echo esc_url( home_url('/#destinations') ); ?>">Communities</a><a class="active" href="#properties">Properties</a>
<a href="<?php echo esc_url( home_url('/#destinations') ); ?>">Destinations</a><a href="<?php echo esc_url( home_url('/about/') ); ?>">About</a><a href="<?php echo esc_url( home_url('/#insights') ); ?>">Insights</a><a href="#contact">Contact</a>
</nav>
</div>
<main id="top">
<section class="hero properties-hero" id="hero">
  <img id="heroImg" alt="Curated luxury property collection by Cheops Privé" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/f9474888e9cc.jpg' ); ?>"/>
  <div class="overlay" style="position:absolute;inset:0"></div>
  <div class="wrap hero-copy">
    <p class="eyebrow" style="display:flex;align-items:center;gap:12px;opacity:.78">Properties · Private collection</p>
    <h1 class="d"><span class="rl"><span>Find the address</span></span><span class="rl"><span>worth <em>choosing.</em></span></span></h1>
    <p class="lead">A considered collection of homes, workspaces and administrative opportunities across Egypt's most sought-after destinations, selected for quality, location and long-term value.</p>
    <div class="hero-meta"><span>Residences</span><span>Offices</span><span>Medical</span><span>Retail</span><span>Curated only</span></div>
    <div style="margin-top:34px;display:flex;flex-wrap:wrap;gap:14px">
      <a class="btn btn-light" href="#property-search">Search properties <span class="ar">→</span></a>
      <a class="btn btn-light" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">Private request <span class="ar">→</span></a>
    </div>
  </div>
</section>

<section class="sec" id="property-search">
  <div class="wrap">
    <div class="collection-head">
      <div><p class="eyebrow gold">Refine your search</p><h2 class="d d-lg reveal" style="margin:18px 0 0"><span class="rl"><span>Start with what matters.</span></span></h2></div>
      <p style="max-width:390px;font-size:.792rem;line-height:1.75;color:var(--muted);margin:0">Filter by destination, property type, bedrooms and budget. Availability and final pricing are confirmed privately.</p>
    </div>
    <form class="search light" data-search="" style="margin-top:38px">
      <div class="fields">
        <div class="field"><label>Search by</label><select name="loc"><option value="">Location, compound or developer</option><?php cheops_taxonomy_options_html('unit_location',['New Cairo','Mostakbal City','New Capital','North Coast','Ain Sokhna','Sheikh Zayed']); ?></select></div>
        <div class="field"><label>Project</label><select name="project"><option value="">Any project</option><?php cheops_project_options_html(); ?></select></div>
        <div class="field"><label>Listing</label><select name="deal"><option value="">Sale or Rent</option><option value="sale">For Sale</option><option value="rent">For Rent</option></select></div><div class="field"><label>Property type</label><select name="type"><option value="">Any type</option><option value="Residential">Residential</option><?php cheops_taxonomy_options_html('unit_type',['Apartment','Villa','Townhouse','Twinhouse','Duplex','Penthouse','Chalet','Office','Clinic','Retail']); ?></select></div>
        <div class="field"><label>Bedrooms</label><select name="beds"><option value="">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option><option value="5">5+</option></select></div>
        <div class="field"><label>Price range (EGP)</label><div style="display:flex;gap:10px"><input inputmode="numeric" name="min" placeholder="Min"/><input inputmode="numeric" name="max" placeholder="Max"/></div></div>
      </div>
      <div style="margin-top:22px;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
        <button class="btn" type="submit">Show properties <span class="ar">→</span></button>
        <button class="eyebrow" style="background:none;border:0;cursor:pointer;color:inherit;opacity:.7" type="reset">Reset</button>
      </div>
    </form>
    <div class="quick-grid" aria-label="Browse by property type">
      <button class="quick-card" type="button" data-quick-type="Apartment"><span class="qicon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4h14v17"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2"/><path d="M10 21v-3h4v3"/></svg></span><span class="qtitle">Apartments</span><span class="qmeta">Urban residences →</span></button>
      <button class="quick-card" type="button" data-quick-type="Villa"><span class="qicon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/><path d="M17 7V4h2v5"/></svg></span><span class="qtitle">Villas</span><span class="qmeta">Private living →</span></button>
      <button class="quick-card" type="button" data-quick-type="Office"><span class="qicon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V3h10v18"/><path d="M15 8h4v13"/><path d="M8 7h4M8 11h4M8 15h4M17 12h0M17 16h0"/><path d="M3 21h18"/></svg></span><span class="qtitle">Offices</span><span class="qmeta">Business addresses →</span></button>
      <button class="quick-card" type="button" data-quick-type="Clinic"><span class="qicon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v14H4z"/><path d="M12 10v6M9 13h6"/><path d="M9 6V3h6v3"/></svg></span><span class="qtitle">Clinics</span><span class="qmeta">Medical suites →</span></button>
    </div>
  </div>
</section>

<section class="sec" id="properties">
  <div class="wrap">
    <div class="collection-head">
      <div><p class="eyebrow gold">Selected opportunities</p><h2 class="d d-lg reveal" style="margin:18px 0 0"><span class="rl"><span>The current collection.</span></span></h2></div>
      <p class="collection-count" id="resultCount">6 properties</p>
    </div>
    <div class="grid3" id="propGrid" style="margin-top:0;display:grid;gap:24px">
      <?php if (!cheops_render_unit_cards(['limit'=>-1,'featured'=>false])): ?><article class="pcard reveal" data-deal="sale" data-beds="3" data-loc="Mostakbal City" data-price="8500000" data-type="Apartment">
<div class="zoom" data-cursor="View property" style="position:relative;aspect-ratio:4/3">
<img alt="Luxury Apartment in Sarai, Mostakbal City" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/5c624eb97e16.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">Apartment</span>
<button aria-label="Save property" aria-pressed="false" class="save-property" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border:0;width:34px;height:34px;cursor:pointer;font-size:.81rem">♡</button>
</div>
<div style="padding:20px">
<h3 class="d" style="font-size:1.35rem;margin:0">Luxury Apartment</h3>
<p class="meta" style="margin-top:8px">Sarai · Mostakbal City</p>
<p style="margin-top:14px;font-size:.738rem;color:var(--muted)">3 Beds · 3 Baths · 185 m²</p>
<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
<p class="d" style="font-size:1.17rem;margin:0">EGP 8,500,000</p>
<span class="gold">→</span>
</div>
</div><div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="<?php echo esc_url( cheops_phone_url() ); ?>">Call <span class="ar">→</span></a></div></article>
<article class="pcard reveal" data-deal="sale" data-beds="4" data-loc="New Cairo" data-price="19750000" data-type="Penthouse">
<div class="zoom" data-cursor="View property" style="position:relative;aspect-ratio:4/3">
<img alt="Signature Penthouse in Talala, New Cairo" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/fb144638dcc9.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">Penthouse</span>
<button aria-label="Save property" aria-pressed="false" class="save-property" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border:0;width:34px;height:34px;cursor:pointer;font-size:.81rem">♡</button>
</div>
<div style="padding:20px">
<h3 class="d" style="font-size:1.35rem;margin:0">Signature Penthouse</h3>
<p class="meta" style="margin-top:8px">Talala · New Cairo</p>
<p style="margin-top:14px;font-size:.738rem;color:var(--muted)">4 Beds · 4 Baths · 320 m²</p>
<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
<p class="d" style="font-size:1.17rem;margin:0">EGP 19,750,000</p>
<span class="gold">→</span>
</div>
</div><div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="<?php echo esc_url( cheops_phone_url() ); ?>">Call <span class="ar">→</span></a></div></article>
<article class="pcard reveal" data-deal="sale" data-beds="5" data-loc="New Cairo" data-price="26400000" data-type="Villa">
<div class="zoom" data-cursor="View property" style="position:relative;aspect-ratio:4/3">
<img alt="Garden Villa in Taj City, New Cairo" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/d9f92ab0fa62.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">Villa</span>
<button aria-label="Save property" aria-pressed="false" class="save-property" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border:0;width:34px;height:34px;cursor:pointer;font-size:.81rem">♡</button>
</div>
<div style="padding:20px">
<h3 class="d" style="font-size:1.35rem;margin:0">Garden Villa</h3>
<p class="meta" style="margin-top:8px">Taj City · New Cairo</p>
<p style="margin-top:14px;font-size:.738rem;color:var(--muted)">5 Beds · 5 Baths · 415 m²</p>
<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
<p class="d" style="font-size:1.17rem;margin:0">EGP 26,400,000</p>
<span class="gold">→</span>
</div>
</div><div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="<?php echo esc_url( cheops_phone_url() ); ?>">Call <span class="ar">→</span></a></div></article>
<article class="pcard reveal" data-deal="sale" data-beds="0" data-loc="New Cairo" data-price="17800000" data-type="Office">
<div class="zoom" data-cursor="View property" style="position:relative;aspect-ratio:4/3">
<img alt="Corner Office Floor in Talala, New Cairo" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/ed8441727632.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">Office</span>
<button aria-label="Save property" aria-pressed="false" class="save-property" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border:0;width:34px;height:34px;cursor:pointer;font-size:.81rem">♡</button>
</div>
<div style="padding:20px">
<h3 class="d" style="font-size:1.35rem;margin:0">Corner Office Floor</h3>
<p class="meta" style="margin-top:8px">Talala · New Cairo</p>
<p style="margin-top:14px;font-size:.738rem;color:var(--muted)">2 Baths · 240 m²</p>
<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
<p class="d" style="font-size:1.17rem;margin:0">EGP 17,800,000</p>
<span class="gold">→</span>
</div>
</div><div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="<?php echo esc_url( cheops_phone_url() ); ?>">Call <span class="ar">→</span></a></div></article>
<article class="pcard reveal" data-deal="sale" data-beds="0" data-loc="Mostakbal City" data-price="8900000" data-type="Medical">
<div class="zoom" data-cursor="View property" style="position:relative;aspect-ratio:4/3">
<img alt="Medical Clinic Suite in Sarai, Mostakbal City" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/f205048fec6d.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">Medical</span>
<button aria-label="Save property" aria-pressed="false" class="save-property" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border:0;width:34px;height:34px;cursor:pointer;font-size:.81rem">♡</button>
</div>
<div style="padding:20px">
<h3 class="d" style="font-size:1.35rem;margin:0">Medical Clinic Suite</h3>
<p class="meta" style="margin-top:8px">Sarai · Mostakbal City</p>
<p style="margin-top:14px;font-size:.738rem;color:var(--muted)">2 Baths · 140 m²</p>
<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
<p class="d" style="font-size:1.17rem;margin:0">EGP 8,900,000</p>
<span class="gold">→</span>
</div>
</div><div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="<?php echo esc_url( cheops_phone_url() ); ?>">Call <span class="ar">→</span></a></div></article>
<article class="pcard reveal" data-deal="sale" data-beds="0" data-loc="New Cairo" data-price="9400000" data-type="Retail">
<div class="zoom" data-cursor="View property" style="position:relative;aspect-ratio:4/3">
<img alt="Boulevard Retail Unit in Taj City, New Cairo" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/aad1f08ab9f5.jpg' ); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
<span class="eyebrow" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.92);padding:7px 12px">Retail</span>
<button aria-label="Save property" aria-pressed="false" class="save-property" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border:0;width:34px;height:34px;cursor:pointer;font-size:.81rem">♡</button>
</div>
<div style="padding:20px">
<h3 class="d" style="font-size:1.35rem;margin:0">Boulevard Retail Unit</h3>
<p class="meta" style="margin-top:8px">Taj City · New Cairo</p>
<p style="margin-top:14px;font-size:.738rem;color:var(--muted)">1 Baths · 96 m²</p>
<div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
<p class="d" style="font-size:1.17rem;margin:0">EGP 9,400,000</p>
<span class="gold">→</span>
</div>
</div><div class="property-contact-actions"><a aria-label="Contact on WhatsApp" class="property-contact-btn whatsapp-btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank">WhatsApp <span class="ar">→</span></a><a aria-label="Call now" class="property-contact-btn call-btn" href="<?php echo esc_url( cheops_phone_url() ); ?>">Call <span class="ar">→</span></a></div></article><?php endif; ?>
      <div class="empty-state" id="emptyState"><p class="eyebrow gold">No exact matches</p><h3 class="d" style="font-size:2.16rem;margin:18px 0 0">Your property may still be available privately.</h3><p style="max-width:540px;margin:16px auto 0;color:var(--muted);line-height:1.8">Adjust the filters or send us a private brief and we’ll search beyond the public collection.</p><a class="btn" href="<?php echo esc_url( cheops_whatsapp_url() ); ?>" rel="noopener" target="_blank" style="margin-top:24px">Send a private brief <span class="ar">→</span></a></div>
    </div>
    <nav class="cheops-pagination" id="cheopsPagination" aria-label="Property results pages"></nav>
  </div>
</section>

</main>
<footer class="ink grain" id="contact" style="position:relative">
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
<div class="col"><h3 class="eyebrow gold">Projects</h3><div style="margin-top:18px;display:grid;gap:12px"><a href="<?php echo esc_url( home_url('/#projects') ); ?>">All projects</a><a href="#properties">Residences</a><a href="<?php echo esc_url( home_url('/#destinations') ); ?>">Communities</a><a href="<?php echo esc_url( home_url('/#insights') ); ?>">Insights</a></div></div>
<div class="col"><h3 class="eyebrow gold">Destinations</h3><div style="margin-top:18px;display:grid;gap:12px"><a href="<?php echo esc_url( home_url('/#destinations') ); ?>">All destinations</a><a href="<?php echo esc_url( home_url('/#destinations') ); ?>">New Cairo</a><a href="<?php echo esc_url( home_url('/#destinations') ); ?>">New Capital</a><a href="<?php echo esc_url( home_url('/#destinations') ); ?>">North Coast</a></div></div>
<div class="col"><h3 class="eyebrow gold">Properties</h3><div style="margin-top:18px;display:grid;gap:12px"><a href="#properties">Browse all</a><a href="#properties">Apartments</a><a href="#properties">Villas</a><a href="#properties">Offices &amp; clinics</a></div></div>
<div class="col"><h3 class="eyebrow gold">Company</h3><div style="margin-top:18px;display:grid;gap:12px"><a href="<?php echo esc_url( home_url('/about/') ); ?>">About</a><a href="<?php echo esc_url( home_url('/#map') ); ?>">Developers</a><a href="<?php echo esc_url( home_url('/#insights') ); ?>">Insights</a><a href="#contact">Contact</a></div></div>
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
const MAP = [{"name": "LVLS", "destination": "New Cairo", "statement": "A north-east corner address, quiet and elevated above the city.", "price": "EGP 7.4M", "units": "218"}, {"name": "Aliva Fields Park", "destination": "Shorouk City", "statement": "Wide green fields and quiet courtyards, close to the water.", "price": "EGP 5.9M", "units": "164"}, {"name": "The Gardens", "destination": "New Cairo", "statement": "Landscaped living just minutes from AUC, by MarQ.", "price": "EGP 11.2M", "units": "76"}, {"name": "Solana", "destination": "New Cairo", "statement": "An eastern address by Ora, built for calm, everyday living.", "price": "EGP 6.3M", "units": "142"}];
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

  if(reduce) return;
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

/* property search filter + client-side pagination */
const PAGE_SIZE=9;
let cheopsPage=1;
function cheopsMatchingCards(){return [...document.querySelectorAll('#propGrid > article.pcard')].filter(c=>c.dataset.matches!=='0');}
function renderPage(page){
  const cards=[...document.querySelectorAll('#propGrid > article.pcard')], matched=cheopsMatchingCards();
  const pages=Math.max(1,Math.ceil(matched.length/PAGE_SIZE)); cheopsPage=Math.min(Math.max(1,page),pages);
  cards.forEach(c=>c.style.display='none'); matched.forEach((c,i)=>{if(i>=(cheopsPage-1)*PAGE_SIZE&&i<cheopsPage*PAGE_SIZE)c.style.display='';});
  const count=document.getElementById('resultCount');if(count) count.textContent=matched.length+' '+(matched.length===1?'property':'properties');
  const empty=document.getElementById('emptyState');if(empty) empty.classList.toggle('show',matched.length===0);
  const nav=document.getElementById('cheopsPagination');if(nav){nav.innerHTML='';if(matched.length>PAGE_SIZE){for(let i=1;i<=pages;i++){const b=document.createElement('button');b.type='button';b.textContent=i;b.className=i===cheopsPage?'is-active':'';b.setAttribute('aria-label','Page '+i);b.addEventListener('click',()=>{renderPage(i);document.getElementById('properties').scrollIntoView({behavior:'smooth',block:'start'});});nav.appendChild(b);}}}
}
function filter(f){
  const cards=[...document.querySelectorAll('#propGrid > article.pcard')];
  const min=Number(String(f.min||'').replace(/[^0-9]/g,''))||0,max=Number(String(f.max||'').replace(/[^0-9]/g,''))||Infinity;
  cards.forEach(c=>{const price=Number(c.dataset.price||0),residentialTypes=['Apartment','Villa','Townhouse','Twinhouse','Duplex','Penthouse','Chalet'];const okT=!f.type||(f.type==='Residential'?residentialTypes.includes(c.dataset.type):c.dataset.type===f.type);const okD=!f.deal||c.dataset.deal===f.deal;const okL=!f.loc||c.dataset.loc===f.loc;const okProj=!f.project||c.dataset.project===f.project;const okB=!f.beds||(+c.dataset.beds>=+f.beds);const okP=price>=min&&price<=max;c.dataset.matches=(okT&&okD&&okL&&okProj&&okB&&okP)?'1':'0';});
  renderPage(1);
}
document.querySelectorAll('form[data-search]').forEach(fm=>{
  fm.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(fm);filter({deal:d.get('deal'),type:d.get('type'),loc:d.get('loc'),project:d.get('project'),beds:d.get('beds'),min:d.get('min'),max:d.get('max')});document.getElementById('properties').scrollIntoView({behavior:'smooth',block:'start'});});
  fm.addEventListener('reset',()=>setTimeout(()=>filter({}),0));
});
document.querySelectorAll('#propGrid > article.pcard').forEach(c=>c.dataset.matches='1');renderPage(1);

/* property page quick filters + save hearts */
document.querySelectorAll('[data-quick-type]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const fm=document.querySelector('#property-search form[data-search]');
    if(!fm)return;
    fm.querySelector('[name="type"]').value=btn.dataset.quickType||'';
    filter({deal:fm.querySelector('[name="deal"]').value,type:btn.dataset.quickType||'',loc:fm.querySelector('[name="loc"]').value,project:fm.querySelector('[name="project"]').value,beds:fm.querySelector('[name="beds"]').value,min:fm.querySelector('[name="min"]').value,max:fm.querySelector('[name="max"]').value});
    document.getElementById('properties').scrollIntoView({behavior:'smooth',block:'start'});
  });
});
document.querySelectorAll('.save-property').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const on=btn.getAttribute('aria-pressed')==='true';
    btn.setAttribute('aria-pressed',String(!on));
    btn.textContent=on?'♡':'♥';
  });
});

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
<!-- Intro video preloader intentionally disabled on inner pages -->

<?php wp_footer(); ?>
</body>
</html>
