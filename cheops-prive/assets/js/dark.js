/* Cheops Privé dark mode.
   The theme's colours live in many stylesheets and inline styles, so instead of
   a second palette this reads each element's computed colours once and swaps
   light surfaces for warm dark ones and dark text for light text. Images, video
   and already-dark sections are left as they are. The choice is remembered. */
(function () {
  'use strict';
  var html = document.documentElement, KEY = 'cheops_theme', changed = [];

  var parse = function (c) {
    var m = c && c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  var lum = function (c) { return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255; };
  // Inline (wins over everything) plus a marker attribute that dark.css also styles,
  // so the swap survives scripts that rewrite an element's style attribute.
  var set = function (el, prop, value, mark) {
    changed.push([el, prop, el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)]);
    el.style.setProperty(prop, value, 'important');
    if (mark) { el.setAttribute(mark[0], mark[1]); changed.push([el, 'attr:' + mark[0]]); }
  };
  var skip = ',IMG,VIDEO,PICTURE,SVG,PATH,CANVAS,IFRAME,SCRIPT,STYLE,NOSCRIPT,SOURCE,BR,';

  function paint(root) {
    var els = root.querySelectorAll ? root.querySelectorAll('*') : [];
    var list = [root].concat([].slice.call(els));
    list.forEach(function (el) {
      if (el.nodeType !== 1 || skip.indexOf(',' + el.tagName.toUpperCase() + ',') > -1 || el.closest('.leaflet-container, svg, #wpadminbar, .cheops-preloader, #cheops-video-preloader, .cheops-site-header, #cursor, .cursor, #motionCursor')) return;
      if (el.dataset.cmDark) return;
      el.dataset.cmDark = '1';
      var cs = getComputedStyle(el);
      var bg = parse(cs.backgroundColor);
      var neutral = function (c) { return Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) < 40; };
      if (bg && bg.a > 0.35 && neutral(bg)) {
        var L = lum(bg);
        // White and cream surfaces become warm charcoal; tinted ones keep a hint of their tone.
        if (L > 0.86) set(el, 'background-color', L > 0.97 ? 'rgba(24,23,21,' + bg.a + ')' : 'rgba(31,29,26,' + bg.a + ')', ['data-cmbg', L > 0.97 ? 'w' : 'c']);
        else if (L > 0.7) set(el, 'background-color', 'rgba(44,40,34,' + bg.a + ')', ['data-cmbg', 't']);
      }
      ['::before', '::after'].forEach(function (pseudo, i) {
        var ps = getComputedStyle(el, pseudo);
        if (ps.content === 'none' || ps.content === 'normal') return;
        var pb = parse(ps.backgroundColor), img = ps.backgroundImage, first = parse((img.match(/rgba?\([^)]+\)/) || [''])[0]);
        if ((pb && pb.a > 0.35 && lum(pb) > 0.7 && neutral(pb)) || (first && lum(first) > 0.8 && neutral(first))) {
          el.classList.add(i ? 'cm-dark-after' : 'cm-dark-before');
          changed.push([el, 'class:' + (i ? 'cm-dark-after' : 'cm-dark-before')]);
        }
      });
      var fg = parse(cs.color);
      // Text sitting on a coloured (gold) badge keeps its dark colour.
      if (fg && !(bg && bg.a > 0.35 && !neutral(bg))) {
        var F = lum(fg);
        if (F < 0.25) set(el, 'color', 'rgba(238,232,222,' + fg.a + ')', ['data-cmfg', 'i']);
        else if (F < 0.55 && Math.abs(fg.r - fg.b) < 30) set(el, 'color', 'rgba(170,163,153,' + fg.a + ')', ['data-cmfg', 'm']);
      }
      var bd = parse(cs.borderTopColor);
      if (bd && parseFloat(cs.borderTopWidth) > 0 && lum(bd) > 0.6 && bd.a > 0.05) set(el, 'border-color', 'rgba(255,255,255,0.12)');
      else if (bd && parseFloat(cs.borderTopWidth) > 0 && lum(bd) < 0.25 && bd.a < 0.4) set(el, 'border-color', 'rgba(255,255,255,0.12)');
    });
  }

  function apply(dark) {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (dark) {
      paint(document.body);
      observer && observer.observe(document.body, { childList: true, subtree: true });
      // Some sections are rebuilt by scripts after load; catch anything new.
      [400, 1500, 3500].forEach(function (t) { setTimeout(function () { if (html.getAttribute('data-theme') === 'dark') paint(document.body); }, t); });
    }
    else {
      observer && observer.disconnect();
      changed.reverse().forEach(function (c) {
        if (c[1].indexOf('class:') === 0) { c[0].classList.remove(c[1].slice(6)); return; }
        if (c[1].indexOf('attr:') === 0) { c[0].removeAttribute(c[1].slice(5)); return; }
        c[2] ? c[0].style.setProperty(c[1], c[2], c[3]) : c[0].style.removeProperty(c[1]);
      });
      changed = [];
      document.querySelectorAll('[data-cm-dark]').forEach(function (el) { delete el.dataset.cmDark; });
    }
    html.classList.add('cm-dark-ready');
    document.querySelectorAll('.cheops-theme-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
    });
  }

  var observer = 'MutationObserver' in window ? new MutationObserver(function (records) {
    records.forEach(function (r) { r.addedNodes.forEach(function (n) { if (n.nodeType === 1) paint(n); }); });
  }) : null;

  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  var start = function () {
    apply(stored === 'dark');
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.cheops-theme-toggle');
      if (!b) return;
      e.preventDefault();
      var dark = html.getAttribute('data-theme') !== 'dark';
      try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch (err) {}
      html.classList.add('cm-theme-switching');
      apply(dark);
      setTimeout(function () { html.classList.remove('cm-theme-switching'); }, 600);
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
