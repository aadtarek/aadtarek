<?php if ( ! defined( 'ABSPATH' ) ) exit; ?>
<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<title>About Cheops Privé — A Private Approach to Property in Egypt</title>
<link data-cheops-hero-preload rel="preload" as="image" fetchpriority="high" href="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/f9474888e9cc.jpg' ); ?>">

<link data-cheops-font-preload rel="preload" href="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/79d5dddb2cad.otf' ); ?>" as="font" type="font/otf" crossorigin>

<meta content="A cinematic property discovery platform for luxury residences, offices, clinics and retail across New Cairo, Mostakbal City, the New Capital and the coast." name="description"/>
<meta content="Cheops Privé — Define Your Next Address" property="og:title"/>
<meta content="Discover projects, destinations, developers and properties across Egypt's most prime addresses." property="og:description"/>
<meta content="website" property="og:type"/>
<link href="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>" rel="icon"/>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<style>
@font-face{
  font-family:"Romie";
  src:url(<?php echo esc_url( get_template_directory_uri() . '/assets/generated/79d5dddb2cad.otf' ); ?>) format("opentype");
  font-weight:400;
  font-style:normal;
  font-display:swap;
}
:root{
  --white:#ffffff; --ink:#1a1a1a; --gold:#e5cfa7;
  --muted:#6f6f6f; --line:rgba(26,26,26,.12);
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--white);color:var(--ink);font-family:"Romie",sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
.wrap{max-width:1560px;margin:0 auto;padding:0 20px}
@media(min-width:640px){.wrap{padding:0 32px}}
@media(min-width:1024px){.wrap{padding:0 48px}}
.d{font-family:"Romie",serif;font-weight:400;letter-spacing:-.02em;line-height:.95}
.d-xl{font-size:clamp(2.88rem,8.1vw,8.55rem)}
.d-lg{font-size:clamp(2.16rem,5.04vw,4.86rem)}
.d-md{font-size:clamp(1.44rem,2.34vw,2.34rem);line-height:1.05}
.eyebrow{font-size:.522rem;letter-spacing:.28em;text-transform:uppercase;font-weight:700}
.gold{color:var(--gold)}
.rule-gold{height:1px;background:var(--gold)}
.ink{background:var(--ink);color:#f4f1ec}
.grain:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.05;background-image:radial-gradient(rgba(255,255,255,.6) 1px,transparent 1px);background-size:3px 3px}
.overlay{background:linear-gradient(to top,rgba(10,10,10,.86) 0%,rgba(10,10,10,.35) 45%,rgba(10,10,10,.15) 100%)}
.reveal{opacity:0;transform:translateY(38px);transition:opacity 1.1s cubic-bezier(.16,1,.3,1),transform 1.1s cubic-bezier(.16,1,.3,1)}
.reveal.on{opacity:1;transform:none}
.rl{display:block;overflow:hidden}
.rl>span{display:block;transform:translateY(105%);transition:transform 1.15s cubic-bezier(.16,1,.3,1)}
.on .rl>span,.rl.on>span{transform:none}
.zoom{overflow:hidden}
.zoom img{transition:transform 1.6s cubic-bezier(.16,1,.3,1)}
.zoom:hover img{transform:scale(1.07)}
.btn{display:inline-flex;align-items:center;gap:.8rem;border:1px solid var(--ink);background:var(--ink);color:#fff;padding:16px 28px;font-size:.54rem;font-weight:800;letter-spacing:.24em;text-transform:uppercase;position:relative;overflow:hidden;transition:color .5s}
.btn .ar{transition:transform .5s}
.btn:hover .ar{transform:translateX(7px)}
.btn:hover{color:var(--gold)}
.btn-light{background:transparent;border-color:rgba(255,255,255,.55);color:#fff}
.btn-light:hover{border-color:var(--gold);color:var(--gold)}
.btn-ghost{background:transparent;border-color:var(--line);color:var(--ink)}
.btn-ghost:hover{border-color:var(--gold);color:var(--ink)}
.link-arrow .ar{display:inline-block;transition:transform .5s}
.link-arrow:hover .ar{transform:translateX(7px)}
header.nav{position:fixed;inset:0 0 auto 0;z-index:60;transition:background .6s,border-color .6s,backdrop-filter .6s;border-bottom:1px solid transparent}
header.nav.scrolled{background:rgba(255,255,255,.86);backdrop-filter:blur(14px);border-bottom-color:var(--line)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;gap:24px;padding-top:18px;padding-bottom:18px}
.nav-links{display:none;gap:34px;font-size:.54rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase}
@media(min-width:1024px){.nav-links{display:flex}}
.nav-links a{position:relative;padding-bottom:4px;color:inherit;opacity:.8}
.nav-links a:after{content:"";position:absolute;left:0;bottom:0;height:1px;width:0;background:var(--gold);transition:width .5s}
.nav-links a:hover:after{width:100%}
header.nav:not(.scrolled) .nav-inner{color:#fff}
.logo{height:34px;width:auto}
header.nav:not(.scrolled) .logo{filter:brightness(0) invert(1)}
.burger{display:grid;gap:5px;background:none;border:0;cursor:pointer;padding:10px}
@media(min-width:1024px){.burger{display:none}}
.burger span{display:block;width:24px;height:1px;background:currentColor}
.menu{position:fixed;inset:0;z-index:70;background:var(--ink);color:#f4f1ec;display:none;padding:28px 24px}
.menu.open{display:block}
.menu a{display:block;font-family:"Romie",serif;font-size:2.16rem;padding:10px 0;opacity:0;transform:translateY(28px);animation:mi .7s cubic-bezier(.16,1,.3,1) forwards}
@keyframes mi{to{opacity:1;transform:none}}
#pre{position:fixed;inset:0;z-index:100;background:var(--ink);color:#f4f1ec;display:grid;place-items:center;transition:clip-path 1.2s cubic-bezier(.76,0,.24,1),opacity .6s}
#pre.done{clip-path:inset(0 0 100% 0);pointer-events:none}
#pre .cnt{font-family:"Romie",serif;font-size:clamp(3.6rem,12.6vw,9rem);line-height:1}
#pre .bar{width:min(320px,60vw);height:1px;background:rgba(255,255,255,.18);margin-top:26px;overflow:hidden}
#pre .bar i{display:block;height:100%;width:0;background:var(--gold)}
.hero{position:relative;min-height:78svh;display:flex;align-items:flex-end;overflow:hidden;background:#000}
.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.scroll-line{display:inline-block;width:1px;height:52px;background:linear-gradient(var(--gold),transparent);animation:sl 2.4s infinite}
@keyframes sl{0%{transform:scaleY(.2);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}100%{transform:scaleY(.2);transform-origin:bottom}}
.search{border:1px solid rgba(255,255,255,.22);background:rgba(20,20,20,.42);backdrop-filter:blur(16px);padding:22px}
.search.light{border-color:var(--line);background:#fff;backdrop-filter:none}
.fields{display:grid;gap:14px;grid-template-columns:1fr}
@media(min-width:768px){.fields{grid-template-columns:repeat(4,1fr)}}
.field label{display:block;font-size:.495rem;letter-spacing:.24em;text-transform:uppercase;opacity:.65;margin-bottom:8px;font-weight:700}
.field select,.field input{width:100%;background:transparent;border:0;border-bottom:1px solid currentColor;padding:12px 6px;font:inherit;font-size:.774rem;color:inherit;opacity:.95;outline:none;border-radius:0;box-sizing:border-box}
.search:not(.light) select option{color:#111}
.pcard{border:1px solid var(--line);background:#fff;transition:transform .6s cubic-bezier(.16,1,.3,1),box-shadow .6s}
.pcard:hover{transform:translateY(-6px);box-shadow:0 26px 60px -32px rgba(0,0,0,.35)}
.meta{font-size:.522rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.proj{display:grid;gap:0;border-top:1px solid var(--line)}
@media(min-width:1024px){.proj{grid-template-columns:1.15fr .85fr;align-items:stretch}}
.map{position:relative;aspect-ratio:16/10;border:1px solid rgba(255,255,255,.1);background:#232323;
  background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:44px 44px}
.dot{position:absolute;transform:translate(-50%,-50%);background:none;border:0;cursor:pointer;color:#fff}
.dot i{display:block;width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.4);transition:all .5s;margin:0 auto}
.dot.on i{background:var(--gold);transform:scale(1.6)}
.dot span{display:block;margin-top:8px;font-size:.495rem;letter-spacing:.18em;text-transform:uppercase;opacity:.6;white-space:nowrap}
.cursor{position:fixed;top:0;left:0;z-index:90;width:14px;height:14px;border-radius:50%;background:var(--gold);pointer-events:none;mix-blend-mode:difference;transition:width .35s,height .35s,opacity .35s;display:grid;place-items:center;opacity:0}
.cursor.big{width:96px;height:96px;background:rgba(229,207,167,.92);mix-blend-mode:normal}
.cursor b{font-size:.45rem;letter-spacing:.16em;text-transform:uppercase;color:#1a1a1a;opacity:0;white-space:nowrap}
.cursor.big b{opacity:1}
@media(max-width:1023px){.cursor{display:none}}
.track{display:flex;gap:24px;width:max-content;padding:0 20px}
@media(min-width:1024px){.track{gap:40px;padding:0 48px}}
.story-card{position:relative;height:48vh;width:80vw;flex:0 0 auto;overflow:hidden;background:#000}
@media(min-width:640px){.story-card{width:56vw}}
@media(min-width:1024px){.story-card{height:54vh;width:42vw}}
footer .col a{font-size:.774rem;opacity:.68}
footer .col a:hover{opacity:1;color:var(--gold)}
.sec{padding:48px 0}
@media(min-width:1024px){.sec{padding:64px 0}}
@media (prefers-reduced-motion: reduce){
  .reveal,.rl>span{transition:none;opacity:1;transform:none}
}
/* ============ ULTRA RESTYLE v2 ============ */
/* fix: .sec overrode .wrap horizontal padding */
.sec.wrap{padding-left:20px;padding-right:20px}
@media(min-width:640px){.sec.wrap{padding-left:32px;padding-right:32px}}
@media(min-width:1024px){.sec.wrap{padding-left:48px;padding-right:48px}}
section{overflow:clip}

:root{--gold2:#c9a86a;--violet:white;--teal:#c9a86a;--r:999px}
body{background:
  radial-gradient(1200px 600px at 85% -5%, rgba(229,207,167,.22), transparent 60%),
  radial-gradient(900px 500px at -10% 40%, rgba(109,91,208,.10), transparent 60%),
  var(--white);}
/* rounded everything */
.btn,.btn-light,.btn-ghost,button[type=submit],button[type=reset]{border-radius:var(--r)!important}
.field select,.field input,input,select{border-radius:var(--r)!important}
.field select,.field input{padding:12px 6px !important;box-sizing:border-box !important}
.search{border-radius:32px!important}
.pcard,.story-card,.zoom,.map,.proj>.zoom,img{border-radius:22px}
.hero img,#heroImg{border-radius:0}
.pcard{overflow:hidden}
/* ---- ultra button ---- */
.btn{position:relative;isolation:isolate;padding:17px 32px;border-width:1px;transition:color .45s,transform .45s cubic-bezier(.16,1,.3,1),box-shadow .45s,border-color .45s}
.btn::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;
  background:linear-gradient(120deg,var(--gold) 0%,#f6e7c8 30%,var(--violet) 70%,var(--teal) 100%);
  background-size:260% 260%;transform:translateY(102%);transition:transform .6s cubic-bezier(.16,1,.3,1);}
.btn:hover::before{transform:translateY(0);animation:btnShift 3.2s linear infinite}
.btn:hover{color:#111!important;border-color:transparent;transform:translateY(-3px);box-shadow:0 18px 40px -18px rgba(109,91,208,.55)}
.btn:hover .ar{transform:translateX(9px)}
@keyframes btnShift{0%{background-position:0% 50%}100%{background-position:200% 50%}}
.btn-ghost{background:rgba(255,255,255,.6);backdrop-filter:blur(8px)}
/* ---- section shells ---- */
.sec{position:relative}
.sec-pane{border-radius:40px;overflow:hidden}
section#properties,section#insights{background:transparent!important}
section#properties>.wrap,section#insights>.wrap{position:relative}
section#properties::before,section#insights::before{content:"";position:absolute;inset:24px 12px;border-radius:44px;
  background:linear-gradient(180deg,#faf8f5,#f2eee8);border:1px solid rgba(26,26,26,.07);z-index:0}
section#properties>*,section#insights>*{position:relative;z-index:1}
section#map,section#storytelling{border-radius:44px;margin:0 12px;overflow:hidden}
.proj{border-top:0!important;gap:28px!important;padding:22px;border-radius:36px;background:rgba(255,255,255,.7);
  border:1px solid rgba(26,26,26,.07);box-shadow:0 30px 80px -60px rgba(0,0,0,.5);margin-bottom:34px;
  transition:box-shadow .7s,transform .7s cubic-bezier(.16,1,.3,1)}
.proj:hover{box-shadow:0 50px 110px -60px rgba(0,0,0,.55);transform:translateY(-6px)}
.proj>div[style*="padding"]{padding:34px!important}
.pcard{border-color:rgba(26,26,26,.08);background:rgba(255,255,255,.85);backdrop-filter:blur(6px)}
.pcard:hover{box-shadow:0 40px 90px -45px rgba(109,91,208,.35)}
/* gold chip headings */
.eyebrow.gold{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:var(--r);
  background:linear-gradient(120deg,rgba(229,207,167,.35),rgba(255, 255, 255, 0.16));color:#8a6b2f}
/* nav pill */
header.nav .nav-inner{margin-top:10px;border-radius:var(--r);padding:12px 22px;transition:background .6s,box-shadow .6s}
header.nav.scrolled{background:transparent!important;border-bottom-color:transparent!important;backdrop-filter:none}
header.nav.scrolled .nav-inner{background:rgba(255,255,255,.78);backdrop-filter:blur(16px);box-shadow:0 18px 40px -30px rgba(0,0,0,.5)}
header.nav.scrolled .nav-inner{color:var(--ink)}
header.nav.scrolled .logo{filter:none}
.nav-links a:hover{color:rgb(142, 131, 131)}
/* marquee */
.marq{overflow:hidden;border-top:1px solid var(--line);border-bottom:0px solid var(--line);padding:18px 0;margin:0 12px;border-radius:var(--r)}
.marq div{display:flex;gap:56px;width:max-content;animation:marq 26s linear infinite}
.marq span{font-family:"Romie",serif;font-size:1.35rem;opacity:1;white-space:nowrap}
@keyframes marq{to{transform:translateX(-50%)}}
/* scroll progress */
#prog{position:fixed;top:0;left:0;height:3px;width:0;z-index:95;
  background:linear-gradient(90deg,var(--gold),var(--violet),var(--teal))}
/* char reveal */
.ch{display:inline-block;will-change:transform,opacity}
h2.d .word,h3.d .word{display:inline-block;white-space:nowrap;word-break:keep-all;overflow-wrap:normal;hyphens:none}
/* glow blobs */
.blob{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0}
@media (prefers-reduced-motion:reduce){.marq div{animation:none}.btn:hover::before{animation:none}}

</style>
<!-- CHEOPS VIDEO PRELOADER: added without changing existing site styles -->
<style id="cheops-video-preloader-styles">
  #cheops-video-preloader{
    position:fixed;
    inset:0;
    width:100%;
    height:100vh;
    height:100dvh;
    z-index:2147483647;
    overflow:hidden;
    background:#050505;
    opacity:1;
    visibility:visible;
    pointer-events:auto;
    transition:opacity .75s cubic-bezier(.76,0,.24,1), visibility .75s ease;
  }
  #cheops-video-preloader.cheops-preloader-hidden{
    opacity:0;
    visibility:hidden;
    pointer-events:none;
  }
  #cheops-video-preloader video{
    position:absolute;
    inset:0;
    width:100%;f
    height:100%;
    display:block;
    object-fit:cover;
    object-position:center center;
    background:#050505;
  }
</style>
<style id="property-contact-actions-style">
/* Contact buttons inside every property/unit card */
#properties .pcard{display:flex;flex-direction:column}
#properties .property-contact-actions{
  margin-top:auto;
  padding:18px 20px 20px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
  border-top:1px solid rgba(26,26,26,.10);
}
#properties .property-contact-btn{
  min-width:0;
  width:100%;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  padding:14px 16px;
  text-decoration:none;
  text-transform:uppercase;
  letter-spacing:.14em;
  font-size:.522rem;
  font-weight:800;
  border:1px solid #111;
  border-radius:999px;
  box-shadow:none;
  transform:none;
  transition:background .32s cubic-bezier(.16,1,.3,1),color .32s cubic-bezier(.16,1,.3,1),border-color .32s cubic-bezier(.16,1,.3,1),transform .32s cubic-bezier(.16,1,.3,1);
}
#properties .whatsapp-btn{background:#fff;color:#111;border-color:#111}
#properties .call-btn{background:#111;color:#fff;border-color:#111}
/* Clean black / white / champagne hover — no colorful gradients */
#properties .property-contact-btn:hover{
  background:#d8c49a;
  color:#111;
  border-color:#d8c49a;
  transform:translateY(-2px);
  box-shadow:none;
}
#properties .property-contact-btn .ar{transition:transform .32s cubic-bezier(.16,1,.3,1)}
#properties .property-contact-btn:hover .ar{transform:translateX(4px)}
#properties .pcard:hover .property-contact-btn{transform:none}
#properties .pcard:hover .property-contact-btn:hover{transform:translateY(-2px)}
@media(max-width:600px){
  #properties .property-contact-actions{padding:16px;gap:8px}
  #properties .property-contact-btn{padding:13px 8px;font-size:.468rem;letter-spacing:.10em}
}
</style>

<!-- Section boxed layout: body stays full width, each section is individually framed -->
<style id="section-boxed-layout-override">
/* Restore the full-width page */
html{background:#fff;}
body{background:var(--white);}
#nav, main, footer{
  width:100% !important;
  max-width:none !important;
  margin-left:0 !important;
  margin-right:0 !important;
}
#nav{left:0 !important;right:0 !important;transform:none !important;}
main{overflow:visible !important;border-radius:0 !important;}

/* Each section gets its own elegant boxed pane, like Places */
main > section{
  width:min(1680px, calc(100% - 40px)) !important;
  max-width:1680px !important;
  margin:0 auto 24px !important;
  border-radius:32px !important;
  overflow:hidden !important;
}

/* Keep the first hero immersive while still aligned with the new system */
main > section.hero{
  width:100% !important;
  max-width:none !important;
  margin:0 0 24px !important;
  border-radius:0 !important;
}

/* The original .wrap sections already contain their content padding */
main > section.wrap{
  width:min(1680px, calc(100% - 40px)) !important;
  margin-left:auto !important;
  margin-right:auto !important;
}

/* Remove old inset spacing that was added for the previous boxed body version */
section#map,section#storytelling{margin-left:auto !important;margin-right:auto !important;}
.marq{margin-left:auto !important;margin-right:auto !important;}

@media(max-width:768px){
  main > section,
  main > section.wrap{
    width:calc(100% - 20px) !important;
    border-radius:20px !important;
    margin-bottom:14px !important;
  }
  main > section.hero{
    width:100% !important;
    border-radius:0 !important;
    margin-bottom:14px !important;
  }
}
</style>

<style id="compact-sections-and-office-choices">
.hero{min-height:78svh!important}
main > section:not(.hero){min-height:auto!important}
@media(min-width:1024px){#about .about-grid{min-height:0!important}}
@media(max-width:768px){.hero{min-height:72svh!important}}
#office-choices{background:#f7f5f2;padding:22px!important}
.office-choice-grid{display:grid;grid-template-columns:1fr;gap:18px}
.office-choice{position:relative;min-height:340px;border-radius:28px;overflow:hidden;padding:34px;display:flex;flex-direction:column;justify-content:flex-end;isolation:isolate;color:#fff;border:1px solid rgba(255,255,255,.18);transition:transform .65s cubic-bezier(.16,1,.3,1),box-shadow .65s}
.office-choice::before{content:"";position:absolute;inset:0;z-index:-2;transition:transform 1s cubic-bezier(.16,1,.3,1)}
.office-choice::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(to top,rgba(10,10,10,.86),rgba(10,10,10,.18) 70%)}
.office-choice.buy::before{background:radial-gradient(circle at 72% 22%,rgba(229,207,167,.48),transparent 24%),linear-gradient(135deg,#171717 0%,#40372a 48%,#8d7755 100%)}
.office-choice.rent::before{background:radial-gradient(circle at 28% 18%,rgba(229,207,167,.42),transparent 24%),linear-gradient(135deg,#111 0%,#29313a 50%,#59636d 100%)}
.office-choice:hover{transform:translateY(-7px);box-shadow:0 28px 70px -34px rgba(0,0,0,.55)}
.office-choice:hover::before{transform:scale(1.08)}
.office-choice .eyebrow{color:var(--gold);margin-bottom:14px}
.office-choice h2{margin:0;font-size:clamp(2.16rem,3.6vw,4.05rem);line-height:.94;letter-spacing:-.035em;font-weight:400}
.office-choice p{max-width:430px;margin:16px 0 24px;font-size:.81rem;line-height:1.55;color:rgba(255,255,255,.78)}
.office-choice .btn{align-self:flex-start;background:#fff;border-color:#fff;color:#111}
.office-choice .btn:hover{color:#111!important}
@media(min-width:900px){#office-choices{padding:26px!important}.office-choice-grid{grid-template-columns:1fr 1fr;gap:22px}.office-choice{min-height:390px;padding:44px}}
@media(max-width:640px){#office-choices{padding:10px!important}.office-choice{min-height:280px;padding:28px;border-radius:22px}}
</style>

<style id="map-restored-final-css"><!-- disabled, replaced by cheops-map-clean-css --></style>

<style id="dev-logos-sharp">
/* Developers marquee: sharp logos, no fade/blur */
section.sec .marq img{
  opacity:1 !important;
  filter:none !important;
  transform:none !important;
}
section.sec .marq span{
  opacity:1 !important;
  filter:none !important;
}
section.sec .marq .d{
  opacity:1 !important;
  color:inherit !important;
}
</style>
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
<style id="about-restyle">
  #hero{align-items:center}
  #hero>.wrap{padding-bottom:0;text-align:center}
  #hero .about-frame{display:none!important}
  #hero .eyebrow{justify-content:center}
  #hero .hero-lead{margin-left:auto!important;margin-right:auto!important;text-align:center;max-width:620px}
  #hero>.wrap>div[style*="flex-wrap"]{justify-content:center}
  #hero h1,#hero .hero-title-line{text-align:center;justify-content:center}
  #hero>.wrap>div[style*="Scroll"],#hero>.wrap>div:last-child{justify-content:center}
  #hero .hero-side{position:absolute;right:44px;top:50%;transform:translateY(-50%) rotate(180deg);writing-mode:vertical-rl;font-size:.495rem;letter-spacing:.34em;text-transform:uppercase;color:rgba(255,255,255,.5);z-index:2}
  @media(max-width:900px){#hero .hero-side{display:none}}
  .about-hero-meta{margin-top:44px;display:flex;flex-wrap:wrap;justify-content:center;gap:14px}
  .about-hero-meta>div{min-width:190px;padding:22px 26px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(255,255,255,.07);backdrop-filter:blur(14px);display:flex;flex-direction:column;align-items:center;gap:6px}
  .about-hero-meta .n{font-size:1.53rem;line-height:1;color:var(--gold)}
  .about-hero-meta .l{font-size:.495rem;letter-spacing:.24em;text-transform:uppercase;opacity:.7}
  #services .svc-grid{display:grid;gap:20px;margin-top:48px}
  @media(min-width:700px){#services .svc-grid{grid-template-columns:repeat(2,1fr)}}
  @media(min-width:1050px){#services .svc-grid{grid-template-columns:repeat(3,1fr)}}
  #services .svc{border:1px solid var(--line);border-radius:28px;padding:30px;background:#fff;transition:transform .55s cubic-bezier(.16,1,.3,1),border-color .55s,box-shadow .55s}
  #services .svc:hover{transform:translateY(-8px);border-color:var(--gold);box-shadow:0 26px 60px -34px rgba(26,26,26,.45)}
  #services .ic{width:56px;height:56px;border-radius:999px;display:grid;place-items:center;border:1px solid var(--line);background:#faf8f5;transition:background .5s,border-color .5s}
  #services .svc:hover .ic{background:var(--gold);border-color:var(--gold)}
  #services .ic svg{width:24px;height:24px;stroke:#1a1a1a;fill:none;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}
  #services h3{margin:20px 0 0;font-size:1.08rem}
  #services p{margin:11px 0 0;font-size:.774rem;line-height:1.8;color:var(--muted)}
  #hero .about-hero-title{font-size:clamp(3.78rem,6.3vw,7.02rem)!important;line-height:.96!important;white-space:nowrap!important;max-width:none!important}
  #hero .about-hero-title .hero-title-line{display:flex!important;justify-content:center!important}
  @media(max-width:760px){#hero .about-hero-title{font-size:clamp(2.79rem,12.6vw,4.68rem)!important;white-space:normal!important}}
</style>
<section class="hero" id="hero">
<img alt="Luxury residential architecture in New Cairo" id="heroImg" fetchpriority="high" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/f9474888e9cc.jpg' ); ?>"/>
<div class="overlay" style="position:absolute;inset:0"></div>
<div class="about-frame"></div>
<span class="hero-side">Cheops Privé · Private property office</span>
<div class="wrap" style="position:relative;z-index:2;color:#fff;padding-bottom:56px;width:100%">
<p class="eyebrow" style="display:flex;align-items:center;gap:12px;opacity:.75"><span class="rule-gold" style="width:40px;display:inline-block"></span> Who we are</p>
<h1 class="d d-xl hero-title-single about-hero-title" style="margin:18px 0 0">
  <span class="hero-title-line hero-title-line-main">
    <span class="rl about-title-part about-title-first"><span>About</span></span>
    <span class="rl about-title-part about-title-brand"><span>Cheops Privé</span></span>
  </span>
</h1>
<p class="hero-lead">A private-office approach to property discovery in Egypt — curating projects, destinations and residences worth belonging to.</p>
<div style="margin-top:38px;display:flex;flex-wrap:wrap;gap:18px">
<a class="btn btn-light" href="#values">Our collection <span class="ar">→</span></a>
<a class="btn btn-light" href="#contact">Talk to us <span class="ar">→</span></a>
</div>
<div class="about-hero-meta">
<div><span class="n d">2014</span><span class="l">Founded in Cairo</span></div>
<div><span class="n d">06</span><span class="l">Prime destinations</span></div>
<div><span class="n d">1:1</span><span class="l">Private advisory</span></div>
</div>
<div style="margin-top:40px;display:flex;align-items:center;gap:16px;font-size:.522rem;letter-spacing:.26em;text-transform:uppercase;opacity:.6">
      Scroll to explore <span class="scroll-line"></span>
</div>
</div>
</section><style id="hero-title-restyle">
  /* Rebalanced hero headline: grouped words instead of three oversized stacked words */
  #hero .wrap{padding-top:120px;padding-bottom:34px}
  #hero .hero-title-single{
    display:block;
    max-width:980px;
    margin-top:18px!important;
    line-height:73px;
    letter-spacing:-.042em;
  }
  #hero .hero-title-line{display:flex;align-items:baseline;gap:.16em;white-space:nowrap}
  #hero .hero-title-line-main{font-size:54px}
  #hero .hero-title-line-sub{font-size:.738em;margin-top:.02em}
  #hero .hero-title-single .rl{display:inline-block;overflow:hidden}
  #hero .hero-title-single .rl>span{display:inline-block}
  #hero .hero-title-accent{color:var(--gold)}
  #hero .hero-lead{max-width:590px;margin:24px 0 0;font-size:.828rem;line-height:1.75;color:rgba(255,255,255,.76)}
  #hero #search{margin-top:32px!important;max-width:none!important}
  @media(min-width:1100px){
    #hero .hero-title-single{font-size:clamp(4.14rem,5.22vw,6.12rem)}
  }
  @media(min-width:810px) and (max-width:989px){
    #hero .hero-title-single{font-size:clamp(3.6rem,6.3vw,5.22rem)}
  }
  @media(max-width:809px){
    #hero .wrap{padding-top:99px;padding-bottom:28px}
    #hero .hero-title-single{font-size:clamp(3.15rem,9vw,4.95rem);max-width:100%}
    #hero .hero-lead{max-width:480px;margin-top:20px}
    #hero #search{margin-top:28px!important}
  }
  @media(max-width:620px){
    #hero .wrap{padding-top:98px;padding-bottom:24px}
    #hero .hero-title-single{font-size:clamp(2.61rem,11.7vw,3.96rem);line-height:.92}
    #hero .hero-title-line{gap:.12em}
    #hero .hero-title-line-sub{font-size:.81em;margin-top:.08em;white-space:normal}
    #hero .hero-lead{font-size:.72rem;line-height:1.65;margin-top:18px}
    #hero #search{margin-top:24px!important}
  }
</style>
<style id="about-restyle">
  #about{padding-top:34px;padding-bottom:88px}
  #about .about-shell{position:relative;overflow:hidden;border-radius:38px;background:var(--ink);color:#f4f1ec;padding:30px;isolation:isolate}
  #about .about-shell:before{content:"";position:absolute;width:520px;height:520px;border-radius:50%;right:-210px;top:-270px;background:radial-gradient(circle,rgba(229,207,167,.28),transparent 68%);z-index:-1}
  #about .about-top{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-bottom:28px;border-bottom:0px solid rgba(255,255,255,.14)}
  #about .about-kicker{display:flex;align-items:center;gap:12px;color:var(--gold);font-size:.522rem;letter-spacing:.24em;text-transform:uppercase;font-weight:800}
  #about .about-kicker i{display:block;width:38px;height:1px;background:var(--gold)}
  #about .about-index{font-family:"Romie",serif;font-size:.99rem;color:rgba(255,255,255,.45)}
  #about .about-grid{display:grid;gap:42px;padding-top:16px}
  #about .about-intro{align-self:center;max-width:650px}
  #about .about-title{font-size:clamp(2.52rem,3.78vw,5.22rem);max-width:650px;margin:0;line-height:1.02;letter-spacing:-.035em;word-break:normal;overflow-wrap:normal;hyphens:none}
  #about .about-lead{margin:22px 0 0;max-width:540px;font-size:.792rem;line-height:1.9;color:rgba(244,241,236,.58)}
  #about .about-tags{display:flex;flex-wrap:wrap;gap:9px;margin-top:28px}
  #about .about-tags span{padding:10px 14px;border:1px solid rgba(255,255,255,.14);border-radius:999px;font-size:.468rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(244,241,236,.7)}
  #about .about-copy{display:grid;gap:30px;align-content:end}
  #about .about-copy p{margin:0;max-width:520px;font-size:.855rem;line-height:1.9;color:rgba(244,241,236,.68)}
  #about .about-points{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  #about .about-point{border:1px solid rgba(255,255,255,.13);border-radius:20px;padding:20px;background:rgba(255,255,255,.035);transition:transform .45s cubic-bezier(.16,1,.3,1),border-color .45s,background .45s}
  #about .about-point:hover{transform:translateY(-4px);border-color:var(--gold);background:rgba(229,207,167,.08)}
  #about .about-num{font-family:"Romie",serif;font-size:clamp(1.8rem,3.6vw,2.88rem);line-height:1;color:var(--gold)}
  #about .about-label{margin-top:10px;font-size:.495rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(244,241,236,.55);font-weight:800;line-height:1.5}
  #about .about-footer{margin-top:52px;padding-top:22px;border-top:1px solid rgba(255,255,255,.14);display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
  #about .about-footer p{margin:0;font-size:.504rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(244,241,236,.45)}
  #about .about-footer .btn{background:#f4f1ec;color:#111;border-color:#f4f1ec}
  #about .about-footer .btn:hover{background:var(--gold);border-color:var(--gold);color:#111!important;box-shadow:none;transform:translateY(-2px)}
  @media(min-width:900px){#about .about-shell{padding:46px 52px 40px}#about .about-grid{grid-template-columns:minmax(0,1.2fr) minmax(340px,.8fr);align-items:start;min-height:0}}
  @media(max-width:640px){#about .about-shell{border-radius:28px;padding:24px 20px}#about .about-grid{padding-top:38px;gap:32px}#about .about-title{font-size:2.7rem;line-height:1.05}#about .about-tags span{padding:9px 11px;font-size:.432rem}#about .about-points{grid-template-columns:1fr 1fr}#about .about-point{padding:14px 13px}}
</style>
<section class="sec wrap" id="about">
  <div class="about-shell reveal">
    <div class="about-top">
      <div class="about-kicker"><i></i> About Cheops Privé</div>
      <div class="about-index">01 / 04</div>
    </div>
    <div class="about-grid">
      <div class="about-intro">
        <h2 class="about-title d">A more considered way to find your next address.</h2>
        <p class="about-lead">Everything we feature is selected to make the search feel clearer, calmer and more personal not louder.</p>
        <div class="about-tags">
          <span>Curated projects</span>
          <span>Prime destinations</span>
          <span>Private guidance</span>
        </div>
      </div>
      <div class="about-copy">
        <p>Cheops Privé takes a more considered approach to property discovery. We bring together exceptional projects, destinations and individual residences into one curated experience — designed to make finding your next address feel more personal, refined and effortless.</p>
        <div class="about-points">
          <div class="about-point"><div class="about-num" data-count="228" data-suffix="+">0</div><div class="about-label">Projects indexed</div></div>
          <div class="about-point"><div class="about-num" data-count="6130">0</div><div class="about-label">Live properties</div></div>
        </div>
      </div>
    </div>
    <div class="about-footer">
      <p>Private guidance. Curated addresses. One refined journey.</p>
      <a class="btn" href="#properties">Explore the collection <span class="ar">→</span></a>
    </div>
  </div>
</section>

<style id="values-restyle">
  #values .val-grid{display:grid;gap:26px;margin-top:52px}
  @media(min-width:900px){#values .val-grid{grid-template-columns:repeat(3,1fr)}}
  #values .val{border:1px solid var(--line);border-radius:28px;padding:32px;background:#fff;transition:transform .5s cubic-bezier(.16,1,.3,1),border-color .5s}
  #values .val:hover{transform:translateY(-6px);border-color:var(--gold)}
  #values .val .n{font-family:"Romie",serif;font-size:1.98rem;color:var(--gold);line-height:1}
  #values .val h3{margin:16px 0 0;font-size:1.215rem}
  #values .val p{margin:13px 0 0;font-size:.81rem;line-height:1.85;color:var(--muted)}
  #story .story-grid{display:grid;gap:38px;align-items:center}
  @media(min-width:900px){#story .story-grid{grid-template-columns:1fr 1fr;gap:64px}}
  #story .story-media{position:relative;aspect-ratio:4/5;border-radius:32px;overflow:hidden;background:#eee}
  #story .story-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  #story p{font-size:.855rem;line-height:1.9;color:var(--muted);max-width:520px}
</style>
<section class="sec wrap" id="story">
  <div class="story-grid">
    <div class="zoom story-media reveal"><img alt="Cheops Privé curated architecture" loading="lazy" decoding="async" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/f9474888e9cc.jpg' ); ?>"/></div>
    <div>
      <p class="eyebrow gold">Our story</p>
      <h2 class="d d-lg reveal" style="margin-top:14px;font-size:clamp(2.7rem,4.5vw,4.86rem);line-height:1.02"><span class="rl"><span>Built on quiet</span></span><span class="rl"><span>confidence.</span></span></h2>
      <p style="margin-top:24px">The vision for Cheops Privé was born from a desire to blend timeless heritage with modern luxury, inspired by the ingenuity and precision of the Great Pyramid of Giza.</p>
      <p style="margin-top:20px">The brand brings together exclusivity, precision and innovation to create deeply personal real-estate journeys where ancient heritage meets contemporary sophistication.</p>
      <a class="btn btn-ghost" href="#values" style="margin-top:34px">How we work <span class="ar">→</span></a>
    </div>
  </div>
</section>
<section class="sec wrap" id="services">
<p class="eyebrow gold">What we do</p>
<h2 class="d d-lg reveal" style="margin-top:20px"><span class="rl"><span>Six ways we work</span></span><span class="rl"><span>with you.</span></span></h2>
<div class="svc-grid"><div class="svc reveal"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V20h14V9.8"/><path d="M10 20v-6h4v6"/></svg></div><h3 class="d">Residential sales</h3><p>Apartments, villas and penthouses across New Cairo, Mostakbal City and the New Capital.</p></div><div class="svc reveal"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v13H4z"/><path d="M9 20v-6h6v6"/><path d="M8 3v4M16 3v4"/></svg></div><h3 class="d">Leasing & tenants</h3><p>Tenant representation and landlord leasing terms handled end to end.</p></div><div class="svc reveal"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4h9v17"/><path d="M14 9h5v12"/><path d="M8 8h3M8 12h3M8 16h3M17 13h0M17 17h0"/></svg></div><h3 class="d">Offices & floors</h3><p>Full office floors, fitted suites and headquarters buildings in prime business districts.</p></div><div class="svc reveal"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v14H4z"/><path d="M12 10v6M9 13h6"/><path d="M9 6V3h6v3"/></svg></div><h3 class="d">Clinic suites</h3><p>Licensed medical units in serviced medical towers with parking and patient flow in mind.</p></div><div class="svc reveal"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1 11H5z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg></div><h3 class="d">Administrative & retail</h3><p>Street retail, mall units and F&B footprints matched to real catchment numbers.</p></div><div class="svc reveal"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16"/><path d="M7 19v-6M12 19V8M17 19v-9"/><path d="M14 5h5v5"/></svg></div><h3 class="d">Investment advisory</h3><p>Payment plans, yields and exit timing reviewed with you before you commit.</p></div></div>
</section>
<section class="sec" id="values" style="background:#f7f5f2">
  <div class="wrap">
    <p class="eyebrow gold">How we work</p>
    <h2 class="d d-lg reveal" style="margin-top:20px"><span class="rl"><span>Three principles,</span></span><span class="rl"><span>no exceptions.</span></span></h2>
    <div class="val-grid">
      <div class="val reveal"><div class="n">01</div><h3 class="d">Curation before volume</h3><p>Every project is reviewed before it reaches you. If it does not hold up in person, it does not appear here.</p></div>
      <div class="val reveal"><div class="n">02</div><h3 class="d">Private guidance</h3><p>One advisor, start to finish — from the first shortlist to handover, contracts and leasing terms.</p></div>
      <div class="val reveal"><div class="n">03</div><h3 class="d">Clarity on numbers</h3><p>Real starting prices, real availability, real payment plans. No pressure, no invented urgency.</p></div>
    </div>
  </div>
</section>
<?php cheops_render_business_tenants(); ?>
<?php cheops_render_developers_band(); ?>

<section class="sec" id="insights" style="background:#f7f5f2">
<div class="wrap">
<div style="display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px">
<div><p class="eyebrow gold">Insights</p><h2 class="d d-lg reveal" style="margin-top:20px"><span class="rl"><span>Notes from</span></span><span class="rl"><span>the market.</span></span></h2></div>
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
        <p>Cheops Privé is a curated discovery platform for luxury residences, offices, clinics and retail across New Cairo, Mostakbal City, the New Capital and the coast. We focus on clarity and quality — not volume.</p>
      </details>
      <details class="faq-item reveal">
        <summary>Do you charge buyers a commission?</summary>
        <p>No. Our service is free for buyers and end users. We are compensated by partner developers and sellers when a transaction completes through our introduction.</p>
      </details>
      <details class="faq-item reveal">
        <summary>Which areas do you cover?</summary>
        <p>Primarily New Cairo, Shorouk, Mostakbal City and the North Coast — with selected opportunities in other prime destinations on request.</p>
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

<style id="faq-styles">
#faqs .faq-list{display:grid;gap:0}
#faqs .faq-item{
  border-bottom:1px solid var(--line);
  padding:0;
}
#faqs .faq-item summary{
  list-style:none;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:24px;
  padding:16px 0;
  font-family:"Romie",serif;
  font-size:clamp(.9rem,1.215vw,1.062rem);
  letter-spacing:-.01em;
  line-height:1.25;
  user-select:none;
}
#faqs .faq-item summary::-webkit-details-marker{display:none}
#faqs .faq-item summary::after{
  content:"+";
  flex-shrink:0;
  width:28px;
  height:28px;
  display:grid;
  place-items:center;
  border:1px solid var(--line);
  border-radius:50%;
  font-size:.81rem;
  font-family:system-ui,sans-serif;
  color:var(--ink);
  transition:transform .35s cubic-bezier(.16,1,.3,1),background .35s,border-color .35s,color .35s;
}
#faqs .faq-item[open] summary::after{
  content:"–";
  background:var(--ink);
  border-color:var(--ink);
  color:#fff;
}
#faqs .faq-item p{
  margin:0 0 16px;
  max-width:720px;
  font-size:.774rem;
  line-height:1.7;
  opacity:.72;
  padding-right:40px;
}
#faqs .faq-item summary:hover{color:var(--gold2,#c9a86a)}
</style>

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
<style>
@media(min-width:768px){.grid3{grid-template-columns:repeat(2,1fr)}.grid4{grid-template-columns:repeat(2,1fr)}.intro-grid{grid-template-columns:2fr 1fr}}
@media(min-width:1024px){.grid3{grid-template-columns:repeat(3,1fr)}.grid4{grid-template-columns:repeat(4,1fr)}.map-grid{grid-template-columns:1.6fr 1fr}.foot-grid{grid-template-columns:1.2fr 2fr}}
</style>
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

  /* marquee band after intro */
  const about=document.getElementById('about');
  if(about){
    const words=['New Cairo','Shorouk','Mostakbal City','North Coast'];
    const m=document.createElement('div');m.className='marq';
    const row='<div>'+[...words,...words,...words,...words].map(w=>'<span>'+w+' &nbsp;&#9670;</span>').join('')+'</div>';
    m.innerHTML=row;about.after(m);
  }

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

<style id="map-hard-fix-final"><!-- disabled, replaced by cheops-map-clean-css --></style>
<?php wp_footer(); ?>
</body>
</html>
