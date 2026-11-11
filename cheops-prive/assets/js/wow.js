/* Cheops Privé section motion: bigger, scroll-led movement for the sections of every page.
   Styles live in assets/css/wow.css. Off for visitors who ask for reduced motion. */
(function () {
  'use strict';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var doc = document;
  var wide = window.innerWidth >= 1100;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var below = function (el) { return el.getBoundingClientRect().top > window.innerHeight * 0.9; };
  var onView = function (els, cb, margin) {
    if (!('IntersectionObserver' in window)) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); } });
    }, { rootMargin: margin || '0px 0px -10% 0px', threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });
  };
  // Every scroll-led effect registers here and shares one animation frame.
  var ticks = [], queued = false;
  var run = function () { queued = false; ticks.forEach(function (t) { t(); }); };
  var queue = function () { if (!queued) { queued = true; requestAnimationFrame(run); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);

  /* 1. Cards rise through a curtain, one after another along each row. */
  var cards = [].slice.call(doc.querySelectorAll('.pcard, .cheops-insight-card, .svc, .val, .sp-related-card, .cheops-city-link, .office-choice, .contact-quick-card')).filter(below);
  cards.forEach(function (c) {
    var sibs = c.parentNode ? [].slice.call(c.parentNode.children) : [c];
    c.style.transitionDelay = ((sibs.indexOf(c) % 4) * 0.1).toFixed(2) + 's';
    c.classList.add('cm-card');
  });
  onView(cards, function (c) {
    c.classList.add('cm-card-in');
    setTimeout(function () { c.classList.remove('cm-card', 'cm-card-in'); c.style.transitionDelay = ''; }, 1900);
  }, '0px 0px -6% 0px');

  /* 2. Big photos open from a framed window to the full picture while they scroll in. */
  var opens = [].slice.call(doc.querySelectorAll('.story-media img, .image-panel img, .cheops-article-hero-img')).filter(function (img) { return below(img); });
  opens.forEach(function (img) { img.classList.remove('cm-reveal', 'cm-in'); img.classList.add('cm-open'); });
  if (opens.length) ticks.push(function () {
    var vh = window.innerHeight;
    opens.forEach(function (img) {
      var r = img.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = clamp((vh - r.top) / (vh * 0.75), 0, 1), e = 1 - Math.pow(1 - p, 3), k = 1 - e;
      img.style.clipPath = 'inset(' + (k * 16).toFixed(2) + '% ' + (k * 20).toFixed(2) + '% round ' + (k * 34).toFixed(1) + 'px)';
      img.style.scale = (1 + k * 0.18).toFixed(4);
    });
  });

  /* 3. Sections lift into place like cards sliding up the page. */
  var amp = wide ? 1 : 0.5;
  var sections = [].slice.call(doc.querySelectorAll('section.sec, section.section, .cheops-logo-band, .cheops-city-projects, .sp-related, .contact-main')).filter(function (s) {
    return !s.classList.contains('hero') && below(s);
  });
  if (sections.length) ticks.push(function () {
    var vh = window.innerHeight;
    sections.forEach(function (s) {
      var top = s.getBoundingClientRect().top;
      if (top > vh) return;
      var p = clamp((vh - top) / (vh * 0.5), 0, 1);
      if (p >= 1) { if (s.style.scale) { s.style.scale = ''; s.style.translate = ''; } return; }
      var k = Math.pow(1 - p, 3);
      s.style.scale = (1 - k * 0.07 * amp).toFixed(4);
      s.style.translate = '0 ' + (k * 90 * amp).toFixed(1) + 'px';
    });
  });

  queue();
  addEventListener('load', queue);
})();
