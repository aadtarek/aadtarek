<?php if ( ! defined( 'ABSPATH' ) ) exit; ?>
<!DOCTYPE html>

<html lang="en"><head><meta charset="utf-8"/><meta content="width=device-width,initial-scale=1" name="viewport"/><title><?php echo esc_html(cheops_service_page('for-rent')['title']); ?></title>
<link data-cheops-hero-preload rel="preload" as="image" fetchpriority="high" href="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/ed8441727632.jpg' ); ?>">

<meta content="<?php echo esc_attr(cheops_service_page('for-rent')['description']); ?>" name="description"/><link href="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>" rel="icon"/><!-- CHEOPS PRIVÉ / SERVICE-PAGE MOTION SYSTEM -->
<script>document.documentElement.classList.add('motion-ready');</script>
<?php cheops_page_css('services'); ?>
<?php wp_head(); ?>
</head><body <?php body_class(); ?>><?php cheops_site_header(); ?>
<?php wp_body_open(); ?>
<!-- CHEOPS VIDEO PRELOADER: added without changing existing page content -->
<div aria-label="Loading" id="cheops-video-preloader">
<video id="cheops-preloader-video" muted="" playsinline="" preload="none">
<source src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/72bcbd3c625e.mp4' ); ?>" type="video/mp4"/>
</video>
</div>
<div id="pre"><div style="text-align:center"><img alt="Cheops Privé" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>" style="height:44px;margin:0 auto;filter:brightness(0) invert(1)"/><div class="cnt" id="preCount">00</div><div class="bar"><i id="preBar"></i></div><p class="eyebrow" style="margin-top:22px;opacity:.5">Define your next address</p></div></div><div class="cursor" id="cursor"><b></b></div><header class="nav" id="nav"><div class="wrap nav-inner"><a aria-label="Cheops Privé home" href="<?php echo esc_url( home_url('/') ); ?>"><img alt="Cheops Privé" class="logo" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>"/></a><nav class="nav-center"><div class="service-nav" id="serviceNav"><button class="service-trigger" type="button">Services <span class="chev"></span></button><div class="dropdown"><a href="<?php echo esc_url( home_url('/#services') ); ?>"><span class="nav-ico">◎</span><span>All Services</span></a><a aria-current="page" href="<?php echo esc_url( home_url('/leasing/') ); ?>"><span class="nav-ico"><svg viewbox="0 0 24 24"><path d="M8.5 12.5 11 15a2 2 0 0 0 3 0l4.5-4.5"></path><path d="m3 8 3-3 4 2 2-1.5a3 3 0 0 1 3.7.3L21 10"></path><path d="m3 8 5 7 2-1"></path><path d="m21 10-4 6-2-1"></path></svg></span><span>Leasing</span></a><a href="<?php echo esc_url( home_url('/primary-property/') ); ?>"><span class="nav-ico"><svg viewbox="0 0 24 24"><path d="M4 21V7l8-4 8 4v14"></path><path d="M8 10h2m4 0h2M8 14h2m4 0h2M10 21v-4h4v4"></path></svg></span><span>Primary Property</span></a><a href="<?php echo esc_url( home_url('/properties/') ); ?>"><span class="nav-ico"><svg viewbox="0 0 24 24"><path d="M7 7h11l-3-3"></path><path d="m18 7-3 3"></path><path d="M17 17H6l3 3"></path><path d="m6 17 3-3"></path><path d="M4 12a8 8 0 0 1 2-5M20 12a8 8 0 0 1-2 5"></path></svg></span><span>Property Resale</span></a><a href="<?php echo esc_url( home_url('/investment-consultation/') ); ?>"><span class="nav-ico"><svg viewbox="0 0 24 24"><path d="M4 19 9 13l4 3 7-9"></path><path d="M15 7h5v5"></path></svg></span><span>Investment Consultation</span></a><a href="<?php echo esc_url( home_url('/income-generating-property/') ); ?>"><span class="nav-ico"><svg viewbox="0 0 24 24"><circle cx="8" cy="9" r="4"></circle><path d="M8 7v4m-1.5-3H9a1 1 0 0 1 0 2H7"></path><path d="M13 17c2-3 4-4 7-4v6c-3 0-5-1-7-2Z"></path><path d="M4 19c2-2 5-3 9-2"></path></svg></span><span>Income Generating Property</span></a></div></div><a class="nav-link" href="<?php echo esc_url( home_url('/properties/') ); ?>">Properties</a><a class="nav-link" href="<?php echo esc_url( home_url('/about/') ); ?>">About</a></nav><div class="nav-actions"><a class="nav-cta" href="<?php echo esc_url( home_url('/#contact') ); ?>">Contact</a><button aria-label="Open menu" class="burger" id="burger"><span></span><span></span></button></div></div></header>
<div class="mobile-menu" id="mobileMenu"><div class="mobile-top"><img alt="Cheops Privé" class="foot-logo" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>"/><button class="burger" id="closeMenu" style="display:block;color:#fff"><span></span><span></span></button></div><nav><a href="<?php echo esc_url( home_url('/') ); ?>">Home</a><div class="m-service-title">Services</div><div class="m-sub"><a href="<?php echo esc_url( home_url('/#services') ); ?>">All Services</a><a aria-current="page" href="<?php echo esc_url( home_url('/leasing/') ); ?>">Leasing</a><a href="<?php echo esc_url( home_url('/primary-property/') ); ?>">Primary Property</a><a href="<?php echo esc_url( home_url('/properties/') ); ?>">Property Resale</a><a href="<?php echo esc_url( home_url('/investment-consultation/') ); ?>">Investment Consultation</a><a href="<?php echo esc_url( home_url('/income-generating-property/') ); ?>">Income Generating Property</a></div><a href="<?php echo esc_url( home_url('/properties/') ); ?>">Properties</a><a href="<?php echo esc_url( home_url('/about/') ); ?>">About</a><a href="<?php echo esc_url( home_url('/#contact') ); ?>">Contact</a></nav></div><main><?php cheops_render_service_page('for-rent', get_template_directory_uri() . '/assets/generated/ed8441727632.jpg'); ?><div class="marq"><div><span>For Rent  ◆</span><span>For Sale  ◆</span><span>Property Resale  ◆</span><span>Private Consultation  ◆</span><span>Income Property  ◆</span><span>For Rent  ◆</span><span>For Sale  ◆</span><span>Property Resale  ◆</span><span>Private Consultation  ◆</span><span>Income Property  ◆</span><span>For Rent  ◆</span><span>For Sale  ◆</span><span>Property Resale  ◆</span><span>Private Consultation  ◆</span><span>Income Property  ◆</span><span>For Rent  ◆</span><span>For Sale  ◆</span><span>Property Resale  ◆</span><span>Private Consultation  ◆</span><span>Income Property  ◆</span></div></div>
<?php cheops_render_service_handle('for-rent', get_template_directory_uri() . '/assets/images/office-rent.jpg'); ?>
</main><footer><div class="wrap"><div class="foot"><div><img alt="Cheops Privé" class="foot-logo" src="<?php echo esc_url( get_template_directory_uri() . '/assets/generated/c9193073bb12.png' ); ?>"/><p>A private approach to property discovery, leasing, ownership and investment across Egypt's prime addresses.</p><p><a href="<?php echo esc_url( cheops_phone_url() ); ?>"><?php echo esc_html( cheops_phone_display() ); ?></a><br/><a href="mailto:<?php echo esc_attr( antispambot( cheops_email() ) ); ?>"><?php echo esc_html( cheops_email() ); ?></a><br/><?php echo esc_html( cheops_address() ); ?></p></div><div class="foot-links"><div class="foot-col"><h4>Services</h4><a aria-current="page" href="<?php echo esc_url( home_url('/leasing/') ); ?>">Leasing</a><a href="<?php echo esc_url( home_url('/primary-property/') ); ?>">Primary Property</a><a href="<?php echo esc_url( home_url('/properties/') ); ?>">Property Resale</a><a href="<?php echo esc_url( home_url('/investment-consultation/') ); ?>">Investment Consultation</a><a href="<?php echo esc_url( home_url('/income-generating-property/') ); ?>">Income Generating Property</a></div><div class="foot-col"><h4>Explore</h4><a href="<?php echo esc_url( home_url('/properties/') ); ?>">Properties</a><a href="<?php echo esc_url( home_url('/about/') ); ?>">About</a><a href="<?php echo esc_url( home_url('/#contact') ); ?>">Contact</a></div><div class="foot-col"><h4>Direct</h4><a href="<?php echo esc_url( cheops_whatsapp_url() ); ?>">WhatsApp</a><a href="<?php echo esc_url( cheops_phone_url() ); ?>">Call</a><a href="mailto:<?php echo esc_attr( antispambot( cheops_email() ) ); ?>">Email</a></div></div></div><div class="copyright">© 2026 Cheops Privé. All rights reserved.</div></div></footer>
<?php cheops_print_motion_scripts(); ?>
<script id="home-about-parity-js">
(function(){
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const nav=document.getElementById('nav');
const menu=document.getElementById('mobileMenu');
const burger=document.getElementById('burger');
const closeBtn=document.getElementById('closeMenu');
const serviceNav=document.getElementById('serviceNav');
const serviceTrigger=serviceNav?serviceNav.querySelector('.service-trigger'):null;

/* exact header state */
addEventListener('scroll',()=>{if(nav)nav.classList.toggle('scrolled',scrollY>60);},{passive:true});

/* services dropdown */
if(serviceTrigger&&serviceNav){
  serviceTrigger.addEventListener('click',e=>{e.stopPropagation();serviceNav.classList.toggle('open');});
  document.addEventListener('click',e=>{if(!serviceNav.contains(e.target))serviceNav.classList.remove('open');});
}

/* mobile menu with Home stagger */
function closeMenu(){if(menu)menu.classList.remove('open');if(burger)burger.setAttribute('aria-expanded','false');}
if(burger)burger.onclick=()=>{if(!menu)return;menu.classList.add('open');burger.setAttribute('aria-expanded','true');menu.querySelectorAll('a').forEach((a,i)=>{a.style.animationDelay=(i*.06)+'s';a.style.animationName='none';requestAnimationFrame(()=>a.style.animationName='mi');});};
if(closeBtn)closeBtn.onclick=closeMenu;

/* scroll progress */
const prog=document.createElement('div');prog.id='prog';document.body.appendChild(prog);
addEventListener('scroll',()=>{const h=document.documentElement,den=h.scrollHeight-h.clientHeight;prog.style.width=(den>0?h.scrollTop/den*100:0)+'%';},{passive:true});

/* hero pointer parallax */
const hero=document.getElementById('hero');
const heroImg=document.getElementById('heroImg');
if(hero&&heroImg){hero.addEventListener('pointermove',e=>{if(reduce||innerWidth<1024)return;const r=hero.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)/r.width,y=(e.clientY-r.top-r.height/2)/r.height;heroImg.style.transform=`translate3d(${x*-14}px,${y*-10}px,0) scale(1.06)`;});hero.addEventListener('pointerleave',()=>{if(!reduce)heroImg.style.transform='scale(1.04)';});}

/* custom Home cursor */
const cur=document.getElementById('cursor'),curT=cur?cur.querySelector('b'):null;
if(cur&&!reduce&&matchMedia('(min-width:1024px)').matches){
 addEventListener('pointermove',e=>{cur.style.opacity=1;cur.style.transform=`translate(${e.clientX-cur.offsetWidth/2}px,${e.clientY-cur.offsetHeight/2}px)`;},{passive:true});
 document.addEventListener('pointerover',e=>{const t=e.target.closest('[data-cursor]');if(t){cur.classList.add('big');curT.textContent=t.dataset.cursor||'Explore';}else{cur.classList.remove('big');curT.textContent='';}});
}

/* preloader then exact reveal start */
function start(){
  if(hero){hero.querySelectorAll('.rl>span').forEach((s,i)=>s.style.transitionDelay=(i*.11)+'s');hero.classList.add('on');}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal,h2.d,.rl').forEach(n=>io.observe(n));

  if(reduce)return;
  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    let lenis=null;
    if(window.Lenis){
      lenis=new Lenis({duration:1.25,smoothWheel:true});
      lenis.on('scroll',()=>ScrollTrigger.update());
      gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(!t)return;e.preventDefault();closeMenu();lenis.scrollTo(t,{offset:-10});}));
    }
    if(hero&&heroImg)gsap.to(heroImg,{yPercent:12,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});

    /* same Home char reveal */
    document.querySelectorAll('h2.d,h3.d,.pillar h3,.service-card h3,.step h3').forEach(h=>{
      if(h.dataset.split)return;h.dataset.split='1';
      const walk=node=>{[...node.childNodes].forEach(n=>{if(n.nodeType===3){const frag=document.createDocumentFragment();const parts=n.textContent.split(/(\s+)/);parts.forEach(part=>{if(!part)return;if(/\s+/.test(part)){frag.appendChild(document.createTextNode(' '));return;}const word=document.createElement('span');word.className='word';[...part].forEach(c=>{const s=document.createElement('span');s.className='ch';s.textContent=c;word.appendChild(s)});frag.appendChild(word)});n.replaceWith(frag)}else if(n.nodeType===1&&!n.classList.contains('eyebrow'))walk(n)});};
      walk(h);const chars=h.querySelectorAll('.ch');if(!chars.length)return;
      gsap.from(chars,{yPercent:120,opacity:0,rotate:6,duration:.9,ease:'expo.out',stagger:.014,scrollTrigger:{trigger:h,start:'top 88%'}});
    });

    /* image masks + body parallax */
    document.querySelectorAll('main img:not(#heroImg)').forEach(img=>{
      gsap.fromTo(img,{clipPath:'inset(14% 14% 14% 14% round 22px)',scale:1.14},{clipPath:'inset(0% 0% 0% 0% round 22px)',scale:1,duration:1.5,ease:'expo.out',scrollTrigger:{trigger:img,start:'top 92%'}});
      gsap.to(img,{yPercent:-8,ease:'none',scrollTrigger:{trigger:img,start:'top bottom',end:'bottom top',scrub:true}});
    });

    /* card entrances + Home 3D physicality */
    const cards=document.querySelectorAll('.service-card,.pillar,.handle,.step,.next-card');
    const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);gsap.fromTo(e.target,{y:70,autoAlpha:0,scale:.96},{y:0,autoAlpha:1,scale:1,duration:1,ease:'expo.out',clearProps:'opacity,visibility'});}),{threshold:.08});
    cards.forEach(c=>cio.observe(c));
    document.querySelectorAll('.service-card,.pillar,.handle,.next-card').forEach(c=>{
      c.addEventListener('pointermove',e=>{if(innerWidth<1024)return;const r=c.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;gsap.to(c,{rotateY:x*7,rotateX:-y*6,y:-8,duration:.5,ease:'power2.out',transformPerspective:900});});
      c.addEventListener('pointerleave',()=>gsap.to(c,{rotateY:0,rotateX:0,y:0,duration:.7,ease:'expo.out'}));
    });

    /* magnetic exact buttons */
    document.querySelectorAll('.btn,.nav-cta').forEach(b=>{b.addEventListener('pointermove',e=>{if(innerWidth<1024)return;const r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-(r.left+r.width/2))*.18,y:(e.clientY-(r.top+r.height/2))*.25,duration:.4});});b.addEventListener('pointerleave',()=>gsap.to(b,{x:0,y:0,duration:.6,ease:'elastic.out(1,.4)'}));});

    /* section pane rises */
    document.querySelectorAll('main>section:not(.hero)').forEach(s=>gsap.fromTo(s,{scale:.985,opacity:.72},{scale:1,opacity:1,duration:1,ease:'expo.out',scrollTrigger:{trigger:s,start:'top 92%'}}));
    document.querySelectorAll('.rule-gold').forEach(r=>gsap.from(r,{scaleX:0,transformOrigin:'left center',duration:1.1,ease:'expo.out',scrollTrigger:{trigger:r,start:'top 95%'}}));
    ScrollTrigger.refresh();
  }
}

start();
})();
</script>
<!-- Intro video preloader intentionally disabled on inner pages -->
<?php wp_footer(); ?>
</body></html>