/* Cheops Privé motion layer. Vanilla JS, loaded deferred on every page.
   Nothing here runs for visitors who ask for reduced motion. */
(function () {
  'use strict';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var doc = document, body = doc.body, html = doc.documentElement;
  var rtl = html.getAttribute('dir') === 'rtl';
  var finePointer = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var wide = function () { return window.innerWidth >= 1100; };
  var onView = function (els, cb, margin) {
    if (!('IntersectionObserver' in window)) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); } });
    }, { rootMargin: margin || '0px 0px -12% 0px', threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });
  };
  var below = function (el) { return el.getBoundingClientRect().top > window.innerHeight * 0.95; };

  /* Curtain reveal for images below the first screen (pages with their own image motion keep it). */
  if (!body.classList.contains('tax-project_city') && !body.classList.contains('single-cheops_unit')) {
    var imgs = [].slice.call(doc.querySelectorAll('.zoom img, .image-panel img, .story-media img, .office-choice img, .cheops-insight-card img, .cheops-city-card img, .cheops-project-media img'))
      .filter(function (img) { return !img.closest('.hero') && below(img) && !img.dataset.cheopsMotion; });
    imgs.forEach(function (img) { img.classList.add('cm-reveal'); });
    onView(imgs, function (img) { img.classList.add('cm-in'); }, '0px 0px -8% 0px');
  }

  /* Lazy images: soft until loaded, then sharpen. */
  doc.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
    if (img.complete && img.naturalWidth) return;
    img.classList.add('cm-sharp', 'cm-blur');
    var done = function () { img.classList.remove('cm-blur'); };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });

  /* Gold labels shimmer (only plain ones, not those sitting on a coloured pill). */
  doc.querySelectorAll('.eyebrow.gold').forEach(function (el) {
    var bg = getComputedStyle(el).backgroundColor;
    if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') el.classList.add('cm-shine');
  });

  /* Numbers count up when they appear: project figures and city counts. */
  var counters = [].slice.call(doc.querySelectorAll('.cheops-project-copy dd, .cheops-city-hero-meta span, [data-cm-count]'));
  counters = counters.filter(function (el) { return el.children.length === 0 && /\d/.test(el.textContent); });
  onView(counters, function (el) {
    var text = el.textContent, m = text.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var target = parseFloat(m[2].replace(/,/g, '')), decimals = (m[2].split('.')[1] || '').length, commas = m[2].indexOf(',') > -1;
    if (!isFinite(target) || target === 0) return;
    var start = performance.now(), dur = 1300;
    var fmt = function (v) {
      var s = v.toFixed(decimals);
      if (commas) { var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = p.join('.'); }
      return m[1] + s + m[3];
    };
    (function tick(now) {
      var t = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(target * e);
      if (t < 1) requestAnimationFrame(tick); else el.textContent = text;
    })(start);
  });

  /* Header steps aside while reading down, comes back on the way up. */
  var header = doc.getElementById('cheopsSiteHeader');
  if (header) {
    var lastY = window.scrollY, ticking = false;
    var update = function () {
      ticking = false;
      var y = window.scrollY, menuOpen = html.style.overflow === 'hidden' || header.matches(':hover') || header.contains(doc.activeElement);
      if (y < 160 || menuOpen) header.classList.remove('cm-away');
      else if (y > lastY + 6) header.classList.add('cm-away');
      else if (y < lastY - 6) header.classList.remove('cm-away');
      lastY = y;
    };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  }

  /* Buttons lean slightly towards the pointer (mouse and trackpad only). */
  if (finePointer) {
    doc.querySelectorAll('.btn, .cheops-header-cta, .property-contact-btn, .cheops-footer-cta, .hero-actions a').forEach(function (b) {
      b.classList.add('cm-magnet');
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.translate = (x * 10).toFixed(1) + 'px ' + (y * 8).toFixed(1) + 'px';
      });
      b.addEventListener('pointerleave', function () { b.style.translate = ''; });
    });
  }

  /* Map pins drop in the first time only; later selections swap icons without replaying it. */
  var map = doc.querySelector('.cheops-project-map');
  if (map) onView([map], function () { setTimeout(function () { map.classList.add('cm-map-done'); }, 4000); }, '300px 0px 0px 0px');

  /* Home: selected properties glide sideways while scrolling (wide screens). */
  var grid = body.classList.contains('home') && doc.getElementById('propGrid');
  var canClip = window.CSS && CSS.supports && CSS.supports('overflow', 'clip');
  if (grid && wide() && canClip && grid.children.length > 3) {
    // A clipping (not scrolling) section lets the pinned row stick.
    var holder = grid.closest('section');
    if (holder && getComputedStyle(holder).overflow !== 'visible') holder.style.setProperty('overflow', 'clip', 'important');
    var wrap = doc.createElement('div'), sticky = doc.createElement('div');
    wrap.className = 'cm-hscroll';
    sticky.className = 'cm-hscroll-sticky';
    grid.parentNode.insertBefore(wrap, grid);
    wrap.appendChild(sticky);
    sticky.appendChild(grid);
    var distance = 0;
    var measure = function () {
      distance = Math.max(0, grid.scrollWidth - sticky.clientWidth);
      wrap.style.height = (window.innerHeight + distance) + 'px';
      move();
    };
    var move = function () {
      var r = wrap.getBoundingClientRect(), span = wrap.offsetHeight - window.innerHeight;
      var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      grid.style.transform = 'translate3d(' + ((rtl ? 1 : -1) * p * distance).toFixed(1) + 'px,0,0)';
    };
    var raf = false;
    addEventListener('scroll', function () { if (!raf) { raf = true; requestAnimationFrame(function () { raf = false; move(); }); } }, { passive: true });
    addEventListener('resize', measure);
    addEventListener('load', measure);
    measure();
  }

  /* Gold reading bar at the top of every page. */
  var bar = doc.createElement('div');
  bar.className = 'cm-progress';
  body.appendChild(bar);
  var setBar = function () {
    var max = html.scrollHeight - window.innerHeight;
    bar.style.scale = (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ' 1';
  };

  /* Big words band: drifts on its own, speeds up with the scroll and follows its direction. */
  var bands = [].slice.call(doc.querySelectorAll('.cm-marquee .cm-mq-track'));
  var mqPos = 0, mqDir = -1, velocity = 0, prevY = window.scrollY;
  var loop = function () {
    var y = window.scrollY, dy = y - prevY;
    prevY = y;
    velocity += (Math.abs(dy) - velocity) * 0.12;
    if (dy) mqDir = (dy > 0 ? -1 : 1) * (rtl ? -1 : 1);
    if (bands.length) {
      mqPos += mqDir * (0.6 + Math.min(velocity, 60) * 0.35);
      bands.forEach(function (t) {
        var half = t.scrollWidth / 2;
        if (!half) return;
        if (mqPos <= -half) mqPos += half;
        if (mqPos > 0) mqPos -= half;
        t.style.transform = 'translate3d(' + mqPos.toFixed(1) + 'px,0,0)';
      });
    }
    setBar();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  /* Words light up one by one as the paragraph scrolls through the screen. */
  var scrubs = [].slice.call(doc.querySelectorAll('#about .about-lead, #about p, #story p, .contact-lead')).filter(function (p) {
    return p.children.length === 0 && p.textContent.trim().split(/\s+/).length > 10 && !p.closest('.cm-scrub');
  });
  scrubs.forEach(function (p) {
    p.classList.add('cm-scrub');
    var words = p.textContent.trim().split(/(\s+)/);
    p.textContent = '';
    words.forEach(function (w) {
      if (/^\s+$/.test(w)) { p.appendChild(doc.createTextNode(' ')); return; }
      var sp = doc.createElement('span');
      sp.className = 'cm-w';
      sp.textContent = w;
      p.appendChild(sp);
    });
  });
  var scrubTick = function () {
    scrubs.forEach(function (p) {
      var r = p.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var prog = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      var ws = p.querySelectorAll('.cm-w'), lit = Math.round(prog * ws.length);
      ws.forEach(function (w, i) { w.classList.toggle('cm-lit', i < lit); });
    });
  };
  if (scrubs.length) { addEventListener('scroll', scrubTick, { passive: true }); scrubTick(); }

  if (finePointer) {
    /* Hero spotlight. */
    doc.querySelectorAll('.hero, .cheops-contact-hero, .cheops-city-hero').forEach(function (h) {
      var spot = doc.createElement('div');
      spot.className = 'cm-spot';
      h.appendChild(spot);
      h.addEventListener('pointermove', function (e) {
        var r = h.getBoundingClientRect();
        spot.style.setProperty('--cm-x', (e.clientX - r.left) + 'px');
        spot.style.setProperty('--cm-y', (e.clientY - r.top) + 'px');
        spot.classList.add('cm-on');
      });
      h.addEventListener('pointerleave', function () { spot.classList.remove('cm-on'); });
    });

    /* 3D tilt with glare on cards. */
    doc.querySelectorAll('.pcard, .office-choice, .cheops-city-card, .cheops-insight-card, #services .svc, .val').forEach(function (c) {
      if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
      c.classList.add('cm-tilt');
      if (c.parentElement) c.parentElement.classList.add('cm-persp');
      var g = doc.createElement('span');
      g.className = 'cm-glare';
      c.appendChild(g);
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        var ang = Math.min(7, Math.hypot(x, y) * 14);
        c.classList.add('cm-tilting');
        c.style.rotate = (-y).toFixed(3) + ' ' + x.toFixed(3) + ' 0 ' + ang.toFixed(2) + 'deg';
        c.style.setProperty('--cm-gx', ((x + 0.5) * 100).toFixed(1) + '%');
        c.style.setProperty('--cm-gy', ((y + 0.5) * 100).toFixed(1) + '%');
      });
      c.addEventListener('pointerleave', function () { c.classList.remove('cm-tilting'); c.style.rotate = ''; });
    });
  }

  /* Images drift gently inside their frames. */
  var drifters = [].slice.call(doc.querySelectorAll('.office-choice img, .story-media img, .image-panel img, .cheops-city-card img'));
  drifters.forEach(function (img) { img.classList.add('cm-parallax'); });
  var drift = function () {
    var vh = window.innerHeight;
    drifters.forEach(function (img) {
      var r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.translate = '0 ' + (p * -6).toFixed(2) + '%';
    });
  };
  if (drifters.length) { addEventListener('scroll', drift, { passive: true }); drift(); }
})();
