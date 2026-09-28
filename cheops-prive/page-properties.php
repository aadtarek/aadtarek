<?php if ( ! defined( 'ABSPATH' ) ) exit; ?>
<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<title>Properties — Cheops Privé | Curated Property in Egypt</title>
<link data-cheops-font-preload rel="preload" href="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/79d5dddb2cad.otf' ); ?>" as="font" type="font/otf" crossorigin>

<meta content="Explore a curated collection of residences, offices, clinics and retail opportunities across Egypt’s prime addresses." name="description"/>
<meta content="Cheops Privé — Define Your Next Address" property="og:title"/>
<meta content="Browse curated properties across New Cairo, Mostakbal City, the New Capital, the coast and selected prime destinations." property="og:description"/>
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
@media(min-width:768px){.fields{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1100px){.fields{grid-template-columns:repeat(6,minmax(0,1fr))}}
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
@media(min-width:1024px){#about .about-grid{min-height:390px!important}}
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

<style id="properties-page-styles">
  .nav-links a.active{color:var(--gold)}
  .nav-links a.active:after{width:100%}
  .properties-hero{min-height:72svh!important;align-items:flex-end!important}
  .properties-hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.035)}
  .properties-hero .overlay{background:linear-gradient(90deg,rgba(8,8,8,.82) 0%,rgba(8,8,8,.5) 48%,rgba(8,8,8,.25) 100%),linear-gradient(to top,rgba(8,8,8,.7),transparent 55%)}
  .properties-hero .hero-copy{position:relative;z-index:2;color:#fff;padding-top:170px;padding-bottom:74px;width:100%}
  .properties-hero h1{font-size:clamp(3.06rem,6.3vw,6.66rem);line-height:.94;letter-spacing:-.045em;max-width:1050px;margin:20px 0 0;font-weight:400}
  .properties-hero h1 em{font-style:normal;color:var(--gold)}
  .properties-hero h1 .rl + .rl{margin-top:-.06em}
  .properties-hero .lead{max-width:600px;margin:28px 0 0;font-size:.855rem;line-height:1.8;color:rgba(255,255,255,.7)}
  .properties-hero .hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}
  .properties-hero .hero-meta span{border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);backdrop-filter:blur(8px);border-radius:999px;padding:10px 14px;font-size:.468rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.75)}
  #property-search{background:#f7f5f2;padding-top:38px!important;padding-bottom:38px!important}
  #property-search .search{box-shadow:0 28px 70px -55px rgba(0,0,0,.5)}
  .collection-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}
  .collection-count{font-size:.612rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
  .quick-grid{display:grid;grid-template-columns:1fr;gap:14px;margin-top:32px}
  .quick-card{appearance:none;text-align:left;border:1px solid var(--line);background:rgba(255,255,255,.82);padding:28px;border-radius:24px;cursor:pointer;transition:transform .45s cubic-bezier(.16,1,.3,1),border-color .45s,background .45s,box-shadow .45s;min-height:190px;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;color:var(--ink);font:inherit;overflow:hidden}
  .quick-card:hover{transform:translateY(-5px);border-color:rgba(138,107,47,.42);background:#fff;box-shadow:0 24px 55px -42px rgba(0,0,0,.38)}
  .quick-card .qicon{width:50px;height:50px;border:1px solid rgba(181,141,82,.35);border-radius:16px;display:grid;place-items:center;color:#a77d3e;background:#faf7f1;margin-bottom:28px;transition:background .4s,border-color .4s,transform .4s}
  .quick-card:hover .qicon{background:#e5cfa7;border-color:#e5cfa7;transform:translateY(-2px)}
  .quick-card .qicon svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round}
  .quick-card .qtitle{display:block;font-family:"Romie",serif;font-size:1.44rem;line-height:1.08;margin:0;white-space:normal}
  .quick-card .qmeta{display:block;margin-top:10px;font-size:.522rem;line-height:1.45;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}
  #properties{background:#fff!important;padding-top:72px!important;padding-bottom:78px!important}
  #properties .pcard{border-radius:26px;box-shadow:0 24px 70px -60px rgba(0,0,0,.48)}
  #properties .pcard .zoom{border-radius:0!important}
  #properties .pcard .zoom img{border-radius:0!important}
  #properties .save-property{border-radius:50%!important;transition:transform .3s,background .3s,color .3s}
  #properties .save-property[aria-pressed="true"]{background:#1a1a1a!important;color:#fff;transform:scale(1.06)}
  #properties .empty-state{display:none;grid-column:1/-1;padding:70px 24px;text-align:center;border:1px solid var(--line);border-radius:28px;background:#f7f5f2}
  #properties .empty-state.show{display:block}
  @media(min-width:720px){.quick-grid{grid-template-columns:repeat(2,1fr)}}
  @media(min-width:1050px){.quick-grid{grid-template-columns:repeat(4,1fr)}}
  @media(max-width:640px){.properties-hero .hero-copy{padding-top:130px;padding-bottom:46px}.properties-hero{min-height:68svh!important}.properties-hero h1{font-size:clamp(2.7rem,12.6vw,4.14rem)}#properties{padding-top:45px!important}}

  .cheops-pagination{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:34px;flex-wrap:wrap}
  .cheops-pagination button{width:42px;height:42px;border-radius:50%!important;border:1px solid var(--line)!important;background:#fff!important;color:#171717!important;font:700 11px/1 Arial,sans-serif!important;cursor:pointer;transition:.25s}
  .cheops-pagination button:hover,.cheops-pagination button.is-active{background:#171717!important;color:#fff!important;border-color:#171717!important;transform:translateY(-2px)}
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
    <p class="eyebrow" style="display:flex;align-items:center;gap:12px;opacity:.78"><span class="rule-gold" style="width:40px;display:inline-block"></span> Properties · Private collection</p>
    <h1 class="d"><span class="rl"><span>Find the address</span></span><span class="rl"><span>worth <em>choosing.</em></span></span></h1>
    <p class="lead">A considered collection of homes, workspaces and administrative opportunities across Egypt's most sought-after destinations — selected for quality, location and long-term value.</p>
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
