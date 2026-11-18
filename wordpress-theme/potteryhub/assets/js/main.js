/* Pottery Hub theme — motion, cart drawer, wishlist, search. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const C = window.PH || {}, T = k => (C.i18n && C.i18n[k]) || k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const body = document.body, nav = $('#nav'), hero = $('#hero');
const icon = {
  arrow: '<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  heart: '<svg class="ic" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg>'
};
if (C.ar) $$('svg path').forEach(p => { if (/^M(5 12h14|19 12H5)/.test(p.getAttribute('d') || '')) p.closest('svg').classList.add('flipx'); });

/* ---------- smooth scroll ---------- */
let lenis = null;
if (window.Lenis && !reduce) {
  lenis = new Lenis({ lerp: .09, smoothWheel: true, wheelMultiplier: .95, prevent: n => !!(n.closest && n.closest('[data-lenis-prevent],.select2-container,.select2-dropdown')) });
  (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
}
const smoothTo = t => lenis ? lenis.scrollTo(t, { duration: 1.4, offset: -90 }) : (typeof t === 'number' ? scrollTo({ top: t, behavior: 'smooth' }) : t.scrollIntoView({ behavior: 'smooth' }));
document.addEventListener('click', e => {
  const a = e.target.closest('a[href*="#"]');
  if (!a) return;
  const u = new URL(a.href, location.href);
  if (u.pathname === location.pathname && u.hash.length > 1) { const t = document.getElementById(u.hash.slice(1)); if (t) { e.preventDefault(); closeAll(); smoothTo(t); } }
});

/* ---------- header ---------- */
const inner = !hero;
function onScroll() { nav.classList.toggle('solid', inner || scrollY > innerHeight * .3); }
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- toast ---------- */
let tt;
function toast(m, act, fn) {
  const t = $('#toast'); if (!t) return;
  t.innerHTML = esc(m) + (act ? ' · <u>' + esc(act) + '</u>' : '');
  t.style.pointerEvents = act ? 'auto' : 'none';
  t.onclick = act ? () => { t.classList.remove('on'); fn(); } : null;
  t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 3400);
}

/* ---------- overlays (drawers, menu, search, filters) ---------- */
const scrim = $('#scrim'), open = new Set();
function sync() { body.classList.toggle('lock', open.size > 0); scrim && scrim.classList.toggle('on', open.size > 0); if (lenis) open.size ? lenis.stop() : lenis.start(); }
function show(el) { if (!el) return; closeAll(); el.classList.add('on'); el.setAttribute('aria-hidden', 'false'); open.add(el); sync(); }
function closeAll() { open.forEach(el => { el.classList.remove('on'); el.setAttribute('aria-hidden', 'true'); }); open.clear(); sync(); }
scrim && (scrim.onclick = closeAll);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
document.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeAll(); });
const drawer = $('#drawer'), menu = $('#menu'), sov = $('#sov');
function openDrawer(tab) {
  if (!drawer) return;
  $$('.tabs button', drawer).forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $$('.pane', drawer).forEach(p => { p.hidden = p.dataset.pane !== tab; });
  $('#drTitle').textContent = $('.tabs button.on', drawer).firstChild.textContent.trim();
  if (tab === 'wish') renderWish();
  if (!drawer.classList.contains('on')) show(drawer);
}
drawer && $$('.tabs button', drawer).forEach(b => b.onclick = () => openDrawer(b.dataset.tab));
$('#openCart') && ($('#openCart').onclick = () => openDrawer('cart'));
$('#openWish') && ($('#openWish').onclick = () => openDrawer('wish'));
document.addEventListener('click', e => { const o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); openDrawer(o.dataset.open); } });
[$('#openMenu'), $('#openMenuM')].forEach(b => b && (b.onclick = () => show(menu)));
$('#openSearch') && ($('#openSearch').onclick = () => { show(sov); setTimeout(() => $('#sovQ').focus(), 300); });

/* ---------- cart (WooCommerce AJAX) ---------- */
const ep = name => (C.ajax || '').replace('%%endpoint%%', name);
async function post(name, data) {
  const r = await fetch(ep(name), { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data) });
  return r.json();
}
function applyFragments(fr) {
  if (!fr) return;
  Object.keys(fr).forEach(sel => $$(sel).forEach(el => { el.outerHTML = fr[sel]; }));
  if (C.ar) $$('.ph-mini svg path').forEach(p => { if (/^M5 12h14/.test(p.getAttribute('d') || '')) p.closest('svg').classList.add('flipx'); });
  const n = $('i.ph-bag-n'); if (n) { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); }
  if (window.jQuery) jQuery(document.body).trigger('wc_fragment_refresh');
}
function flyToCart(src, done) {
  const tgt = $('#openCart'), r = src && src.getBoundingClientRect();
  if (!tgt || !r || !r.width || reduce) { done(); return; }
  const tr = tgt.getBoundingClientRect(), f = document.createElement('img');
  f.className = 'flyer'; f.src = src.currentSrc || src.src; document.body.appendChild(f);
  const s0 = Math.min(r.width, r.height, 260), x0 = r.left + r.width / 2, y0 = r.top + r.height / 2, x1 = tr.left + tr.width / 2, y1 = tr.top + tr.height / 2, t0 = performance.now(), D = 850;
  (function st(now) {
    const t = clamp((now - t0) / D, 0, 1), e = eio(t), sz = s0 + (22 - s0) * e, x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e - Math.sin(Math.PI * t) * 140;
    Object.assign(f.style, { left: (x - sz / 2) + 'px', top: (y - sz / 2) + 'px', width: sz + 'px', height: sz + 'px', opacity: t > .9 ? (1 - t) * 10 : 1, transform: 'rotate(' + (t * 200) + 'deg)' });
    if (t < 1) requestAnimationFrame(st); else { f.remove(); done(); }
  })(t0);
}
async function addToCart(id, qty, src, name, btn) {
  if (btn) btn.classList.add('loading');
  try {
    const r = await post('add_to_cart', { product_id: id, quantity: qty || 1 });
    if (r.error && r.product_url) { location.href = r.product_url; return; }
    if (!r.fragments) throw 0;
    flyToCart(src, () => applyFragments(r.fragments));
    toast((qty > 1 ? qty + ' × ' : '') + (name || '') + ' — ' + T('added'), T('viewCart'), () => openDrawer('cart'));
    if (btn) { btn.classList.add('ok'); setTimeout(() => btn.classList.remove('ok'), 900); }
    if (window.jQuery) jQuery(document.body).trigger('added_to_cart', [r.fragments, r.cart_hash]);
  } catch (err) { toast(T('error')); }
  finally { if (btn) btn.classList.remove('loading'); }
}
document.addEventListener('click', e => {
  const qa = e.target.closest('[data-add]');
  if (qa) {
    e.preventDefault();
    const card = qa.closest('.card'), img = card ? $('.media img', card) : null, name = card ? $('h4', card).textContent : '';
    addToCart(qa.dataset.add, 1, img, name, qa);
  }
});
/* drawer quantity & remove */
document.addEventListener('click', async e => {
  const st = e.target.closest('.ph-mini .step button'), rm = e.target.closest('.ph-mini [data-rm]');
  if (!st && !rm) return;
  const line = e.target.closest('.line'); line.classList.add('busy');
  try {
    let r;
    if (rm) r = await post('remove_from_cart', { cart_item_key: rm.dataset.rm });
    else { const q = Math.max(0, +$('output', line).textContent + +st.dataset.q); r = await post('ph_qty', { key: line.dataset.key, qty: q, nonce: C.nonce || '' }); }
    applyFragments(r.fragments);
  } catch (err) { line.classList.remove('busy'); toast(T('error')); }
});

/* ---------- wishlist (stored in this browser) ---------- */
const WK = 'ph_wish_v1';
let wish = [];
try { wish = JSON.parse(localStorage.getItem(WK) || '[]'); } catch (e) { wish = []; }
const saveWish = () => { try { localStorage.setItem(WK, JSON.stringify(wish)); } catch (e) {} };
const inWish = id => wish.some(w => +w.id === +id);
function syncHearts() {
  $$('[data-wish]').forEach(h => { try { h.classList.toggle('on', inWish(JSON.parse(h.dataset.wish).id)); } catch (e) {} });
  const n = $('#wishN'); if (n) { n.textContent = wish.length; n.classList.toggle('on', wish.length > 0); }
  const tn = $('#tabWishN'); if (tn) tn.textContent = wish.length ? '(' + wish.length + ')' : '';
}
function toggleWish(d) {
  const i = wish.findIndex(w => +w.id === +d.id);
  if (i < 0) wish.push(d); else wish.splice(i, 1);
  saveWish(); syncHearts(); toast(T(i < 0 ? 'saved' : 'unsaved'));
  const n = $('#wishN'); if (n) { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); }
  if (drawer && !$('[data-pane="wish"]', drawer).hidden) renderWish();
}
function renderWish() {
  const b = $('#wishBody'); if (!b) return;
  if (!wish.length) { b.innerHTML = '<div class="dempty"><div class="eb">' + icon.heart + '</div><b>' + esc(T('noWish')) + '</b>' + esc(T('noWishTxt')) + '<br><a class="btn" href="' + esc(C.shop) + '">' + esc(T('browse')) + '</a></div>'; return; }
  b.innerHTML = wish.map(w => '<div class="line wl-line"><a class="li" href="' + esc(w.url) + '"><img src="' + esc(w.img) + '" alt=""></a><div><b>' + esc(w.name) + '</b><small>' + esc(w.cat || '') + '</small><div class="lp">' + esc(w.price) + '</div>' +
    (w.add ? '<button type="button" class="mv" data-mv="' + w.id + '">' + esc(T('moveToCart')) + '</button>' : '<a class="mv" href="' + esc(w.url) + '">' + esc(T('moveToCart')) + '</a>') +
    '</div><button type="button" class="rm" data-uw="' + w.id + '">' + esc(T('remove')) + '</button></div>').join('');
}
document.addEventListener('click', e => {
  const h = e.target.closest('[data-wish]');
  if (h) { e.preventDefault(); e.stopPropagation(); try { toggleWish(JSON.parse(h.dataset.wish)); } catch (err) {} h.classList.remove('pop'); void h.offsetWidth; h.classList.add('pop'); return; }
  const uw = e.target.closest('[data-uw]'); if (uw) { const d = wish.find(w => +w.id === +uw.dataset.uw); if (d) toggleWish(d); return; }
  const mv = e.target.closest('button[data-mv]');
  if (mv) { const d = wish.find(w => +w.id === +mv.dataset.mv); if (!d) return; wish = wish.filter(w => w !== d); saveWish(); syncHearts(); renderWish(); addToCart(d.id, 1, $('img', mv.closest('.line')), d.name); }
});
syncHearts();

/* ---------- search overlay ---------- */
const sq = $('#sovQ'), sres = $('#sovRes');
let sT, sReq = 0;
sq && sq.addEventListener('input', () => {
  clearTimeout(sT);
  const q = sq.value.trim();
  if (q.length < 2) { sres.innerHTML = ''; return; }
  sT = setTimeout(async () => {
    const id = ++sReq;
    try {
      const r = await (await fetch(ep('ph_search') + '&q=' + encodeURIComponent(q), { credentials: 'same-origin' })).json();
      if (id !== sReq) return;
      sres.innerHTML = r.length ? r.map(p => '<a href="' + esc(p.url) + '"><span class="si"><img src="' + esc(p.img) + '" alt=""></span><span><b>' + esc(p.name) + '</b><small>' + esc(p.price) + '</small></span></a>').join('') + '<a class="all" href="' + esc(C.search + '?post_type=product&s=' + encodeURIComponent(q) + (C.ar ? '&lang=ar' : '')) + '">' + esc(T('seeAll')) + ' ' + icon.arrow + '</a>'
        : '<div class="none">' + esc(T('noMatch')) + ' “' + esc(q) + '”</div>';
    } catch (e) {}
  }, 220);
});

/* ---------- cursor ---------- */
const cu = $('#cur');
if (cu) {
  addEventListener('pointermove', e => {
    cu.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    const t = e.target.closest ? e.target : body, btn = t.closest('a,button,label,select,input,summary'), lb = t.closest('[data-cur]');
    const useL = lb && (!btn || btn === lb || btn.classList.contains('cover'));
    cu.classList.toggle('lbl', !!useL); if (useL) $('span', cu).textContent = lb.dataset.cur;
    cu.classList.toggle('hov', !useL && !!btn);
  }, { passive: true });
  addEventListener('pointerdown', () => cu.classList.add('press'));
  addEventListener('pointerup', () => cu.classList.remove('press'));
}

/* ---------- reveals ---------- */
function split(el) {
  if (el.dataset.split) return;
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w, i) => '<span class="wd"><i style="--i:' + i + '">' + esc(w) + '</i></span>').join(' ');
  el.dataset.split = 1; el.classList.add('sp');
}
$$('.sec-h h2, .band h2, .promo h3, #giant').forEach(split);
$$('.sec-h p, .sec-h .see, .sec-h .arrows, .chips, .band p, .band .btn, .promo p, .promo .wbtn').forEach(el => { el.setAttribute('data-rv', ''); el.style.setProperty('--d', '150ms'); });
const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); cio.unobserve(e.target); } }), { threshold: .1 });
function watch(root) { $$('[data-rv],.sp,.eyebrow,.cat', root).forEach(el => rio.observe(el)); $$('.card', root).forEach(el => cio.observe(el)); }
watch(document);
const rvs = $$('.rv');
requestAnimationFrame(() => rvs.forEach((x, i) => { x.style.setProperty('--d', (150 + i * 70) + 'ms'); x.classList.add('go'); }));

/* ---------- marquee, parallax, progress ---------- */
const marq = $('#marqT');
if (marq) {
  let words = ['House of Pottery'];
  try { words = JSON.parse($('#marq').dataset.words); } catch (e) {}
  const star = '<svg class="st" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.6 6.5 3.5 9.4 10 10-6.5.6-9.4 3.5-10 10-.6-6.5-3.5-9.4-10-10 6.5-.6 9.4-3.5 10-10z"/></svg>';
  const half = '<div class="it">' + words.concat(words).map((t, i) => '<span class="' + (i % 2 ? 'o' : '') + '">' + esc(t) + '</span>' + star).join('') + '</div>';
  marq.innerHTML = half + half;
}
const pars = $$('[data-par]'), prog = $('#prog');
let mx = 0, lastY = scrollY, vel = 0;
(function motion() {
  const y = scrollY, dy = y - lastY; lastY = y; vel += (dy - vel) * .1;
  if (marq && !reduce) {
    const w = marq.scrollWidth / 2, dir = C.ar ? 1 : -1;
    mx += dir * (.6 + Math.min(Math.abs(vel), 40) * .35); if (Math.abs(mx) >= w) mx -= dir * w;
    marq.style.transform = 'translate3d(' + mx + 'px,0,0) skewX(' + clamp(-vel * .25, -8, 8) + 'deg)';
  }
  const vh = innerHeight;
  if (!reduce) pars.forEach(el => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * +el.dataset.par) + 'px,0)'; });
  const h = document.documentElement.scrollHeight - vh; if (prog) prog.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
  requestAnimationFrame(motion);
})();

/* ---------- card tilt & magnetic buttons ---------- */
document.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || reduce) return;
  const m = e.target.closest && e.target.closest('.card .media');
  $$('.media.tilt').forEach(x => { if (x !== m) { x.classList.remove('tilt'); x.style.setProperty('--rx', '0deg'); x.style.setProperty('--ry', '0deg'); } });
  if (m) {
    const r = m.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    m.classList.add('tilt'); m.style.setProperty('--rx', ((.5 - py) * 8) + 'deg'); m.style.setProperty('--ry', ((px - .5) * 10) + 'deg');
    m.style.setProperty('--gx', px * 100 + '%'); m.style.setProperty('--gy', py * 100 + '%');
  }
  $$('.mag-on').forEach(b => { if (!b.contains(e.target)) { b.classList.remove('mag-on'); b.style.transform = ''; } });
  const b = e.target.closest && e.target.closest('.btn:not(.wide),.wbtn,.see,.ibtn,.pill,.arrows button,.x');
  if (b) { const r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); b.classList.add('mag-on'); b.style.transform = 'translate(' + dx * .22 + 'px,' + dy * .3 + 'px)'; }
}, { passive: true });

/* shared-element page transition: card image → product image */
document.addEventListener('click', e => {
  const a = e.target.closest('.card .cover, .card h4 a, #bFurl');
  if (!a || !document.startViewTransition && !('onpagereveal' in window)) return;
  const img = a.closest('.card') ? $('.media img', a.closest('.card')) : $('#bFi');
  if (img) img.style.viewTransitionName = 'ph-img';
});

/* ---------- homepage ---------- */
if (hero) {
  let slides = [], feat = [], cats = [];
  try { slides = JSON.parse(hero.dataset.slides); feat = JSON.parse(hero.dataset.feat); cats = JSON.parse(hero.dataset.cats); } catch (e) {}
  const bBig = $('#bBig'), BDUR = 6000; let bi = -1, btimer = null;
  slides.forEach(s => {
    s.el = document.createElement('div'); s.el.className = 'im'; s.el.style.backgroundImage = "url('" + s.img + "')"; bBig.prepend(s.el);
    s.tt = document.createElement('span'); let k = 0; s.tt.innerHTML = s.t.split(' ').map(w => '<span class="w2"><i style="--i:' + (k++) + '">' + esc(w) + '</i></span>').join(' '); $('#bT').appendChild(s.tt);
  });
  function fitHero() {
    const W = bBig.clientWidth, H = bBig.clientHeight, r = W / H, ir = 16 / 9;
    slides.forEach(s => { let px = 50; if (ir > r) { const v = r / ir; px = clamp((s.fx / 100 - v / 2) / (1 - v), 0, 1) * 100; } s.el.style.backgroundPosition = px + '% 50%'; });
    if (slides.length) $('#bT').style.height = Math.max(...slides.map(s => s.tt.offsetHeight)) + 'px';
  }
  addEventListener('resize', fitHero); if (document.fonts) document.fonts.ready.then(fitHero);
  $('#bDots').innerHTML = slides.map((_, i) => '<button type="button" aria-label="' + (i + 1) + '"></button>').join('');
  $$('#bDots button').forEach((b, i) => b.onclick = () => go(i));
  function go(n) {
    if (n === bi || !slides[n]) return; const prev = slides[bi], s = slides[n];
    slides.forEach((x, i) => x.el.classList.toggle('on', i === n));
    if (prev) { prev.tt.classList.remove('on'); prev.tt.classList.add('off'); const pt = prev.tt; setTimeout(() => { pt.classList.add('rs'); pt.classList.remove('off'); void pt.offsetWidth; pt.classList.remove('rs'); }, 800); }
    setTimeout(() => s.tt.classList.add('on'), prev ? 250 : 0);
    const p = $('#bP'), eb = $('#bEb'), cta = $('#bCta'); p.style.opacity = 0; p.style.transform = 'translateY(10px)'; eb.style.opacity = 0;
    setTimeout(() => { p.textContent = s.p; eb.textContent = s.eb; $('span', cta).textContent = s.cta; cta.href = s.url; p.style.opacity = ''; p.style.transform = ''; eb.style.opacity = ''; }, prev ? 380 : 0);
    $$('#bDots button').forEach((b, i) => { b.classList.remove('on'); if (i === n) { void b.offsetWidth; b.style.setProperty('--dur', BDUR + 'ms'); b.classList.add('on'); } });
    bi = n; clearTimeout(btimer); btimer = setTimeout(tick, BDUR);
  }
  function tick() { if (hero.classList.contains('paused') || open.size || document.hidden || scrollY > innerHeight * .8) { btimer = setTimeout(tick, 700); return; } go((bi + 1) % slides.length); }
  bBig.addEventListener('pointerenter', () => hero.classList.add('paused')); bBig.addEventListener('pointerleave', () => hero.classList.remove('paused'));

  /* featured piece */
  const bf = $('#bFeat'); let fi = 0, fpause = false;
  function setFeat() {
    const f = feat[fi]; if (!f) return;
    $('#bFc').textContent = f.cat; $('#bFn').textContent = f.name; $('#bFp').innerHTML = f.price; $('#bFi').src = f.img;
    $('#bFurl').href = f.url; $('#bFurl').setAttribute('aria-label', f.name); $('#bFbuy').href = f.buy;
    $('#bFadd').hidden = !f.add; $('#bFwish').dataset.wish = JSON.stringify(f.wish); syncHearts();
  }
  if (bf && feat.length) {
    setFeat();
    setInterval(() => { if (fpause || open.size || document.hidden || feat.length < 2) return; bf.classList.add('chg'); setTimeout(() => { fi = (fi + 1) % feat.length; setFeat(); bf.classList.remove('chg'); }, 480); }, 4500);
    bf.addEventListener('pointerenter', () => fpause = true); bf.addEventListener('pointerleave', () => fpause = false);
    $('#bFadd').onclick = () => addToCart(feat[fi].id, 1, $('#bFi'), feat[fi].name, $('#bFadd'));
  }
  /* rotating category tile */
  const bc = $('#bCat'); let ci = 0;
  if (bc && cats.length > 1) setInterval(() => { if (open.size || document.hidden || bc.matches(':hover')) return; bc.classList.add('chg'); setTimeout(() => { ci = (ci + 1) % cats.length; const c = cats[ci]; $('#bCn').textContent = c.n; $('#bCh').textContent = c.name; $('#bCi').src = c.img; bc.href = c.url; bc.classList.remove('chg'); }, 480); }, 5200);

  /* category arrows */
  $$('[data-sc]').forEach(b => b.onclick = () => { const r = $('#catRow'); r.scrollBy({ left: (C.ar ? -1 : 1) * +b.dataset.sc * r.clientWidth * .8, behavior: 'smooth' }); });
  /* popular tabs */
  $$('#chips .chip').forEach(ch => ch.onclick = () => {
    $$('#chips .chip').forEach(x => x.classList.toggle('on', x === ch));
    $$('#popular .grid').forEach(g => { const on = g.dataset.panel === ch.dataset.panel; g.hidden = !on; if (on) $$('.card', g).forEach(c => { c.classList.remove('vis'); cio.observe(c); }); });
  });
  hero.startIntro = () => { fitHero(); hero.classList.add('in'); go(0); };
}

/* ---------- product page ---------- */
const form = $('.book form.cart');
$$('.quantity').forEach(q => {
  const inp = $('input.qty', q); if (!inp) return;
  const step = d => { const min = +inp.min || 1, max = +inp.max || 999; inp.value = clamp((+inp.value || 1) + d, min, max); inp.dispatchEvent(new Event('change', { bubbles: true })); };
  const m = $('.qminus', q), p = $('.qplus', q); m && (m.onclick = () => step(-1)); p && (p.onclick = () => step(1));
});
if (form && !form.classList.contains('variations_form') && !form.classList.contains('grouped_form')) {
  const addBtn = $('.single_add_to_cart_button', form);
  form.addEventListener('submit', e => {
    if (e.submitter && e.submitter.name === 'ph_buy_now') return;
    if (!addBtn || !addBtn.value) return;
    e.preventDefault();
    const qty = +($('input.qty', form) || { value: 1 }).value || 1;
    addToCart(addBtn.value, qty, $('#mainImg'), $('.dname') ? $('.dname').textContent : '', addBtn);
  });
}
$$('.minis button[data-full]').forEach((b, i) => {
  if (!i) b.classList.add('on');
  b.onclick = () => { const m = $('#mainImg'); m.style.opacity = 0; setTimeout(() => { m.src = b.dataset.full; m.style.opacity = ''; }, 200); $$('.minis button').forEach(x => x.classList.toggle('on', x === b)); };
});
const sbar = $('#sbar'), bookEl = $('.book');
if (sbar && bookEl) {
  new IntersectionObserver(es => es.forEach(e => sbar.classList.toggle('on', !e.isIntersecting && e.boundingClientRect.top < 0)), { threshold: 0 }).observe(bookEl);
  $('#sbAdd').onclick = () => { const b = $('.single_add_to_cart_button'); if (form && form.classList.contains('variations_form')) smoothTo(bookEl); else if (b) b.click(); };
  $('#sbBuy').onclick = () => { const b = $('#buyNow'); if (form && form.classList.contains('variations_form')) smoothTo(bookEl); else if (b) b.click(); };
}

/* ---------- shop: mobile filters ---------- */
const side = $('#side');
$('#openFilters') && ($('#openFilters').onclick = () => show(side));
$('#sideDone') && ($('#sideDone').onclick = closeAll);

/* ---------- newsletter result ---------- */
const sub = new URLSearchParams(location.search).get('ph_sub');
if (sub) { setTimeout(() => toast(T(sub === 'ok' ? 'subscribed' : 'sub_bad')), 600); history.replaceState(null, '', location.pathname + location.search.replace(/[?&]ph_sub=[^&]*/, '').replace(/^&/, '?') + location.hash); }

/* ---------- preloader (first visit of the session only) ---------- */
const pre = $('#pre');
function intro() { nav.classList.remove('pre'); if (hero && hero.startIntro) hero.startIntro(); }
let seen = false;
try { seen = sessionStorage.getItem('ph_pre') === '1'; sessionStorage.setItem('ph_pre', '1'); } catch (e) {}
if (!pre || seen || reduce) { if (pre) pre.remove(); requestAnimationFrame(intro); }
else {
  $('#preWord').innerHTML = 'POTTERY HUB'.split('').map((c, i) => c === ' ' ? '<span style="width:.45em"></span>' : '<span><i style="--i:' + i + '">' + c + '</i></span>').join('');
  if (lenis) lenis.stop(); document.documentElement.style.overflow = 'hidden';
  const urls = hero ? $$('#bBig .im').map(x => x.style.backgroundImage.slice(5, -2)) : [];
  let done = 0; const total = urls.length + 1;
  urls.forEach(u => { const i = new Image(); i.onload = i.onerror = () => done++; i.src = u; });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => done++);
  requestAnimationFrame(() => pre.classList.add('go'));
  const t0 = performance.now(); let shown = 0, fin = false;
  (function tick(now) {
    const el = now - t0, goal = Math.max(Math.min(done / total, el / 1900, 1), el > 7000 ? 1 : 0);
    shown += (goal - shown) * .07; if (goal >= 1 && shown > .995) shown = 1;
    $('#preBar').style.transform = 'scaleX(' + shown + ')'; $('#preF').style.setProperty('--a', (shown * 360) + 'deg');
    if (shown < 1) return requestAnimationFrame(tick);
    if (fin) return; fin = true;
    setTimeout(() => { pre.classList.add('out'); document.documentElement.style.overflow = ''; if (lenis && !open.size) lenis.start(); setTimeout(intro, 450); setTimeout(() => pre.remove(), 1400); }, 350);
  })(t0);
}
})();
