/* Pottery Hub theme — motion, cart drawer, wishlist, search. */
(() => {
'use strict';
if (window.__phMain) return; window.__phMain = 1;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const C = window.PH || {}, T = k => (C.i18n && C.i18n[k]) || k;
C.ar = +C.ar === 1; C.front = +C.front === 1; // wp_localize_script sends "0" / "1" strings
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const body = document.body, nav = $('#nav');
let hero = $('#hero');
const icon = {
  arrow: '<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  check: '<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.5 10 17 19 7"/></svg>',
  heart: '<svg class="ic" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg>'
};
const flipArrows = root => { if (C.ar) $$('svg path', root).forEach(p => { if (/^M(5 12h14|19 12H5)/.test(p.getAttribute('d') || '')) p.closest('svg').classList.add('flipx'); }); };
flipArrows(document);

/* ---------- smooth scroll ---------- */
let lenis = null;
if (window.Lenis && !reduce) {
  lenis = new Lenis({ lerp: .09, smoothWheel: true, wheelMultiplier: .95, prevent: n => !!(n.closest && n.closest('[data-lenis-prevent],.side,.drawer,.sov,.select2-container,.select2-dropdown')) });
  (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
}
const smoothTo = t => lenis ? lenis.scrollTo(t, { duration: 1.4, offset: -90 }) : (typeof t === 'number' ? scrollTo({ top: t, behavior: 'smooth' }) : t.scrollIntoView({ behavior: 'smooth' }));
document.addEventListener('click', e => {
  const a = e.target.closest('a[href*="#"]');
  if (!a) return;
  const u = new URL(a.href, location.href);
  if (u.pathname === location.pathname && u.hash.length > 1) { const t = document.getElementById(u.hash.slice(1)); if (t) { e.preventDefault(); closeAll(); const d = t.closest('details'); if (d) d.open = true; smoothTo(t); } }
});

/* ---------- header ---------- */
let inner = !hero;
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
let drawerAt = 0;
const afterSlide = fn => { const w = 620 - (performance.now() - drawerAt); w > 0 ? setTimeout(fn, w) : fn(); };
function openDrawer(tab) {
  if (!drawer) return;
  if (!drawer.classList.contains('on')) drawerAt = performance.now();
  $$('.tabs button', drawer).forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  if (!$('[data-pane="' + tab + '"]', drawer)) tab = 'cart';
  $$('.pane', drawer).forEach(p => { p.hidden = p.dataset.pane !== tab; });
  const tb = $('.tabs button.on', drawer); if (tb) $('#drTitle').textContent = tb.firstChild.textContent.trim();
  if (tab === 'wish') renderWish();
  if (!drawer.classList.contains('on')) show(drawer);
}
drawer && $$('.tabs button', drawer).forEach(b => b.onclick = () => openDrawer(b.dataset.tab));
$('#openCart') && ($('#openCart').onclick = () => openDrawer('cart'));
$('#openWish') && ($('#openWish').onclick = () => openDrawer('wish'));
document.addEventListener('click', e => { const o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); openDrawer(o.dataset.open); } });
[$('#openMenu'), $('#openMenuM')].forEach(b => b && (b.onclick = () => show(menu)));
$('#openSearch') && ($('#openSearch').onclick = () => { show(sov); setTimeout(() => $('#sovQ').focus(), 300); });
document.addEventListener('click', e => { if (e.target.closest('[data-search]')) { show(sov); setTimeout(() => $('#sovQ').focus(), 300); } });

/* ---------- cart (WooCommerce AJAX) ---------- */
const ep = name => (C.ajax || '').replace('%%endpoint%%', name);
async function post(name, data) {
  const r = await fetch(ep(name), { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data) });
  return r.json();
}
function applyFragments(fr, quiet) {
  if (!fr) return;
  Object.keys(fr).forEach(sel => $$(sel).forEach(el => { el.outerHTML = fr[sel]; }));
  if (C.ar) $$('.ph-mini svg path').forEach(p => { if (/^M5 12h14/.test(p.getAttribute('d') || '')) p.closest('svg').classList.add('flipx'); });
  const n = $('i.ph-bag-n'); if (n && !quiet) { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); }
}
function flyToCart(src, done) {
  const phone = matchMedia('(max-width:640px)').matches;
  if (phone) document.documentElement.classList.remove('dock-hide'); // bring the dock back so the piece has somewhere to land
  const tgt = (phone && $('#dock [data-dk="bag"]')) || $('#openCart'), r = src && src.getBoundingClientRect();
  if (!tgt || !r || !r.width || reduce) { done(); return; }
  const tr = tgt.getBoundingClientRect(), f = document.createElement('img');
  const s0 = Math.min(r.width, r.height, 220), x0 = r.left + r.width / 2, y0 = r.top + r.height / 2, x1 = tr.left + tr.width / 2, y1 = tr.top + tr.height / 2 - (phone ? 8 : 0), t0 = performance.now(), D = phone ? 720 : 820;
  f.className = 'flyer'; f.src = src.currentSrc || src.src; f.alt = '';
  Object.assign(f.style, { left: '0px', top: '0px', width: s0 + 'px', height: s0 + 'px', willChange: 'transform,opacity' });
  document.body.appendChild(f);
  let fired = false;
  (function st(now) {
    const t = clamp((now - t0) / D, 0, 1), e = eio(t), k = (s0 + (22 - s0) * e) / s0, x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e - Math.sin(Math.PI * t) * (phone ? 90 : 140);
    f.style.transform = 'translate3d(' + (x - s0 / 2) + 'px,' + (y - s0 / 2) + 'px,0) scale(' + k + ') rotate(' + (t * 200) + 'deg)';
    f.style.opacity = t > .88 ? (1 - t) / .12 : 1;
    if (!fired && t >= .82) { fired = true; done(); } // open the bag as it lands, not after a pause
    if (t < 1) requestAnimationFrame(st); else f.remove();
  })(t0);
}
/* Instant add to cart: the bag updates right away, the server confirms in the background. */
function bumpBag(n) {
  const c = $('i.ph-bag-n'); if (!c) return;
  const v = Math.max(0, (+c.textContent || 0) + n); c.textContent = v; c.classList.toggle('on', v > 0);
  c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  const d = $('.ph-dock-n'); if (d) d.textContent = v || '';
}
let cartQueue = Promise.resolve();
let dropPages = () => {}, instantGo = null; // set by the instant-pages code below
/* Show the piece in the cart drawer straight away; the real line replaces it a moment later. */
function pendingLine(src, name, qty) {
  const mini = $('.ph-mini'); if (!mini) return;
  let body = $('.dbody', mini);
  if (!body || $('.dempty', mini)) { mini.innerHTML = '<div class="dbody" data-lenis-prevent></div>'; body = $('.dbody', mini); }
  const img = src ? (src.currentSrc || src.src) : '';
  const l = document.createElement('div'); l.className = 'line pending';
  l.innerHTML = '<span class="li">' + (img ? '<img src="' + esc(img) + '" alt="">' : '') + '</span><div><b>' + esc(name || '') + '</b><small>' + esc(T('added')) + '</small><div class="step"><output>' + (qty || 1) + '</output></div></div>';
  body.prepend(l);
}
function addToCart(id, qty, src, name, btn) {
  qty = qty || 1;
  bumpBag(qty);
  pendingLine(src, name, qty);
  flyToCart(src, () => openDrawer('cart'));
  if (btn) { btn.classList.add('ok'); setTimeout(() => btn.classList.remove('ok'), 900); }
  // requests run one after another so quick double-adds both count
  const job = cartQueue.then(() => post('add_to_cart', { product_id: id, quantity: qty })).then(r => {
    if (r && r.error && r.product_url) { bumpBag(0 - qty); location.href = r.product_url; return; }
    if (!r || !r.fragments) throw 0;
    dropPages();
    afterSlide(() => { applyFragments(r.fragments, true); if (window.jQuery) jQuery(document.body).trigger('added_to_cart', [r.fragments, r.cart_hash]); });
    return r;
  }).catch(() => { bumpBag(0 - qty); toast(T('error')); });
  cartQueue = job.catch(() => {});
  return job;
}
/* Buy now: add in the background, then straight to checkout. */
function buyNow(id, qty) {
  bumpBag(qty || 1);
  return cartQueue.then(() => post('add_to_cart', { product_id: id, quantity: qty || 1 })).then(r => {
    if (r && r.error && r.product_url) { location.href = r.product_url; return; }
    if (r && r.fragments) { applyFragments(r.fragments, true); if (window.jQuery) jQuery(document.body).trigger('added_to_cart', [r.fragments, r.cart_hash]); }
    dropPages();
    if (instantGo) instantGo(C.checkout); else location.href = C.checkout;
  }).catch(() => { location.href = C.checkout; });
}
document.addEventListener('click', e => {
  const qb = e.target.closest('a.qb[href*="ph_buy_now"]');
  if (!qb || !C.checkout) return;
  e.preventDefault();
  const id = new URL(qb.href).searchParams.get('add-to-cart');
  if (id) buyNow(id, 1); else location.href = qb.href;
});
document.addEventListener('click', e => {
  const qa = e.target.closest('[data-add]');
  if (qa) {
    e.preventDefault();
    const card = qa.closest('.card'), img = card ? $('.media img', card) : null, name = card ? $('h4', card).textContent : '';
    addToCart(qa.dataset.add, 1, img, name, qa);
  }
});
/* drawer quantity & remove: change on screen first, then sync with the server */
const lineQ = {};
document.addEventListener('click', e => {
  const st = e.target.closest('.ph-mini .step button'), rm = e.target.closest('.ph-mini [data-rm]');
  if (!st && !rm) return;
  const line = e.target.closest('.line'), key = line.dataset.key, out = $('output', line), was = +out.textContent;
  const q = rm ? 0 : Math.max(0, was + +st.dataset.q);
  out.textContent = q; bumpBag(q - was);
  if (!q) { line.style.height = line.offsetHeight + 'px'; requestAnimationFrame(() => line.classList.add('gone')); }
  clearTimeout(lineQ[key]);
  lineQ[key] = setTimeout(() => {
    cartQueue = cartQueue.then(() => post('ph_qty', { key, qty: q })).then(r => { applyFragments(r.fragments, true); dropPages(); }).catch(() => { toast(T('error')); post('get_refreshed_fragments', {}).then(r => applyFragments(r.fragments, true)); });
  }, q ? 300 : 0);
});

/* cached pages may show another visitor's (empty) cart: refresh it when this browser has one */
(() => {
  const has = /(^|;\s*)woocommerce_items_in_cart=1/.test(document.cookie), bag = $('i.ph-bag-n');
  if (C.ajax && bag && (has || +bag.textContent > 0)) post('get_refreshed_fragments', {}).then(r => applyFragments(r && r.fragments, true)).catch(() => {});
})();

/* ---------- wishlist (this browser; synced to the account when logged in) ---------- */
const WK = 'ph_wish_v1';
let wish = [];
try { wish = JSON.parse(localStorage.getItem(WK) || '[]'); } catch (e) { wish = []; }
const saveWish = (local) => {
  try { localStorage.setItem(WK, JSON.stringify(wish)); } catch (e) {}
  if (!local && C.user) post('ph_wish', { ids: wish.map(w => w.id).join(','), replace: 1, nonce: C.wnonce }).catch(() => {});
};
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
/* refresh saved pieces (current language & prices) and merge with the account */
if (C.ajax && $('#openWish') && (wish.length || C.user)) post('ph_wish', { ids: wish.map(w => w.id).join(','), nonce: C.wnonce || '' }).then(r => {
  if (!Array.isArray(r)) return;
  wish = r; saveWish(true); syncHearts();
  if (drawer && !$('[data-pane="wish"]', drawer).hidden) renderWish();
}).catch(() => {});

/* ---------- search overlay: filters a product list in the browser, no waiting ---------- */
const sq = $('#sovQ'), sres = $('#sovRes');
const norm = t => String(t || '').toLowerCase().normalize('NFKD').replace(/[ً-ٰٟـ̀-ͯ]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');
let sIdx = null, sIdxLoading = null;
const SK = 'ph_sidx_' + (C.ar ? 'ar' : 'en');
try { const c = JSON.parse(sessionStorage.getItem(SK) || 'null'); if (c && c.l) sIdx = c; } catch (e) {}
function loadIndex() {
  if (sIdxLoading) return sIdxLoading;
  sIdxLoading = fetch(ep('ph_search_index'), { credentials: 'same-origin' }).then(r => r.json()).then(d => {
    if (d && d.l) { d.l.forEach(x => { x.s = norm(x.n + ' ' + x.k); }); sIdx = d; try { sessionStorage.setItem(SK, JSON.stringify(d)); } catch (e) {} renderSearch(); }
  }).catch(() => {});
  return sIdxLoading;
}
if (sIdx) sIdx.l.forEach(x => { if (!x.s) x.s = norm(x.n + ' ' + x.k); });
function renderSearch() {
  if (!sq || !sres) return;
  const q = sq.value.trim();
  if (q.length < 1) { sres.innerHTML = ''; return; }
  if (!sIdx) { loadIndex(); return; }
  const words = norm(q).split(/\s+/).filter(Boolean);
  const hits = sIdx.l.filter(x => words.every(w => x.s.includes(w))).slice(0, 12);
  sres.innerHTML = hits.length ? hits.map(p => '<a href="' + esc(p.u) + '"><span class="si"><img src="' + esc(p.i) + '" alt=""></span><span><b>' + esc(p.n) + '</b><small>' + esc(p.p) + '</small></span></a>').join('') + '<a class="all" href="' + esc(C.search + '?post_type=product&s=' + encodeURIComponent(q)) + '">' + esc(T('seeAll')) + ' ' + icon.arrow + '</a>'
    : '<div class="none">' + esc(T('noMatch')) + ' “' + esc(q) + '”</div>';
}
sq && sq.addEventListener('input', renderSearch);
$('#openSearch') && $('#openSearch').addEventListener('pointerenter', loadIndex);
$('#openSearch') && $('#openSearch').addEventListener('click', loadIndex);
// fetch the list quietly once the page is idle, so the first search is instant too
(window.requestIdleCallback || (f => setTimeout(f, 2500)))(() => { if (C.ajax && !sIdx) loadIndex(); });

/* ---------- forms answer immediately (sent in the background) ---------- */
document.addEventListener('submit', e => {
  const f = e.target;
  if (!f.matches('form.news, form.phform')) return;
  if (f.matches('form.phform')) {
    const ph = $('input[name=phone]', f), em = $('input[name=email]', f);
    if (ph && em && !ph.value.trim() && !em.value.trim()) { e.preventDefault(); ph.setCustomValidity(T('needContact')); ph.reportValidity(); ph.addEventListener('input', () => ph.setCustomValidity(''), { once: true }); return; }
  }
  e.preventDefault();
  const body = new FormData(f);
  fetch(f.getAttribute('action'), { method: 'POST', body, credentials: 'same-origin' }).catch(() => {});
  if (f.matches('form.news')) { f.reset(); toast(T('subscribed')); return; }
  const card = f.closest('.fcard') || f;
  const ok = document.createElement('div'); ok.className = 'phform-ok'; ok.innerHTML = icon.check + ' ' + esc(f.dataset.ok || T('sent'));
  f.reset(); $$('.phform-ok,.phform-err', f).forEach(x => x.remove()); f.prepend(ok); ok.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); cio.unobserve(e.target); } }), { threshold: .1 });
function watch(root) { $$('[data-rv],.sp,.eyebrow,.cat', root).forEach(el => rio.observe(el)); $$('.card', root).forEach(el => cio.observe(el)); }

/* ---------- marquee, parallax, progress ---------- */
let marq = null, pars = [], mx = 0;
const prog = $('#prog');
let lastY = scrollY, vel = 0;
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
function initHome() {
  let slides = [], feat = [], cats = [];
  try { slides = JSON.parse(hero.dataset.slides); feat = JSON.parse(hero.dataset.feat); cats = JSON.parse(hero.dataset.cats); } catch (e) {}
  const bBig = $('#bBig'), BDUR = 6000; let bi = -1, btimer = null;
  slides.forEach((s, i) => {
    const first = i === 0 && $('.im[data-first]', bBig); // the first photo is already in the page (shows before scripts run)
    if (first) s.el = first; else { s.el = document.createElement('div'); s.el.className = 'im'; s.el.style.backgroundImage = "url('" + s.img + "')"; bBig.prepend(s.el); }
    s.tt = document.createElement('span'); let k = 0; s.tt.innerHTML = s.t.split(' ').map(w => '<span class="w2"><i style="--i:' + (k++) + '">' + esc(w) + '</i></span>').join(' '); $('#bT').appendChild(s.tt);
  });
  function fitHero() {
    const W = bBig.clientWidth, H = bBig.clientHeight, r = W / H, ir = 16 / 9;
    slides.forEach(s => { let px = 50; if (ir > r) { const v = r / ir; px = clamp((s.fx / 100 - v / 2) / (1 - v), 0, 1) * 100; } s.el.style.backgroundPosition = px + '% 50%'; });
    if (slides.length) $('#bT').style.height = Math.max(...slides.map(s => s.tt.offsetHeight)) + 'px';
  }
  pOn(window, 'resize', fitHero); if (document.fonts) document.fonts.ready.then(fitHero);
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
    bi = n; clearTimeout(btimer); btimer = pT(tick, BDUR);
  }
  function tick() { if (hero.classList.contains('paused') || open.size || document.hidden || scrollY > innerHeight * .8) { btimer = pT(tick, 700); return; } go((bi + 1) % slides.length); }
  bBig.addEventListener('pointerenter', () => hero.classList.add('paused')); bBig.addEventListener('pointerleave', () => hero.classList.remove('paused'));

  /* featured piece */
  const bf = $('#bFeat'); let fi = 0, fpause = false;
  function setFeat() {
    const f = feat[fi]; if (!f || !$('#bFc')) return; // the page may have changed meanwhile
    $('#bFc').textContent = f.cat; $('#bFn').textContent = f.name; $('#bFp').innerHTML = f.price; $('#bFi').src = f.img;
    $('#bFurl').href = f.url; $('#bFurl').setAttribute('aria-label', f.name); $('#bFbuy').href = f.buy;
    $('#bFadd').hidden = !f.add;
  }
  if (bf && feat.length) {
    setFeat();
    pI(() => { if (fpause || open.size || document.hidden || feat.length < 2) return; bf.classList.add('chg'); setTimeout(() => { fi = (fi + 1) % feat.length; setFeat(); bf.classList.remove('chg'); }, 480); }, 4500);
    bf.addEventListener('pointerenter', () => fpause = true); bf.addEventListener('pointerleave', () => fpause = false);
    $('#bFadd').onclick = () => addToCart(feat[fi].id, 1, $('#bFi'), feat[fi].name, $('#bFadd'));
  }
  /* rotating category tile */
  [['#bCat', 0], ['#bCat2', -1]].forEach(([sel, start], k) => {
    const bc = $(sel); if (!bc || cats.length < 2) return;
    let ci = start < 0 ? +bc.dataset.start || 0 : start;
    const sm = $('small', bc), h = $('h4', bc), im = $('.ci img', bc);
    const step = () => { if (open.size || document.hidden || bc.matches(':hover')) return; bc.classList.add('chg'); setTimeout(() => { ci = (ci + 1) % cats.length; const c = cats[ci]; sm.textContent = c.n; h.textContent = c.name; im.src = c.img; bc.href = c.url; bc.classList.remove('chg'); }, 480); };
    if (k) pT(() => pI(step, 5200), 2600); else pI(step, 5200); // the second tile turns half a beat later
  });

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
/* quantity +/- (delegated, so it keeps working after WooCommerce refreshes the cart) */
document.addEventListener('click', e => {
  const b = e.target.closest('.quantity .qminus, .quantity .qplus'); if (!b) return;
  e.preventDefault();
  const inp = $('input.qty', b.closest('.quantity')); if (!inp) return;
  const min = inp.min === '' ? 1 : +inp.min, max = +inp.max || 999;
  inp.value = clamp((+inp.value || 0) + (b.classList.contains('qplus') ? 1 : -1), min, max);
  inp.dispatchEvent(new Event('change', { bubbles: true }));
  if (window.jQuery) jQuery(inp).trigger('change');
});
function initProduct() {
  const form = $('.book form.cart');
  if (form && !form.classList.contains('variations_form') && !form.classList.contains('grouped_form')) {
    const addBtn = $('.single_add_to_cart_button', form);
    form.addEventListener('submit', e => {
      if (!addBtn || !addBtn.value) return;
      e.preventDefault();
      const qty = +($('input.qty', form) || { value: 1 }).value || 1;
      if (e.submitter && e.submitter.name === 'ph_buy_now') { buyNow(addBtn.value, qty); return; }
      addToCart(addBtn.value, qty, $('#mainImg'), $('.dname') ? $('.dname').textContent : '', addBtn);
    });
  }
  /* variable products: AJAX add of the chosen variation, image swap, Buy now only once a choice is made */
  if (form && form.classList.contains('variations_form')) {
    const addBtn = $('.single_add_to_cart_button', form), buy = $('#buyNow'), mi = $('#mainImg'), orig = mi && mi.src;
    const vid = () => +(($('input.variation_id', form) || {}).value || 0);
    if (buy) buy.disabled = true;
    form.addEventListener('submit', e => {
      if (!vid() || (addBtn && addBtn.classList.contains('disabled'))) return;
      e.preventDefault();
      const qty = +($('input.qty', form) || { value: 1 }).value || 1;
      if (e.submitter && e.submitter.name === 'ph_buy_now') { buyNow(vid(), qty); return; }
      addToCart(vid(), qty, mi, $('.dname') ? $('.dname').textContent : '', addBtn);
    });
    const swap = src => { if (!mi || !src || mi.src === src) return; mi.style.opacity = 0; setTimeout(() => { mi.src = src; mi.style.opacity = ''; }, 200); };
    if (window.jQuery) {
      jQuery(form).on('show_variation', (ev, v) => { if (buy) buy.disabled = !v.is_purchasable || !v.is_in_stock; if (v.image && v.image.full_src) swap(v.image.full_src); });
      jQuery(form).on('hide_variation reset_data', () => { if (buy) buy.disabled = true; swap(orig); });
    }
  }
  $$('.minis button[data-full]').forEach((b, i) => {
    if (!i) b.classList.add('on');
    b.onclick = () => { const m = $('#mainImg'); m.style.opacity = 0; setTimeout(() => { m.src = b.dataset.full; m.style.opacity = ''; }, 200); $$('.minis button').forEach(x => x.classList.toggle('on', x === b)); };
  });
  const sbar = $('#sbar'), bookEl = $('.book');
  if (sbar && bookEl) {
    const sio = new IntersectionObserver(es => es.forEach(e => sbar.classList.toggle('on', !e.isIntersecting && e.boundingClientRect.top < 0)), { threshold: 0 }); sio.observe(bookEl); pg.off.push(() => sio.disconnect());
    $('#sbAdd').onclick = () => { const b = $('.single_add_to_cart_button'); if (form && form.classList.contains('variations_form')) smoothTo(bookEl); else if (b) b.click(); };
    $('#sbBuy').onclick = () => { const b = $('#buyNow'); if (form && form.classList.contains('variations_form')) smoothTo(bookEl); else if (b) b.click(); };
  }
}

/* ---------- per-page setup (runs on load and after every instant page change) ---------- */
let pg = { t: [], i: [], off: [] };
const pT = (f, ms) => { const id = setTimeout(f, ms); pg.t.push(id); return id; };
const pI = (f, ms) => { const id = setInterval(f, ms); pg.i.push(id); return id; };
const pOn = (el, ev, f, o) => { el.addEventListener(ev, f, o); pg.off.push(() => el.removeEventListener(ev, f, o)); };
function teardown() { pg.t.forEach(clearTimeout); pg.i.forEach(clearInterval); pg.off.forEach(f => f()); pg = { t: [], i: [], off: [] }; }
function initPage(root) {
  hero = $('#hero'); inner = !hero; onScroll();
  if (root !== document) flipArrows(root);
  $$('.sec-h h2, .band h2, .promo h3, #giant', root).forEach(split);
  $$('.sec-h p, .sec-h .see, .sec-h .arrows, .chips, .band p, .band .btn, .promo p, .promo .wbtn', root).forEach(el => { el.setAttribute('data-rv', ''); el.style.setProperty('--d', '150ms'); });
  watch(root);
  const rvs = $$('.rv', root);
  requestAnimationFrame(() => rvs.forEach((x, i) => { x.style.setProperty('--d', (150 + i * 70) + 'ms'); x.classList.add('go'); }));
  marq = $('#marqT'); mx = 0;
  if (marq) {
    let words = ['House of Pottery'];
    try { words = JSON.parse($('#marq').dataset.words); } catch (e) {}
    const star = '<svg class="st" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.6 6.5 3.5 9.4 10 10-6.5.6-9.4 3.5-10 10-.6-6.5-3.5-9.4-10-10 6.5-.6 9.4-3.5 10-10z"/></svg>';
    const half = '<div class="it">' + words.concat(words).map((t, i) => '<span class="' + (i % 2 ? 'o' : '') + '">' + esc(t) + '</span>' + star).join('') + '</div>';
    marq.innerHTML = half + half;
  }
  pars = $$('[data-par]');
  if (hero) initHome();
  initProduct();
  const side = $('#side'); sheetDrag(side, '(max-width:1000px)');
  $('#openFilters') && ($('#openFilters').onclick = () => show(side));
  $('#sideDone') && ($('#sideDone').onclick = closeAll);
  syncHearts();
  document.documentElement.classList.remove('dock-hide'); // every new page starts with the dock showing
  setDock();
}
/* phone dock: the glass blob slides under the current section */
function setDock(key) {
  const dock = $('#dock'); if (!dock) return;
  const slash = x => x.replace(/\/*$/, '/'), p = slash(location.pathname), base = slash(C.base || '/');
  const pathOf = a => { try { return slash(new URL(a.href).pathname); } catch (e) { return ''; } };
  if (!key) {
    const acc = $('[data-dk="account"]', dock), shop = $('[data-dk="shop"]', dock);
    const hm = $('[data-dk="home"]', dock);
    if (p === base || (hm && p === pathOf(hm))) key = 'home';
    else if (acc && p.startsWith(pathOf(acc))) key = 'account';
    else if ((shop && p.startsWith(pathOf(shop))) || /\/product(-category|-tag)?\//.test(p)) key = 'shop';
  }
  const on = key && $('[data-dk="' + key + '"]', dock), blob = $('.dk-blob', dock);
  $$('[data-dk]', dock).forEach(x => x.classList.toggle('on', x === on));
  if (!blob) return;
  if (!on) { blob.style.opacity = 0; return; }
  blob.style.width = on.offsetWidth + 'px'; blob.style.transform = 'translateX(' + on.offsetLeft + 'px)'; blob.style.opacity = 1;
}
document.addEventListener('pointerdown', e => { const it = e.target.closest('#dock [data-dk]'); if (it && it.tagName === 'A') setDock(it.dataset.dk); });
window.addEventListener('resize', () => setDock(($('#dock .on') || {}).dataset ? $('#dock .on').dataset.dk : ''));
/* dock hides while scrolling down, comes back on the way up (and at the top/bottom of the page) */
(() => {
  let lastY = scrollY, acc = 0, tick = false;
  const set = h => { const r = document.documentElement; if (r.classList.contains('dock-hide') === h) return; r.classList.toggle('dock-hide', h); };
  addEventListener('scroll', () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      tick = false;
      const y = scrollY, d = y - lastY; lastY = y;
      if (y < 80 || y + innerHeight > document.documentElement.scrollHeight - 40) { acc = 0; set(false); return; }
      acc = (acc > 0) === (d > 0) ? acc + d : d; // distance travelled in the current direction
      if (acc > 24) set(true); else if (acc < -14) set(false);
    });
  }, { passive: true });
})();
/* bottom sheets close when pulled down; the content still scrolls normally */
function sheetDrag(el, mq) {
  if (!el || el.dataset.drag) return; el.dataset.drag = 1;
  let y0 = 0, x0 = 0, dy = 0, t0 = 0, on = false, sc = null;
  el.addEventListener('touchstart', e => {
    if (!matchMedia(mq).matches || !el.classList.contains('on') || e.touches.length > 1) return;
    sc = e.target.closest('.dbody') || (el.scrollHeight > el.clientHeight + 2 ? el : null);
    y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; dy = 0; t0 = performance.now(); on = null;
  }, { passive: true });
  el.addEventListener('touchmove', e => {
    if (on === false || !matchMedia(mq).matches || !el.classList.contains('on')) return;
    const d = e.touches[0].clientY - y0;
    if (on === null) {
      if (Math.abs(d) < 6) return;
      on = d > 0 && Math.abs(d) > Math.abs(e.touches[0].clientX - x0) && (!sc || sc.scrollTop <= 0); // pull down from the top only
      if (!on) return;
      el.style.transition = 'none';
    }
    dy = Math.max(0, d); if (e.cancelable) e.preventDefault();
    el.style.transform = 'translateY(' + dy + 'px)';
  }, { passive: false });
  const end = () => {
    if (!on) { on = false; return; }
    const fast = dy / Math.max(1, performance.now() - t0) > .5;
    el.style.transition = ''; el.style.transform = '';
    if (dy > Math.min(140, el.offsetHeight * .28) || (fast && dy > 40)) closeAll();
    on = false; dy = 0;
  };
  el.addEventListener('touchend', end); el.addEventListener('touchcancel', end);
}
sheetDrag(drawer, '(max-width:640px)');
initPage(document);


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
  const urls = hero ? $$('#bBig .im[data-first]').map(x => x.style.backgroundImage.slice(5, -2).replace(/^"|"$/g, '')) : []; // only the first photo: short preloader
  let done = 0; const total = urls.length + 1;
  urls.forEach(u => { const i = new Image(); i.onload = i.onerror = () => done++; i.src = u; });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => done++);
  requestAnimationFrame(() => pre.classList.add('go'));
  const t0 = performance.now(); let shown = 0, fin = false;
  (function tick(now) {
    const el = now - t0, goal = Math.max(Math.min(done / total, el / 700, 1), el > 1800 ? 1 : 0);
    shown += (goal - shown) * .18; if (goal >= 1 && shown > .995) shown = 1;
    $('#preBar').style.transform = 'scaleX(' + shown + ')'; $('#preF').style.setProperty('--a', (shown * 360) + 'deg');
    if (shown < 1) return requestAnimationFrame(tick);
    if (fin) return; fin = true;
    setTimeout(() => { pre.classList.add('out'); document.documentElement.style.overflow = ''; if (lenis && !open.size) lenis.start(); setTimeout(intro, 250); setTimeout(() => pre.remove(), 900); }, 80);
  })(t0);
}

/* sort dropdown: close when clicking elsewhere */
document.addEventListener('click', e => { $$('details.sort[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; }); });

/* cart page: rows disappear instantly when removed */
document.addEventListener('click', e => { const r = e.target.closest('.woocommerce-cart-form .product-remove > a'); if (r) { const row = r.closest('.cart_item'); if (row) row.classList.add('gone'); } });
/* cart page: totals update as soon as a quantity changes (no "Update cart" click) */
let cartT;
document.addEventListener('change', e => {
  if (!e.target.matches || !e.target.matches('.woocommerce-cart-form input.qty')) return;
  clearTimeout(cartT); cartT = setTimeout(() => { const b = $('.woocommerce-cart-form [name="update_cart"]'); if (b) { b.disabled = false; b.click(); } }, 350);
});

/* ---------- checkout: the theme's own script (works when the page opens without a reload) ---------- */
const coForm = () => $('form.checkout.ph-co');
const money = v => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function coInstant(sel) {
  const f = coForm(); if (!f || !sel.value) return;
  let ship = null; try { ship = JSON.parse(f.dataset.ship || 'null'); } catch (e) {}
  if (!ship) return;
  const cost = sel.value in ship.s ? ship.s[sel.value] : ship.def; if (cost == null) return;
  const num = el => el ? parseFloat(el.textContent.replace(/[^\d.]/g, '')) || 0 : 0;
  const setNum = (el, v) => { if (!el) return; const b = el.querySelector('bdi') || el; b.innerHTML = b.innerHTML.replace(/[\d,]+(\.\d+)?/, money(v)); };
  const shipEl = $('.co-totals .woocommerce-shipping-totals td .amount'), totEl = $('.co-totals .order-total td .amount');
  if (!shipEl || !totEl) return;
  const total = num(totEl) - num(shipEl) + cost;
  setNum(shipEl, cost); setNum(totEl, total);
  const btn = $('#place_order'); if (btn) btn.innerHTML = btn.innerHTML.replace(/[\d,]+\.\d{2}/, money(total));
}
let coReq = 0, coT;
function coRefresh() { // totals confirmed by the store
  const f = coForm(); if (!f || !C.ajax || !f.dataset.uor) return;
  const id = ++coReq, el = f.elements, v = n => (el[n] && el[n].value) || '';
  const pm = f.querySelector('[name="payment_method"]:checked');
  const body = new URLSearchParams({ security: f.dataset.uor, payment_method: pm ? pm.value : '', country: v('billing_country') || 'EG', state: v('billing_state'), postcode: '', city: '', address: v('billing_address_1'), address_2: '', s_country: v('billing_country') || 'EG', s_state: v('billing_state'), s_postcode: '', s_city: '', s_address: v('billing_address_1'), s_address_2: '', has_full_address: 'true', post_data: new URLSearchParams(new FormData(f)).toString() });
  fetch(ep('update_order_review'), { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }).then(r => r.json()).then(d => {
    if (id !== coReq || !d) return;
    if (d.reload) { location.reload(); return; }
    if (d.fragments) Object.keys(d.fragments).forEach(k => $$(k).forEach(x => { x.outerHTML = d.fragments[k]; }));
    if (C.ar) flipArrows($('.ph-co-side'));
  }).catch(() => {});
}
document.addEventListener('change', e => {
  if (!e.target.matches || !e.target.matches('form.ph-co #billing_state, form.ph-co [name="payment_method"]')) return;
  if (e.target.id === 'billing_state') coInstant(e.target);
  clearTimeout(coT); coT = setTimeout(coRefresh, 120);
});
async function coCoupon(code, remove) {
  const f = coForm(); if (!f) return;
  const r = await fetch(ep(remove ? 'remove_coupon' : 'apply_coupon'), { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(remove ? { security: f.dataset.rcoupon, coupon: code } : { security: f.dataset.coupon, coupon_code: code }) });
  const box = document.createElement('div'); box.innerHTML = await r.text();
  const msg = box.textContent.trim(); if (msg) toast(msg);
  coRefresh();
  return !box.querySelector('.woocommerce-error,[role="alert"].is-error,.wc-block-components-notice-banner.is-error');
}
document.addEventListener('click', e => {
  const ap = e.target.closest('#phCouponApply'), rm = e.target.closest('form.ph-co .woocommerce-remove-coupon');
  if (ap) {
    e.preventDefault(); const inp = $('#phCoupon'); const code = inp && inp.value.trim(); if (!code) { inp && inp.focus(); return; }
    ap.classList.add('loading'); coCoupon(code).then(ok => { if (ok) inp.value = ''; }).catch(() => toast(T('error'))).finally(() => ap.classList.remove('loading'));
  }
  if (rm) { e.preventDefault(); coCoupon(rm.dataset.coupon, true).catch(() => toast(T('error'))); }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'phCoupon') { e.preventDefault(); const b = $('#phCouponApply'); if (b) b.click(); } });

/* ---------- instant pages: every link, button and form opens without a page reload ----------
   Pages are fetched while a link is on screen, under the pointer or under a finger, so a tap
   swaps the content at once. Forms (cart, checkout, account) are sent in the background and the
   answer is shown in place. Only another language or another site loads normally. */
(() => {
  if (!$('#ph-main') || !window.fetch || !window.DOMParser || !history.pushState) return;
  const base = C.base || '/', dynP = C.dyn || [];
  const strip = p => p.indexOf(base + 'ar/') === 0 ? base + p.slice(base.length + 3) : (p === base + 'ar' ? base : p);
  const isAr = p => p.indexOf(base + 'ar/') === 0 || p === base + 'ar';
  const skip = /[?&](add-to-cart|ph_buy_now|wc-ajax|customer-logout|preview|ph_sub|ph_sent|download_file)=|\/wp-(admin|login|json|content|includes)|\.(php|xml|pdf|jpe?g|png|gif|webp|avif|svg|zip|txt)$|\/feed\/?$/i;
  const unsafe = /[?&](remove_item|undo_item|remove_coupon|_wpnonce|order_again|cancel_order|action)=/i; // never fetched ahead of a tap
  const isDyn = u => { const p = strip(u.pathname); return dynP.some(f => p.indexOf(f) === 0); };
  function allowed(u) {
    if (u.origin !== location.origin || skip.test(u.pathname + u.search)) return false;
    return !!isAr(u.pathname) === !!C.ar; // other language: full load (texts & direction change)
  }
  function linkUrl(a) {
    if (!a || a.target && a.target !== '_self' || a.hasAttribute('download') || a.hasAttribute('data-no-instant') || /\bexternal\b/.test(a.rel) || a.closest('#wpadminbar')) return null;
    let u; try { u = new URL(a.href, location.href); } catch (e) { return null; }
    if (u.protocol !== location.protocol || !allowed(u)) return null;
    if (u.hash && u.pathname === location.pathname && u.search === location.search) return null; // same-page anchor
    return u;
  }

  /* fetched pages, kept briefly so a tap shows them at once */
  const cache = new Map();
  dropPages = () => { for (const [k] of cache) if (isDyn(new URL(k))) cache.delete(k); };
  function get(url, maxAge) {
    const k = url.split('#')[0], c = cache.get(k), u = new URL(k);
    const age = isDyn(u) ? Math.min(maxAge || 8000, 8000) : (maxAge || 60000);
    if (c && Date.now() - c.t < age) return c.p;
    const p = fetch(k, { credentials: 'same-origin', headers: { 'X-PH-Instant': '1' } }).then(r => {
      if (r.status >= 500 || !/text\/html/.test(r.headers.get('content-type') || '')) throw new Error('skip');
      return r.text().then(html => ({ url: r.url || k, html }));
    });
    p.catch(() => cache.delete(k));
    if (!unsafe.test(u.search)) { cache.set(k, { t: Date.now(), p }); if (cache.size > 60) cache.delete(cache.keys().next().value); }
    return p;
  }
  const warmU = u => { if (u && !unsafe.test(u.search)) get(u.href).catch(() => {}); };
  const warm = a => warmU(linkUrl(a));
  let hov = null;
  document.addEventListener('pointerover', e => {
    const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    clearTimeout(hov); hov = setTimeout(() => warm(a), e.pointerType === 'mouse' ? 50 : 0);
  }, { passive: true });
  document.addEventListener('pointerout', () => clearTimeout(hov), { passive: true });
  document.addEventListener('touchstart', e => warm(e.target.closest && e.target.closest('a[href]')), { passive: true });
  document.addEventListener('focusin', e => warm(e.target.closest && e.target.closest('a[href]')));
  document.addEventListener('pointerdown', e => warm(e.target.closest && e.target.closest('a[href]')), { passive: true });
  /* links on screen are fetched quietly in the background (a few at a time), so taps feel instant on phones too */
  const conn = navigator.connection || {}, slow = conn.saveData || /(^|-)2g/.test(conn.effectiveType || '');
  let queue = [], busy = 0, budget = 0;
  const pump = () => {
    while (busy < 2 && queue.length && budget > 0) {
      const u = queue.shift(); if (cache.has(u.href.split('#')[0])) continue;
      busy++; budget--; get(u.href).catch(() => {}).finally(() => { busy--; setTimeout(pump, 60); });
    }
  };
  const vio = 'IntersectionObserver' in window && !slow ? new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; vio.unobserve(e.target);
    const u = linkUrl(e.target); if (u && !isDyn(u) && !unsafe.test(u.search)) { queue.push(u); (window.requestIdleCallback || (f => setTimeout(f, 300)))(pump); }
  }), { rootMargin: '120px' }) : null;
  function watchLinks() {
    if (!vio) return; vio.disconnect(); budget = 14; queue = [];
    $$('#ph-main a[href], #nav a[href]').forEach(a => vio.observe(a));
  }

  /* stylesheets the new page needs that this one has not loaded yet */
  const key = u => (u || '').split('?')[0];
  function addStyles(doc) {
    const have = new Set($$('link[rel="stylesheet"]').map(l => key(l.href))), waits = [];
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
      if (have.has(key(l.href))) return;
      const n = document.createElement('link'); n.rel = 'stylesheet'; n.href = l.href; if (l.media) n.media = l.media; if (l.id) n.id = l.id;
      waits.push(new Promise(r => { n.onload = n.onerror = r; setTimeout(r, 1200); }));
      document.head.appendChild(n);
    });
    doc.querySelectorAll('head style[id]').forEach(st => { if (!document.getElementById(st.id)) document.head.appendChild(st.cloneNode(true)); });
    return Promise.all(waits);
  }
  /* Scripts. Every page loads the same core set (WordPress, WooCommerce, the theme, analytics) —
     sometimes one by one, sometimes inside a caching plugin's combined file — so those are never
     loaded twice. A plugin script only some pages use (e.g. on cart or checkout) is loaded once,
     the first time a page that needs it opens. */
  const common = /\/wp-includes\/js\/|\/woocommerce\/assets\/js\/(jquery-blockui|js-cookie|sourcebuster|frontend\/(add-to-cart|woocommerce|single-product|order-attribution|cart-fragments))|\/pixelyoursite\/|\/themes\/potteryhub\/|\/lenis|brikpanel-pulse|\/wp-content\/litespeed\/|connect\.facebook|googletagmanager|google-analytics|clarity\.ms|tiktok|snap/;
  const srcOf = x => { const a = x.getAttribute('src') || x.getAttribute('data-src') || ''; return a && !/^(blob|data):/.test(a) ? key(new URL(a, location.href).href) : ''; };
  const loaded = new Set();
  const seen = () => { $$('script').forEach(x => { const u = srcOf(x); if (u) loaded.add(u); }); };
  async function addScripts(doc) {
    seen();
    for (const x of doc.querySelectorAll('script')) {
      if (x.closest('#ph-main')) continue;
      const u = srcOf(x); if (!u || loaded.has(u) || common.test(u)) continue;
      loaded.add(u);
      const h = (x.id || '').replace(/-js$/, '');
      ['-js-extra', '-js-before'].forEach(sfx => { const i = h && doc.getElementById(h + sfx); if (i && !document.getElementById(h + sfx)) { const n = document.createElement('script'); n.id = h + sfx; n.textContent = i.textContent; document.body.appendChild(n); } });
      await new Promise(r => { const n = document.createElement('script'); n.src = x.getAttribute('src') || x.getAttribute('data-src'); n.async = false; n.onload = n.onerror = r; document.body.appendChild(n); setTimeout(r, 4000); });
      const af = h && doc.getElementById(h + '-js-after'); if (af && !document.getElementById(h + '-js-after')) { const n = document.createElement('script'); n.id = h + '-js-after'; n.textContent = af.textContent; document.body.appendChild(n); }
    }
  }
  function addTemplates(doc) { doc.querySelectorAll('script[type="text/template"][id]').forEach(t => { if (!document.getElementById(t.id)) document.body.appendChild(t.cloneNode(true)); }); }
  function swapHead(doc) {
    document.title = doc.title;
    const sel = 'meta[name="description"],meta[name="robots"],link[rel="canonical"],link[rel="alternate"][hreflang],link[rel="prev"],link[rel="next"],meta[property^="og:"],meta[property^="article:"],meta[property^="product:"],meta[name^="twitter:"],script[type="application/ld+json"]';
    $$(sel, document.head).forEach(n => n.remove());
    doc.head.querySelectorAll(sel).forEach(n => document.head.appendChild(n.cloneNode(true)));
  }
  const refreshBag = () => { if (C.ajax) post('get_refreshed_fragments', {}).then(r => applyFragments(r && r.fragments, true)).catch(() => {}); };

  let navId = 0;
  /* opts: { push, y, post: FormData } */
  async function go(url, opts) {
    opts = opts || {};
    const id = ++navId, to = new URL(url, location.href);
    closeAll();
    let d;
    try {
      if (opts.post) {
        const r = await fetch(to.href, { method: 'POST', body: opts.post, credentials: 'same-origin', headers: { 'X-PH-Instant': '1' } });
        if (r.status >= 500 || !/text\/html/.test(r.headers.get('content-type') || '')) throw new Error('skip');
        d = { url: r.url || to.href, html: await r.text() };
        dropPages();
      } else d = await get(to.href, opts.push ? 60000 : 600000);
    } catch (e) { if (opts.post) { opts.fallback && opts.fallback(); return; } location.href = to.href; return; }
    if (id !== navId) return;
    const fin = new URL(d.url, location.href); if (!opts.post || fin.href.split('#')[0] !== to.href.split('#')[0]) fin.hash = to.hash;
    if (!allowed(fin)) { location.href = fin.href; return; }
    const doc = new DOMParser().parseFromString(d.html, 'text/html'), nm = doc.getElementById('ph-main');
    if (!nm || doc.documentElement.lang !== document.documentElement.lang) {
      if (opts.post) { opts.fallback && opts.fallback(); return; }
      location.href = fin.href; return;
    }
    await addStyles(doc);
    if (id !== navId) return;
    const from = location.href, samePage = fin.href.split('#')[0] === from.split('#')[0];
    if (opts.push || opts.post) {
      history.replaceState(Object.assign({}, history.state, { ph: 1, y: scrollY }), '');
      if (samePage) history.replaceState({ ph: 1, y: 0 }, '', fin.href); else history.pushState({ ph: 1, y: 0 }, '', fin.href);
    }
    const keepY = samePage ? scrollY : null;
    const swap = () => {
      teardown();
      const cur = $('#ph-main');
      cur.replaceWith(document.adoptNode(nm));
      $$('script', nm).forEach(x => { const t = (x.getAttribute('type') || '').toLowerCase(); if (x.src || !(t === '' || t === 'text/javascript' || t === 'application/javascript' || t === 'litespeed/javascript')) return; const n = document.createElement('script'); n.textContent = x.textContent; if (x.id) n.id = x.id; x.replaceWith(n); });
      addTemplates(doc);
      body.className = doc.body.className;
      swapHead(doc);
      const nc = doc.querySelector('#nav nav.c'), oc = $('#nav nav.c'); if (nc && oc) oc.innerHTML = nc.innerHTML;
      const nl = doc.querySelector('#nav .lang'), ol = $('#nav .lang'); if (nl && ol) ol.href = nl.getAttribute('href');
      const nmn = doc.querySelector('#menu .mn-body'), omn = $('#menu .mn-body'); if (nmn && omn) omn.innerHTML = nmn.innerHTML;
      const nml = doc.querySelector('#menu .mn-lang'), oml = $('#menu .mn-lang'); if (nml && oml) oml.href = nml.getAttribute('href');
      const nab = doc.getElementById('wpadminbar'), oab = $('#wpadminbar'); if (nab && oab) oab.replaceWith(document.adoptNode(nab));
      const err = $('#ph-main .woocommerce-error, #ph-main .woocommerce-NoticeGroup-checkout, #ph-main .wc-block-components-notice-banner.is-error');
      const tgt = fin.hash.length > 1 && document.getElementById(decodeURIComponent(fin.hash.slice(1)));
      const top = err ? Math.max(0, err.getBoundingClientRect().top + scrollY - 120) : tgt ? tgt.getBoundingClientRect().top + scrollY - 90 : keepY != null ? keepY : (opts.y || 0);
      if (lenis) { lenis.resize && lenis.resize(); lenis.scrollTo(top, { immediate: true, force: true }); } else scrollTo(0, top);
      initPage($('#ph-main'));
      nav.classList.remove('pre');
      if (hero && hero.startIntro) hero.startIntro();
    };
    if (document.startViewTransition && !reduce && !opts.post) await document.startViewTransition(swap).updateCallbackDone.catch(() => {}); else swap();
    if (!isDyn(new URL(from))) get(from, 600000).catch(() => {}); // keep the page we left, so Back is instant too
    watchLinks();
    await addScripts(doc);
    if (opts.post || /order-received/.test(fin.pathname)) refreshBag();
    if (window.jQuery) {
      const jq = window.jQuery, main = $('#ph-main');
      if (jq.fn.wc_variation_form) jq('.variations_form', main).each(function () { jq(this).wc_variation_form(); });
      jq('.wc-tabs-wrapper, .woocommerce-tabs, #rating', main).trigger('init');
      jq(document.body).trigger('ph:page');
    }
    document.dispatchEvent(new CustomEvent('ph:page', { detail: { url: location.href } }));
    try { if (window.fbq) fbq('track', 'PageView'); if (window.gtag) gtag('event', 'page_view', { page_location: location.href, page_title: document.title }); } catch (e) {}
  }
  instantGo = (url, push) => go(url, { push: push !== false });

  history.scrollRestoration = 'manual';
  history.replaceState(Object.assign({}, history.state, { ph: 1 }), '');
  // the page we start on: kept so coming Back to it is instant
  (window.requestIdleCallback || (f => setTimeout(f, 2000)))(() => { if (!isDyn(new URL(location.href))) get(location.href, 600000).catch(() => {}); watchLinks(); });
  addEventListener('popstate', e => {
    const u = new URL(location.href);
    if (!e.state || !e.state.ph || !allowed(u)) { location.reload(); return; }
    go(u.href, { y: e.state.y || 0 });
  });
  /* shop pages: only the products change (no page swap, no jump to the top of the page) */
  let pgId = 0;
  document.addEventListener('click', async e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('.pager a[href]'), grid = $('#ph-main .shop-grid'), u = linkUrl(a);
    if (!u || !grid) return;
    e.preventDefault();
    const id = ++pgId, tool = $('#ph-main .tool') || grid;
    grid.classList.add('pg-busy');
    smoothTo(tool);
    let d; try { d = await get(u.href); } catch (er) { location.href = u.href; return; }
    if (id !== pgId) return;
    const doc = new DOMParser().parseFromString(d.html, 'text/html'), ng = doc.querySelector('#ph-main .shop-grid');
    if (!ng) { go(u.href, { push: true }); return; }
    history.replaceState(Object.assign({}, history.state, { ph: 1, y: scrollY }), '');
    history.pushState({ ph: 1, y: tool.getBoundingClientRect().top + scrollY - 90 }, '', d.url || u.href);
    const op = $('#ph-main .pager'), np = doc.querySelector('#ph-main .pager');
    grid.replaceWith(document.adoptNode(ng));
    if (op && np) op.replaceWith(document.adoptNode(np)); else if (op) op.remove();
    const oc = $('#ph-main .tool .count'), nc = doc.querySelector('#ph-main .tool .count'); if (oc && nc) oc.innerHTML = nc.innerHTML;
    if (doc.title) document.title = doc.title;
    flipArrows($('#ph-main .pager') || ng); watch(ng); watchLinks();
    if (lenis && lenis.resize) lenis.resize();
    const nx = $('#ph-main .pager a[rel="next"]'); if (nx) warmU(new URL(nx.href)); // the page after is ready before the next tap
    document.dispatchEvent(new CustomEvent('ph:page', { detail: { url: location.href } }));
  });
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href]'), u = linkUrl(a); if (!u) return;
    e.preventDefault();
    if (u.href === location.href && !unsafe.test(u.search)) { closeAll(); return; }
    go(u.href, { push: true });
  });
  /* forms: search & filters (GET) open the same way; cart, checkout, login & account forms (POST) are sent in the background */
  document.addEventListener('submit', e => {
    const f = e.target;
    if (e.defaultPrevented || f.hasAttribute('data-no-instant') || (f.getAttribute('target') || '_self') !== '_self') return;
    const method = (f.getAttribute('method') || 'get').toLowerCase();
    let u; try { u = new URL(f.getAttribute('action') || location.href, location.href); } catch (x) { return; }
    if (method === 'get') {
      const q = new URLSearchParams(); new FormData(f).forEach((v, k) => { if (typeof v === 'string') q.append(k, v); });
      u.search = q.toString();
      if (!allowed(u)) return;
      e.preventDefault(); go(u.href, { push: true });
      return;
    }
    if (method !== 'post' || !allowed(u) || f.dataset.busy) { if (f.dataset.busy) e.preventDefault(); return; }
    e.preventDefault();
    const fd = new FormData(f), s = e.submitter;
    if (s && s.name && !fd.has(s.name)) fd.append(s.name, s.value || '');
    f.dataset.busy = 1; f.classList.add('is-busy');
    const done = () => { delete f.dataset.busy; f.classList.remove('is-busy'); };
    // if anything goes wrong, send the form the normal way
    go(u.href, { post: fd, fallback: () => {
      done();
      if (s && s.name) { const h = document.createElement('input'); h.type = 'hidden'; h.name = s.name; h.value = s.value || ''; f.appendChild(h); }
      HTMLFormElement.prototype.submit.call(f);
    } }).then(done, done);
  });
})();

})();
