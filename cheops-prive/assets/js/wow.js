/* Cheops Privé section motion: bigger, scroll-led movement for the sections of every page.
   Styles live in assets/css/wow.css. Off for visitors who ask for reduced motion. */
(function () {
  'use strict';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var doc = document, body = doc.body, html = doc.documentElement;
  var rtl = html.getAttribute('dir') === 'rtl';
  var wide = window.innerWidth >= 1100;
  var finePointer = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
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

  /* 1. Home services become full-screen panels that slide over one another. */
  var choices = wide && body.classList.contains('home') && doc.getElementById('office-choices');
  var stackCards = choices ? [].slice.call(choices.querySelectorAll('.office-choice')) : [];
  if (stackCards.length > 1) {
    choices.classList.add('cm-stack');
    stackCards.forEach(function (c) { c.style.rotate = ''; });
    ticks.push(function () {
      var vh = window.innerHeight;
      stackCards.forEach(function (c, i) {
        var next = stackCards[i + 1], q = next ? clamp(1 - next.getBoundingClientRect().top / vh, 0, 1) : 0;
        var r = c.getBoundingClientRect(), z = clamp(1 - (r.top + r.height) / (vh + r.height), 0, 1);
        c.style.scale = (1 - q * 0.08).toFixed(4);
        c.style.setProperty('--cm-dim', (q * 0.55).toFixed(3));
        c.style.setProperty('--cm-zoom', (1.14 - z * 0.14).toFixed(4));
      });
    });
  }

  /* 2. Home destinations: a large list; the city photo follows the pointer. */
  var projects = wide && finePointer && body.classList.contains('home') && doc.getElementById('projects');
  var cityLinks = projects ? [].slice.call(projects.querySelectorAll('.cheops-city-link')) : [];
  if (cityLinks.length > 1) {
    var list = doc.createElement('nav'), float = doc.createElement('div'), pics = [];
    list.className = 'cm-dest';
    list.setAttribute('aria-label', projects.querySelector('.cheops-city-links').getAttribute('aria-label') || '');
    float.className = 'cm-float';
    float.setAttribute('aria-hidden', 'true');
    cityLinks.forEach(function (link, i) {
      var a = doc.createElement('a'), name = link.querySelector('strong'), meta = link.querySelector('small'), bg = link.querySelector('.cheops-city-tab-bg');
      a.href = link.href;
      a.innerHTML = '<strong></strong><small></small>';
      a.firstChild.textContent = name ? name.textContent : '';
      a.lastChild.textContent = meta ? meta.textContent : '';
      a.dataset.i = i;
      list.appendChild(a);
      var pic = doc.createElement('i');
      if (bg) pic.style.backgroundImage = bg.style.backgroundImage;
      float.appendChild(pic);
      pics.push(pic);
    });
    var label = doc.createElement('b'), more = cityLinks[0].querySelector('em');
    label.textContent = more ? more.textContent.replace(/[→←]/g, '').trim() : '';
    float.appendChild(label);
    projects.querySelector('.cheops-city-links').after(list);
    body.appendChild(float);
    projects.classList.add('cm-list');

    var x = 0, y = 0, tx = 0, ty = 0, current = -1, follow = false;
    list.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; if (!follow) { x = tx; y = ty; follow = true; step(); } });
    list.addEventListener('pointerleave', function () { float.classList.remove('cm-on'); follow = false; });
    list.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('pointerenter', function () {
        var i = +a.dataset.i;
        float.classList.add('cm-on');
        if (i === current) return;
        pics.forEach(function (p, j) { p.style.zIndex = j === i ? 2 : 1; });
        var p = pics[i];
        p.classList.remove('cm-on');
        void p.offsetWidth;
        p.classList.add('cm-on');
        var keep = i;
        setTimeout(function () { pics.forEach(function (q, j) { if (j !== keep && current === keep) q.classList.remove('cm-on'); }); }, 900);
        current = i;
      });
    });
    var step = function () {
      if (!follow) return;
      var nx = x + (tx - x) * 0.12, vx = nx - x;
      x = nx; y += (ty - y) * 0.12;
      float.style.transform = 'translate(' + (x - 165).toFixed(1) + 'px,' + (y - 210).toFixed(1) + 'px) rotate(' + clamp(vx * 0.6, -12, 12).toFixed(2) + 'deg)';
      requestAnimationFrame(step);
    };
  }

  /* 3. Cards rise through a curtain, one after another along each row. */
  var cards = [].slice.call(doc.querySelectorAll('.pcard, .cheops-insight-card, .svc, .val, .sp-related-card, .cheops-city-link, .office-choice, .contact-quick-card')).filter(function (c) {
    return below(c) && !c.closest('.cm-hscroll, .cm-stack, .cm-list');
  });
  cards.forEach(function (c) {
    var sibs = c.parentNode ? [].slice.call(c.parentNode.children) : [c];
    c.style.transitionDelay = ((sibs.indexOf(c) % 4) * 0.1).toFixed(2) + 's';
    c.classList.add('cm-card');
  });
  onView(cards, function (c) {
    c.classList.add('cm-card-in');
    setTimeout(function () { c.classList.remove('cm-card', 'cm-card-in'); c.style.transitionDelay = ''; }, 1900);
  }, '0px 0px -6% 0px');

  /* 4. Big photos open from a framed window to the full picture while they scroll in. */
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

  /* 5. Sections lift into place like cards sliding up the page. */
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
