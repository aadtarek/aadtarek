<?php if ( ! defined( 'ABSPATH' ) ) exit; ?>
<?php cheops_use_icon_footer(); ?>
<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<title>About Cheops Privé | A Private Approach to Property in Egypt</title>
<link data-cheops-hero-preload rel="preload" as="image" fetchpriority="high" href="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/f9474888e9cc.jpg' ); ?>"<?php echo cheops_hero_img_attrs(get_template_directory_uri() . '/assets/generated/f9474888e9cc.jpg', true); ?>>


<meta content="A cinematic property discovery platform for luxury residences, offices, clinics and retail across New Cairo, Mostakbal City, the New Capital and the coast." name="description"/>
<meta content="Cheops Privé | Define Your Next Address" property="og:title"/>
<meta content="Discover projects, destinations, developers and properties across Egypt's most prime addresses." property="og:description"/>
<meta content="website" property="og:type"/>
<link href="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>" rel="icon"/>
<!-- CHEOPS VIDEO PRELOADER: added without changing existing site styles -->

<!-- Section boxed layout: body stays full width, each section is individually framed -->



<?php cheops_page_css('about', ['home-refinements']); ?>
<?php wp_head(); ?>
</head>
<body <?php body_class('cheops-home-edited cheops-about-page'); ?>><?php cheops_site_header(); ?>
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
<img alt="Luxury residential architecture in New Cairo" id="heroImg" fetchpriority="high" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/f9474888e9cc.jpg' ); ?>"<?php echo cheops_hero_img_attrs(get_template_directory_uri() . '/assets/generated/f9474888e9cc.jpg'); ?>/>
<div class="overlay" style="position:absolute;inset:0"></div>
<div class="about-frame"></div>
<div class="wrap" style="position:relative;z-index:2;color:#fff;padding-bottom:56px;width:100%">
<p class="eyebrow" style="display:flex;align-items:center;gap:12px;opacity:.75">Who we are</p>
<h1 class="d d-xl hero-title-single about-hero-title" style="margin:18px 0 0">
  <span class="hero-title-line hero-title-line-main">
    <span class="rl about-title-part about-title-first"><span>About</span></span>
    <span class="rl about-title-part about-title-brand"><span>Cheops Privé</span></span>
  </span>
</h1>
<p class="hero-lead">Cheops Privé is the first private secondary real estate advisory.</p>
<div style="margin-top:38px;display:flex;flex-wrap:wrap;gap:18px">
<a class="btn btn-light" href="#values">Our collection <span class="ar">→</span></a>
<a class="btn btn-light" href="<?php echo esc_url(home_url('/contact/')); ?>">Talk to us <span class="ar">→</span></a>
</div>
</div>
</section><section class="sec wrap" id="about">
  <div class="about-shell reveal">
    <div class="about-top">
      <div class="about-kicker">About Cheops Privé</div>
    </div>
    <div class="about-grid">
      <div class="about-intro">
        <h2 class="about-title d">A more considered way to find your next address.</h2>
        <p class="about-lead">Everything we feature is selected to make the search feel clearer, calmer and more personal not louder.</p>
        <a class="btn btn-light cheops-about-properties" href="<?php echo esc_url(home_url('/properties/')); ?>">Explore Properties <span class="ar">→</span></a>
      </div>
      <div class="about-copy">
        <p>Cheops Privé takes a more considered approach to property discovery. We bring together exceptional projects, destinations and individual residences into one curated experience, designed to make finding your next address feel more personal, refined and effortless.</p>
        <?php cheops_render_about_points(); ?>
      </div>
    </div>
  </div>
</section>

<section class="sec wrap" id="story">
  <div class="story-grid">
    <div class="zoom story-media reveal"><img alt="Cheops Privé curated architecture" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/f9474888e9cc.jpg' ); ?>"/></div>
    <div>
      <p class="eyebrow gold">Our story</p>
      <h2 class="d d-lg reveal" style="margin-top:14px;font-size:clamp(2.7rem,4.5vw,4.86rem);line-height:1.02"><span class="rl"><span>Built on quiet</span></span><span class="rl"><span>confidence.</span></span></h2>
      <p style="margin-top:24px">The vision for Cheops Privé was born from a desire to blend timeless heritage with modern luxury, inspired by the ingenuity and the precision of “Khufu” The Great Pyramid.</p>
      <p style="margin-top:20px">Cheops Privé brings together exclusivity, precision and innovation to create deeply personal real-estate journeys where ancient heritage meets contemporary sophistication.</p>
      <a class="btn btn-ghost" href="#values" style="margin-top:34px">How we work <span class="ar">→</span></a>
    </div>
  </div>
</section>
<section class="sec wrap" id="services">
<p class="eyebrow gold">What we do</p>
<h2 class="d d-lg reveal" style="margin-top:20px"><span class="rl"><span>Six ways we work</span></span><span class="rl"><span>with you.</span></span></h2>
<div class="svc-grid"><div class="svc reveal"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V20h14V9.8"/><path d="M10 20v-6h4v6"/></svg></div><h3 class="d">Residential Sales</h3><p>Apartments, villas and penthouses across New Cairo, Mostakbal City and the New Capital.</p></div><div class="svc reveal"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v13H4z"/><path d="M9 20v-6h6v6"/><path d="M8 3v4M16 3v4"/></svg></div><h3 class="d">Leasing</h3><p>Tenant representation and landlord leasing terms handled end to end.</p></div><div class="svc reveal"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4h9v17"/><path d="M14 9h5v12"/><path d="M8 8h3M8 12h3M8 16h3M17 13h0M17 17h0"/></svg></div><h3 class="d">Offices</h3><p>Full office floors, fitted suites and headquarters buildings in prime business districts.</p></div><div class="svc reveal"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v14H4z"/><path d="M12 10v6M9 13h6"/><path d="M9 6V3h6v3"/></svg></div><h3 class="d">Clinic Suites</h3><p>Licensed medical units in serviced medical towers with parking and patient flow in mind.</p></div><div class="svc reveal"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1 11H5z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg></div><h3 class="d">Administrative</h3><p>Street retail, mall units and F&B footprints matched to real catchment numbers.</p></div><div class="svc reveal"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16"/><path d="M7 19v-6M12 19V8M17 19v-9"/><path d="M14 5h5v5"/></svg></div><h3 class="d">Investment Advisory</h3><p>Payment plans, yields and exit timing reviewed with you before you commit.</p></div></div>
</section>
<section class="sec" id="values" style="background:#f7f5f2">
  <div class="wrap">
    <p class="eyebrow gold">How we work</p>
    <h2 class="d d-lg reveal" style="margin-top:20px"><span class="rl"><span>Three principles,</span></span><span class="rl"><span>no exceptions.</span></span></h2>
    <div class="val-grid">
      <div class="val reveal"><div class="n">01</div><h3 class="d">Curation before volume</h3><p>Every project is reviewed before it reaches you. If it does not hold up in person, it does not appear here.</p></div>
      <div class="val reveal"><div class="n">02</div><h3 class="d">Private guidance</h3><p>One advisor from the first shortlist to handover, contracts and leasing terms.</p></div>
      <div class="val reveal"><div class="n">03</div><h3 class="d">Clarity on numbers</h3><p>Real starting prices, real availability, real payment plans. No pressure, no invented urgency.</p></div>
    </div>
  </div>
</section>
<?php cheops_render_tenants_band(); ?>
<?php cheops_render_projects_band(); ?>
<?php cheops_render_developers_band(); ?>

<section class="sec" id="insights" style="background:#f7f5f2">
<div class="wrap">
<div class="home-section-heading" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px">
<div><p class="eyebrow gold">Insights</p><h2 class="d d-lg reveal" style="margin-top:20px"><span class="rl"><span style="white-space:nowrap">Notes from the market.</span></span></h2></div>
<div><a class="btn" href="<?php echo esc_url(cheops_insights_url()); ?>">All articles <span class="ar">→</span></a></div></div>
<?php cheops_render_insight_cards(4); ?>
</div>
</section>
<?php cheops_render_project_map_section(); ?>

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

/* property search filter */
const form=document.getElementById('searchLight');
function filter(f){
  const cards=[...document.querySelectorAll('#propGrid > *')];
  cards.forEach(c=>{
    const okT=!f.type||c.dataset.type===f.type;
    const okL=!f.loc||c.dataset.loc===f.loc;
    const okB=!f.beds||(+c.dataset.beds>=+f.beds);
    c.style.display=(okT&&okL&&okB)?'':'none';
  });
}
document.querySelectorAll('form[data-search]').forEach(fm=>{
  fm.addEventListener('submit',e=>{e.preventDefault();
    const d=new FormData(fm); filter({type:d.get('type'),loc:d.get('loc'),beds:d.get('beds')});
    document.getElementById('propGrid').scrollIntoView({behavior:'smooth',block:'center'});
  });
  fm.addEventListener('reset',()=>setTimeout(()=>filter({}),0));
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
    /* Headings are split and animated only as they approach the viewport, so the page
       does not build and animate thousands of letters up front. Same effect as before. */
    const near=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;near.unobserve(e.target);const f=e.target.__cheopsNear;delete e.target.__cheopsNear;f&&f();}),{rootMargin:'300px 0px'});
    const whenNear=(el,fn)=>{el.__cheopsNear=fn;near.observe(el);};
    document.querySelectorAll('h2.d, h3.d').forEach(h=>whenNear(h,()=>{
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
    }));

    /* image mask reveals + parallax */
    document.querySelectorAll('.zoom img, .pcard img, .story-card img').forEach(img=>whenNear(img,()=>{
      gsap.fromTo(img,{clipPath:'inset(14% 14% 14% 14% round 22px)',scale:1.14},
        {clipPath:'inset(0% 0% 0% 0% round 22px)',scale:1,duration:1.5,ease:'expo.out',
         scrollTrigger:{trigger:img,start:'top 92%'}});
      gsap.to(img,{yPercent:-8,ease:'none',scrollTrigger:{trigger:img,start:'top bottom',end:'bottom top',scrub:true}});
    }));

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
