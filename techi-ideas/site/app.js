/* Techi storefront v3 — bilingual, mesh background, custom icons */
(function(){
"use strict";
const WA_NUMBER="201000000000"; // TODO: رقم واتساب الشركة بصيغة دولية من غير +
const P=window.TECHI_PRODUCTS||[], I18N=window.TECHI_I18N;
const byId=Object.fromEntries(P.map(p=>[p.id,p]));
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const hasGsap=!!window.gsap;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
if(hasGsap){gsap.registerPlugin(ScrollTrigger);if(window.Flip)gsap.registerPlugin(Flip);}

/* ---------- language ---------- */
let LANG=(()=>{try{return localStorage.getItem("techi-lang")||"ar";}catch(e){return "ar";}})();
const t=k=>I18N[LANG][k];
const isEn=()=>LANG==="en";
const dirSign=()=>isEn()?-1:1;
const nm=p=>isEn()?p.en:p.ar, vr=p=>isEn()?p.variantEn:p.variant, pt=p=>isEn()?p.pitchEn:p.pitch;
const ft=p=>isEn()?p.featEn:p.feat, its=p=>isEn()?p.itemsEn:p.items, sp=p=>isEn()?p.specsEn:p.specs;
function applyLang(){
  const h=document.documentElement;h.lang=LANG;h.dir=isEn()?"ltr":"rtl";window.TECHI_LANG=LANG;
  $$("[data-t]").forEach(el=>{el.textContent=t(el.dataset.t);});
  $("#langBtn").textContent=t("lang");$("#langBtn").setAttribute("aria-label",t("lang_label"));
  $$("[data-cat-link]").forEach(a=>a.textContent=t("cats")[a.dataset.catLink]);
  if(window.TechiHome&&TechiHome.setLang)TechiHome.setLang(LANG);
  renderCart();
}

/* ---------- constants ---------- */
const CAT_IMG={screens:231759,switches:231686,security:231855,voice:231737,bundles:231792};
const D3MAP={light_living:231840,light_kitchen:231840,light_bedroom:231840,curtain_living:231686,curtain_bed:231711,ac:231783,socket:231689,hub:231933,echo:231737,panel:231759,lock:231855,motion:231925,gas:231916,valve:231940};
const GHOST={231855:"LOCK",231759:"PANEL",231737:"ECHO",231916:"GAS",231689:"SOCKET",231686:"CURTAIN",231925:"MOTION",231940:"VALVE"};
const SHOP=P.filter(p=>p.cat!=="bundles").concat(P.filter(p=>p.cat==="bundles"));
const fmt=n=>n.toLocaleString("en-US");
const money=n=>`${fmt(n)}<span class="cur-l">${t("cur")}</span>`;
const off=p=>p.reg>p.sale?Math.round((1-p.sale/p.reg)*100):0;
const src=f=>(window.TECHI_IMG&&window.TECHI_IMG[f])||"img/"+f;
const img=(p,i=0)=>src(p.imgs[i]||p.imgs[0]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pad=n=>String(n).padStart(2,"0");
const waLink=s=>`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(s)}`;
const btxt=s=>`<span class="bt"><span>${s}</span><span>${s}</span></span>`;
const catLink=k=>k==="bundles"?"#bundles":"#shop-"+k;

/* ---------- icon set: 24px grid, 1.5 stroke, drawn for Techi ---------- */
const ic=(d,extra="")=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const ICON={
  plus:ic('<path d="M12 6v12M6 12h12"/>'),
  check:ic('<path d="M6 12.5l4 4L18 8"/>'),
  arrow:ic('<path d="M5 12h14M13 6l6 6-6 6"/>','data-flip'),
  diag:ic('<path d="M7 17L17 7M9 7h8v8"/>','data-flip'),
  bag:ic('<path d="M5.5 8.5h13l-1 10.2a1.5 1.5 0 0 1-1.5 1.3H8a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M9 11V7a3 3 0 0 1 6 0v4"/>'),
  sun:ic('<circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>'),
  moon:ic('<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>'),
  target:ic('<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'),
  house:ic('<path d="M4 10.5L12 4l8 6.5"/><path d="M6 9v10h12V9"/><path d="M10 19v-5h4v5"/>'),
  sleep:ic('<path d="M15.5 4.5a7 7 0 1 0 4 11.6A6 6 0 0 1 15.5 4.5z"/><path d="M15 9h3l-3 3h3"/>'),
  away:ic('<path d="M13 4H6v16h7"/><path d="M10 12h10M17 9l3 3-3 3"/>'),
  arrive:ic('<path d="M4 10.5L12 4l8 6.5V19H4z"/><path d="M8 14h7M12.5 11.5L15 14l-2.5 2.5"/>'),
  screen:ic('<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M7 9h4M7 12h6M15.5 9.5v3"/><path d="M9 20h6"/>'),
  switch:ic('<rect x="6" y="3" width="12" height="18" rx="2.5"/><circle cx="12" cy="8" r="1.6"/><circle cx="12" cy="12.5" r="1.6"/><circle cx="12" cy="17" r="1.1"/>'),
  shield:ic('<path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6z"/><rect x="9.5" y="11" width="5" height="4" rx="1"/><path d="M10.5 11V9.8a1.5 1.5 0 0 1 3 0V11"/>'),
  voice:ic('<circle cx="12" cy="12" r="8"/><path d="M10.5 10v4M12.5 8.5v7M14.5 10.5v3"/>'),
  stack:ic('<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4M4 16l8 4 8-4"/>'),
  wa:'<svg class="ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
  install:ic('<path d="M14.5 6.5a3.5 3.5 0 0 0 4.6 4.6l-8.4 8.4a2 2 0 0 1-2.8-2.8z"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>'),
  pin:ic('<path d="M12 21s6-5.5 6-11a6 6 0 0 0-12 0c0 5.5 6 11 6 11z"/><circle cx="12" cy="10" r="2"/>'),
  app:ic('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/><path d="M10 9l2-2 2 2M12 7v6"/>'),
  bolt:ic('<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>'),
};
const CAT_IC={screens:ICON.screen,switches:ICON.switch,security:ICON.shield,voice:ICON.voice,bundles:ICON.stack};

/* ---------- background mesh choreography ---------- */
const BGM=window.TechiBG;
function bgTo(v,d=1.6){if(!BGM)return;if(hasGsap&&!reduce)gsap.to(BGM,Object.assign({duration:d,ease:"expo.inOut",overwrite:"auto"},v));else Object.assign(BGM,v);}
function bgPlace(x,y,s,opts={}){if(!BGM)return;const hw=BGM.halfWidth();
  const target={x:x*hw,y:y*hw*innerHeight/innerWidth,z:0};
  if(hasGsap&&!reduce){gsap.to(BGM.g.position,Object.assign({},target,{duration:opts.d||1.8,ease:"expo.inOut",overwrite:"auto"}));gsap.to(BGM.g.scale,{x:s,y:s,z:s,duration:opts.d||1.8,ease:"expo.inOut",overwrite:"auto"});}
  else{BGM.g.position.set(target.x,target.y,0);BGM.g.scale.setScalar(s);}}

/* ================= cart ================= */
const store={get(){try{return JSON.parse(localStorage.getItem("techi-cart")||"[]");}catch(e){return [];}},set(v){try{localStorage.setItem("techi-cart",JSON.stringify(v));}catch(e){}}};
let cart=store.get().filter(i=>byId[i.id]);
function saveCart(){store.set(cart);renderCart();}
function addToCart(id,qty=1,fromEl){
  const it=cart.find(i=>i.id===id);if(it)it.qty+=qty;else cart.push({id,qty});saveCart();
  const p=byId[id];flyToCart(fromEl,p);
  toast(`<small>${t("added_toast")}</small><span>${esc(nm(p))}</span>`,img(p));
  if(hasGsap)gsap.fromTo("#cartCount",{scale:1},{scale:1.5,duration:.2,yoyo:true,repeat:1,ease:"power2.out"});
  if(BGM&&hasGsap&&!reduce)gsap.fromTo(BGM,{spin:6},{spin:1,duration:2,ease:"power3.out"});
}
function cartTotals(){let tt=0,s=0,c=0;cart.forEach(i=>{const p=byId[i.id];tt+=p.sale*i.qty;s+=(p.reg-p.sale)*i.qty;c+=i.qty;});return{tt,s,c};}
function orderText(){const {tt}=cartTotals();return t("order_hi")+"\n"+cart.map(i=>`• ${nm(byId[i.id])} (${vr(byId[i.id])}) × ${i.qty} = ${fmt(byId[i.id].sale*i.qty)} ${t("cur")}`).join("\n")+`\n\n${t("order_total")}: ${fmt(tt)} ${t("cur")}`;}
function renderCart(){
  const {tt,s,c}=cartTotals();$("#cartCount").textContent=c;$("#drawerN").textContent=c?`${pad(c)}`:"";
  const list=$("#cartList"),foot=$("#cartFoot");
  if(!cart.length){list.innerHTML=`<div class="dempty">${ICON.bag}<b>${t("cart_empty")}</b><span>${t("cart_empty_p")}</span><a class="btn btn-white" href="#shop" data-close>${btxt(t("hero_cta1"))}</a></div>`;foot.innerHTML="";return;}
  list.innerHTML=cart.map(i=>{const p=byId[i.id];return `<div class="ci" data-id="${p.id}"><img src="${img(p)}" alt=""><div><h4>${esc(nm(p))}</h4><div class="cv">${esc(vr(p))}</div><div class="q"><button data-q="-1" aria-label="${t("qty_less")}">−</button><span class="num">${i.qty}</span><button data-q="1" aria-label="${t("qty_more")}">+</button><button class="rm" data-rm>${t("remove")}</button></div></div><div class="lp num">${fmt(p.sale*i.qty)}</div></div>`;}).join("");
  foot.innerHTML=`${s?`<div class="r s"><span>${t("saved")}</span><span class="num">${fmt(s)} ${t("cur")}</span></div>`:""}<div class="r t"><span>${t("total")}</span><span class="num">${fmt(tt)} ${t("cur")}</span></div>
   <a class="btn btn-wa" href="${waLink(orderText())}" target="_blank" rel="noopener">${ICON.wa}${btxt(t("order_on_wa"))}</a>
   <details><summary>${t("order_text")}</summary><div class="order-msg">${esc(orderText())}</div></details>`;
}
$("#cartList").addEventListener("click",e=>{
  if(e.target.closest("[data-close]")){closeCart();return;}
  const row=e.target.closest(".ci");if(!row)return;const id=+row.dataset.id;const it=cart.find(i=>i.id===id);
  if(e.target.closest("[data-rm]")){cart=cart.filter(i=>i.id!==id);}else{const q=e.target.closest("[data-q]");if(!q)return;it.qty+= +q.dataset.q;if(it.qty<1)cart=cart.filter(i=>i.id!==id);}saveCart();});
let lenis=null;
function openCart(){$("#drawer").classList.add("on");$("#scrim").classList.add("on");lenis&&lenis.stop();
  if(hasGsap&&!reduce)gsap.from("#cartList>*",{x:-60*dirSign(),opacity:0,stagger:.07,duration:.8,ease:"expo.out",delay:.2});}
function closeCart(){$("#drawer").classList.remove("on");$("#scrim").classList.remove("on");lenis&&lenis.start();}
$("#cartBtn").onclick=openCart;$("#drawerClose").onclick=closeCart;$("#scrim").onclick=closeCart;
addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeMenu();}});
function flyToCart(fromEl,p){
  if(!hasGsap||reduce||!fromEl)return;
  const s=fromEl.closest(".card,.pp,.dev-card,.xp-item,.slide,.suite")?.querySelector("img")||fromEl;
  const a=s.getBoundingClientRect(),b=$("#cartBtn").getBoundingClientRect();
  const f=document.createElement("img");f.src=img(p);f.className="flyimg";const sz=Math.min(a.width,170);
  Object.assign(f.style,{width:sz+"px",height:sz+"px",left:a.left+(a.width-sz)/2+"px",top:a.top+(a.height-sz)/2+"px"});document.body.appendChild(f);
  const dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2);
  gsap.timeline({onComplete:()=>f.remove()}).to(f,{x:dx*.4,y:dy*.4-160,scale:.75,rotation:-14,duration:.5,ease:"power2.out"}).to(f,{x:dx,y:dy,scale:.1,rotation:0,opacity:.3,duration:.5,ease:"power3.in"});
}
function toast(html,image,alert){
  const el=document.createElement("div");el.className="toast"+(alert?" alert":"");
  el.innerHTML=`<div class="ti">${image?`<img src="${image}" alt="">`:alert?"!":`<img src="${src("logo-navy.png")}" alt="">`}</div><div>${html}</div>`;
  $("#toasts").prepend(el);
  if(hasGsap){gsap.from(el,{y:40,opacity:0,duration:.7,ease:"expo.out"});gsap.to(el,{y:20,opacity:0,duration:.5,delay:3.4,onComplete:()=>el.remove()});}
  else setTimeout(()=>el.remove(),3800);
}
addEventListener("techi:notify",e=>toast(`<small>${t("now")}</small><span>${esc(e.detail.msg)}</span>`,null,e.detail.alert));
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-add]");if(!b)return;e.preventDefault();
  addToCart(+b.dataset.add,+(b.dataset.qty||1),b);
  if(b.classList.contains("add")){b.classList.add("done");b.innerHTML=ICON.check+`<span class="lbl">${t("added")}</span>`;setTimeout(()=>{b.classList.remove("done");b.innerHTML=ICON.plus+`<span class="lbl">${t("add")}</span>`;},1600);}
});

/* ================= helpers ================= */
function split(el){
  if(el.dataset.done)return;el.dataset.done=1;el.classList.add("split");
  const walk=n=>{[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){const parts=c.textContent.split(/(\s+)/);const f=document.createDocumentFragment();
      parts.forEach(s=>{if(!s)return;if(/^\s+$/.test(s)){f.appendChild(document.createTextNode(s));return;}const w=document.createElement("span");w.className="w";w.innerHTML=`<span>${esc(s)}</span>`;f.appendChild(w);});c.replaceWith(f);}
    else if(c.nodeType===1&&!c.classList.contains("w"))walk(c);});};
  walk(el);
}
const tag=(s,led=true)=>`<span class="tag">${led?'<i class="led"></i>':""}${s}</span>`;
function card(p){
  const o=off(p),alt=p.imgs.length>1;
  return `<article class="card${alt?" has-alt":""}" data-id="${p.id}" data-cat="${p.cat}">
    <div class="card-top"><a class="card-media" href="#p-${p.id}" data-cursor="${t("view")}">
      ${o?`<span class="badge num">−${o}%</span>`:""}
      <img class="main" src="${img(p)}" alt="${esc(nm(p))}" loading="lazy">${alt?`<img class="alt" src="${img(p,1)}" alt="" loading="lazy">`:""}<span class="glare"></span>
    </a><button class="add" data-add="${p.id}" aria-label="${t("add")}: ${esc(nm(p))}">${ICON.plus}<span class="lbl">${t("add")}</span></button></div>
    <div class="card-body"><span class="card-cat">${CAT_IC[p.cat]}${t("cats")[p.cat]}</span><h3><a href="#p-${p.id}">${esc(nm(p))}</a></h3><span class="var">${esc(vr(p))}</span>
      <div class="price"><b class="num">${money(p.sale)}</b>${p.reg>p.sale?`<s class="num">${fmt(p.reg)}</s>`:""}</div></div></article>`;
}

/* ================= HOME ================= */
const featured=[231855,231759,231737,231916,231689,231686,231925,231940];
function pageHome(){
  const maxOff=Math.max(...P.map(off)),bundles=P.filter(p=>p.cat==="bundles");const W=t("hero_w"),W2=t("hero_w2"),F=t("figs");
  return `
  <section class="hero" id="hero">
    <div class="cone"></div>
    <div class="wrap hero-grid">
      <div>
        ${tag(t("hero_tag"))}
        <div class="words">${W.map((w,i)=>`<div class="word" data-k="${i}"><b>${w}</b><em>${W2[i]}</em></div>`).join("")}</div>
        <div class="hero-meta" data-fade>
          <p>${t("hero_p")}</p>
          <div class="hero-ctas"><a class="btn btn-white" href="#shop" data-magnetic>${btxt(t("hero_cta1"))}${ICON.arrow}</a><a class="btn btn-line" href="#experience" data-magnetic>${ICON.house}${btxt(t("hero_cta2"))}</a></div>
        </div>
      </div>
      <div class="switch-wrap" id="swWrap">
        <div class="ripples"><span></span><span></span><span></span></div>
        <div class="switch" id="sw">
          <div class="sw-edge"></div>
          <div class="sw-glass"><i class="sw-wifi" id="swWifi"></i>
            ${[ICON.bolt,ICON.shield,ICON.voice].map((icn,i)=>`<button class="key" data-k="${i}" aria-label="${t("key_names")[i]}" aria-pressed="false"><i>${icn}</i><span>${t("key_names")[i]}</span></button>`).join("")}
            <div class="sw-scan" id="swScan"></div>
          </div>
        </div>
        <div class="sw-shadow"></div>
        <div class="sw-hint"><i></i>${t("hero_hint")}<i></i></div>
      </div>
    </div>
    <div class="hero-status">${tag(t("status"))}<span class="clock-big" id="clockBig"></span></div>
  </section>

  <section class="sec manifesto" id="mfSec">
    <div class="wrap">
      ${tag(t("mf_tag"))}
      <p class="big" id="mf">${t("mf")}</p>
    </div>
  </section>

  <section class="sec xp-sec" style="padding-top:0">
    <div class="wrap">
      <div class="shead"><div>${tag(t("s1_tag"))}<h2 data-split>${t("s1_h")}</h2></div><div class="side"><p data-fade>${t("s1_p")}</p></div></div>
      ${frame3d(false)}
    </div>
  </section>

  <section class="collection" id="collection">
    <div class="col-pin">
      <div class="wrap col-head"><div>${tag(t("s2_tag"))}<h2 data-split>${t("s2_h")}</h2></div>
        <div class="col-prog num"><span id="colN">01</span><i><b id="colBar"></b></i><span>${pad(featured.length)}</span></div></div>
      <div class="col-track" id="colTrack">
        ${featured.map((id,i)=>{const p=byId[id];const o=off(p);return `<article class="slide">
          <div class="ghost">${GHOST[id]}</div>
          <div class="s-info">
            <span class="s-idx num">${pad(i+1)} / ${pad(featured.length)}</span>
            <span class="room">${CAT_IC[p.cat]}${t("cats")[p.cat]}</span>
            <h3>${esc(nm(p))}</h3><span class="var">${esc(vr(p))}</span>
            <p>${esc(pt(p))}</p>
            <div class="s-price"><b class="num">${money(p.sale)}</b>${p.reg>p.sale?`<s class="num">${fmt(p.reg)}</s><span class="off num">−${o}%</span>`:""}</div>
            <div class="s-btns"><button class="btn btn-white" data-add="${p.id}">${ICON.plus}${btxt(t("add"))}</button><a class="btn btn-line" href="#p-${p.id}">${btxt(t("details"))}</a></div>
          </div>
          <div class="case-wrap"><a class="case" href="#p-${p.id}" data-cursor="${t("view")}"><img src="${img(p)}" alt="${esc(nm(p))}" loading="lazy"></a><div class="plinth"></div></div>
        </article>`;}).join("")}
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="shead"><div>${tag(t("s3_tag"))}<h2 data-split>${t("s3_h")}</h2></div><div class="side"><p data-fade>${t("s3_p")}</p></div></div>
      <div class="rooms" id="rooms">${Object.keys(t("cats")).map(k=>`<a class="room-row" href="${catLink(k)}" data-img="${img(byId[CAT_IMG[k]])}"><span class="ri">${CAT_IC[k]}</span><h3>${t("cats")[k]}</h3><span class="cnt num">${pad(P.filter(p=>p.cat===k).length)} ${t("pieces")}</span><span class="go">${ICON.diag}</span></a>`).join("")}</div>
    </div>
  </section>

  <div class="figs"><div class="track" id="figs">${Array(2).fill(`<div class="f"><b>${maxOff}%</b><span>${F[0]}</span></div><div class="f"><b>${SHOP.filter(p=>p.cat!=="bundles").length}</b><span>${F[1]}</span></div><div class="f"><b>${bundles.length}</b><span>${F[2]}</span></div><div class="f"><b>5Y</b><span>${F[3]}</span></div><div class="f"><b>3.0</b><span>${F[4]}</span></div>`).join("")}</div></div>

  <section class="sec">
    <div class="wrap">
      <div class="shead"><div>${tag(t("s4_tag"))}<h2 data-split>${t("s4_h")}</h2></div><div class="side"><p data-fade>${t("s4_p")}</p><a class="btn btn-line" href="#bundles">${btxt(t("all_bundles"))}${ICON.arrow}</a></div></div>
      ${suites(bundles)}
    </div>
  </section>

  <section class="sec" style="padding-top:0">
    <div class="wrap">
      <div class="shead"><div>${tag(t("s5_tag"))}<h2 data-split>${t("s5_h")}</h2></div></div>
      <div class="ritual" id="ritual">${t("steps").map(([h,p],i)=>`<div class="rit"><i class="bar"></i><span class="ri">${[ICON.pin,ICON.screen,ICON.install,ICON.app][i]}</span><span class="n num">${pad(i+1)}</span><h4>${h}</h4><p>${p}</p></div>`).join("")}</div>
    </div>
  </section>
  ${finale()}`;
}
function suites(list){
  return `<div class="suites" id="suites">${list.map((p,i)=>`<article class="suite${i===0?" on":""}" data-id="${p.id}" tabindex="0">
    <div class="tab"><span class="num si">${pad(i+1)}</span><h4>${esc(nm(p))}</h4><span class="pr num">${fmt(p.sale)} ${t("cur")}</span></div>
    <div class="body"><a class="bimg" href="#p-${p.id}" data-cursor="${t("view")}"><img src="${img(p)}" alt="${esc(nm(p))}" loading="lazy"></a>
      <div class="info"><span class="num si">${pad(i+1)} / ${pad(list.length)}</span><h3>${esc(nm(p))}</h3><span class="v">${esc(vr(p))}</span><p>${esc(pt(p))}</p>
        <ul>${(its(p)||[]).slice(0,8).map(([n,q])=>`<li><span>${esc(n)}</span>${q?`<b class="num">× ${q}</b>`:""}</li>`).join("")}</ul>
        <div class="pr-big"><b class="num">${money(p.sale)}</b><s class="num">${fmt(p.reg)}</s>${p.reg>p.sale?`<span class="save num">${t("save")} ${fmt(p.reg-p.sale)} ${t("cur")}</span>`:""}</div>
        <div class="row-btns"><button class="btn btn-white" data-add="${p.id}">${ICON.plus}${btxt(t("add_bundle"))}</button><a class="btn btn-line" href="#p-${p.id}">${btxt(t("details"))}</a></div>
      </div></div></article>`).join("")}</div>`;
}
function initSuites(){
  const box=$("#suites");if(!box)return;
  const open=el=>{if(el.classList.contains("on"))return;$$(".suite",box).forEach(s=>s.classList.toggle("on",s===el));
    if(innerWidth<=900&&hasGsap)gsap.from($(".body",el),{opacity:0,y:20,duration:.6,ease:"power3.out"});};
  $$(".suite",box).forEach(s=>{s.addEventListener("click",()=>open(s));s.addEventListener("keydown",e=>{if(e.key==="Enter")open(s);});if(fine)s.addEventListener("mouseenter",()=>open(s));});
}
function finale(){
  return `<section class="finale" id="finale"><div class="wrap">
    <div class="giant">TECHI</div>
    <div class="row"><h2 data-split>${t("fin_h")}</h2>
      <div class="addr">${ICON.pin}<div><b>${t("fin_addr")}</b><span>${t("fin_addr2")}</span></div></div>
      <a class="btn btn-white" href="${waLink(t("wa_hi"))}" target="_blank" rel="noopener" data-magnetic>${ICON.wa}${btxt(t("wa"))}</a></div>
  </div></section>`;
}

/* ================= 3D frame ================= */
function frame3d(full){
  return `<div class="t3d-frame${full?" full":""}" data-lenis-prevent>
    <div class="t3d-host" id="t3dHost"></div>
    <div class="t3d-ui">
      <div class="t3d-top">
        <div class="t3d-title">${full?`<h2>${t("t3d_title")}</h2><p>${t("t3d_p")}</p>`:`<p class="t3d-hint">${t("t3d_hint")}</p>`}</div>
        <div class="t3d-tools"><button class="glass-btn" data-day aria-pressed="false">${ICON.sun}<span>${t("day")}</span></button><button class="glass-btn" data-pins aria-pressed="true">${ICON.target}<span>${t("pins")}</span></button><button class="glass-btn" data-home3d>${ICON.house}<span>${t("whole")}</span></button></div>
      </div>
      <div class="t3d-bottom">
        <div class="scenes3d"><button class="glass-btn" data-scene="sleep">${ICON.sleep}${t("sc_sleep")}</button><button class="glass-btn" data-scene="away">${ICON.away}${t("sc_away")}</button><button class="glass-btn" data-scene="home">${ICON.arrive}${t("sc_home")}</button></div>
        <div class="dev-card" id="devCard" hidden></div>
      </div>
    </div>
  </div>`;
}
let off3d=null;
function mount3d(){
  const host=$("#t3dHost");if(!host)return;const frame=host.closest(".t3d-frame");
  if(!window.TechiHome){host.innerHTML=`<div class="t3d-fallback">${t("no3d")}</div>`;return;}
  TechiHome.setLang&&TechiHome.setLang(LANG);
  TechiHome.mount(host);const dc=$("#devCard",frame);
  if(off3d)off3d();
  off3d=TechiHome.on((id,did)=>{if(!id)return;const p=byId[D3MAP[id]];const dv=TechiHome.devices.find(d=>d.id===id);
    dc.hidden=false;dc.innerHTML=`<img src="${img(p)}" alt=""><div><span class="r">${dv.room} · ${dv.name}</span><h4>${esc(nm(p))}</h4><div class="did">${esc(did)}</div></div>
      <div class="row"><span class="p num">${fmt(p.sale)} ${t("cur")}<small>${p.reg>p.sale?fmt(p.reg):""}</small></span><span style="display:flex;gap:6px"><a class="mini-add alt" href="#p-${p.id}">${t("details")}</a><button class="mini-add" data-add="${p.id}">${ICON.plus}${t("add")}</button></span></div>`;
    if(hasGsap&&!reduce)gsap.fromTo(dc,{y:20,opacity:0},{y:0,opacity:1,duration:.5,ease:"power3.out"});});
  frame.querySelectorAll("[data-scene]").forEach(b=>b.onclick=()=>{TechiHome.runScene(b.dataset.scene);frame.querySelectorAll("[data-scene]").forEach(x=>x.classList.toggle("run",x===b));setTimeout(()=>b.classList.remove("run"),2600);});
  const day=$("[data-day]",frame);day.onclick=()=>{const on=day.getAttribute("aria-pressed")!=="true";day.setAttribute("aria-pressed",on);day.innerHTML=(on?ICON.moon:ICON.sun)+`<span>${on?t("night"):t("day")}</span>`;TechiHome.setDay(on);};
  const pins=$("[data-pins]",frame);pins.onclick=()=>{const on=frame.classList.toggle("nopins");pins.setAttribute("aria-pressed",!on);};
  $("[data-home3d]",frame).onclick=()=>TechiHome.home();
}

/* ================= SHOP / PRODUCT / OTHER PAGES ================= */
function phead(tg,h,p,count){return `<section class="phead"><div class="wrap">${tag(tg)}<h1 data-split>${h}</h1><div class="sub"><p data-fade>${p}</p>${count?`<span class="count num" data-fade>${count}</span>`:""}</div></div></section>`;}
function pageShop(cat){
  const counts=Object.fromEntries(Object.keys(t("cats")).map(k=>[k,P.filter(p=>p.cat===k).length]));
  return `${phead(t("shop_tag"),t("shop_h"),t("shop_p"),`${pad(P.length)} ${t("pieces")}`)}
  <section class="wrap" style="padding-bottom:40px">
    <div class="toolbar"><div class="chips" id="chips"><span class="pill"></span><button data-c="all" class="${cat?"":"on"}">${t("all")}<sup class="num">${P.length}</sup></button>${Object.keys(t("cats")).map(k=>`<button data-c="${k}" class="${cat===k?"on":""}">${CAT_IC[k]}${t("cats")[k]}<sup class="num">${counts[k]}</sup></button>`).join("")}</div>
      <div class="tsearch"><input id="q" type="search" placeholder="${t("search")}" aria-label="${t("search")}"><select id="sort" aria-label="sort">${t("sort").map((s,i)=>`<option value="${["pop","lo","hi","off"][i]}">${s}</option>`).join("")}</select></div></div>
    <div class="grid" id="shopGrid">${SHOP.map(card).join("")}</div>
    <p class="empty" id="empty" hidden>${t("empty")}</p>
  </section>`;
}
function movePill(box){if(!box)return;const on=$("button.on,a.on",box),pill=$(".pill",box);if(!pill)return;if(!on){pill.style.opacity=0;return;}pill.style.opacity=1;pill.style.left=on.offsetLeft+"px";pill.style.width=on.offsetWidth+"px";}
function initShop(cat){
  let c=cat||"all";const grid=$("#shopGrid");const order=SHOP.map(p=>p.id);
  function apply(animate){
    const q=$("#q").value.trim().toLowerCase(),s=$("#sort").value;
    const state=animate&&hasGsap&&window.Flip&&!reduce?Flip.getState(".card",{props:"opacity"}):null;
    const cards=$$(".card",grid);
    cards.forEach(el=>{const p=byId[+el.dataset.id];el.hidden=!((c==="all"||p.cat===c)&&(!q||(p.ar+" "+p.en+" "+p.variant+" "+p.variantEn).toLowerCase().includes(q)));});
    cards.sort((a,b)=>{const A=byId[+a.dataset.id],B=byId[+b.dataset.id];return s==="lo"?A.sale-B.sale:s==="hi"?B.sale-A.sale:s==="off"?off(B)-off(A):order.indexOf(A.id)-order.indexOf(B.id);}).forEach(el=>grid.appendChild(el));
    $("#empty").hidden=cards.some(el=>!el.hidden);
    if(state)Flip.from(state,{duration:.8,ease:"expo.inOut",scale:true,absolute:true,stagger:.015,onEnter:els=>gsap.fromTo(els,{opacity:0,scale:.8},{opacity:1,scale:1,duration:.6}),onLeave:els=>gsap.to(els,{opacity:0,scale:.8,duration:.4})});
  }
  $("#chips").onclick=e=>{const b=e.target.closest("button");if(!b)return;c=b.dataset.c;$$("#chips button").forEach(x=>x.classList.toggle("on",x===b));movePill($("#chips"));history.replaceState(null,"",c==="all"?"#shop":"#shop-"+c);apply(true);};
  $("#q").oninput=()=>apply(true);$("#sort").onchange=()=>apply(true);
  apply(false);requestAnimationFrame(()=>movePill($("#chips")));
}
function pageBundles(){
  const b=P.filter(p=>p.cat==="bundles");
  return `${phead(t("b_tag"),t("b_h"),t("b_p"),`${pad(b.length)}`)}
  <section class="wrap" style="padding-bottom:60px">${suites(b)}</section>
  <section class="sec" style="padding-top:60px"><div class="wrap"><div class="grid" data-stagger>${b.map(card).join("")}</div></div></section>`;
}
function pageProduct(id){
  const p=byId[id];if(!p)return pageShop();
  const o=off(p);const d3=Object.keys(D3MAP).find(k=>D3MAP[k]===p.id);
  const rel=P.filter(x=>x.cat===p.cat&&x.id!==p.id).concat(P.filter(x=>x.cat!==p.cat&&x.cat!=="bundles")).slice(0,4);
  const list=(ft(p)||[]).map(f=>[f,0]).concat(its(p)||[]);const specs=sp(p)||[];const PK=t("perks");
  return `<section class="pp wrap">
    <nav class="crumbs" aria-label="breadcrumb"><a href="#home">${t("crumbs_home")}</a><span>/</span><a href="${catLink(p.cat)}">${t("cats")[p.cat]}</a><span>/</span><span>${esc(nm(p))}</span></nav>
    <div class="pp-grid">
      <div class="gal"><div class="gal-stage"><div class="gal-main" id="galMain" data-cursor="${t("zoom")}">${o?`<span class="badge num">−${o}%</span>`:""}<img id="galImg" src="${img(p)}" alt="${esc(nm(p))}"></div></div>
        ${p.imgs.length>1?`<div class="thumbs" id="thumbs">${p.imgs.map((f,i)=>`<button class="${i?"":"on"}" data-i="${i}" aria-label="${i+1}"><img src="${src(f)}" alt=""></button>`).join("")}</div>`:""}</div>
      <div class="pinfo">
        <span class="pc" data-fade>${CAT_IC[p.cat]}${t("cats")[p.cat]} · ${esc(vr(p))}</span>
        <h1 data-split>${esc(nm(p))}</h1>
        <div class="en" data-fade>${esc(isEn()?p.ar:p.en)}</div>
        <p class="lead" data-fade>${esc(pt(p))}</p>
        <div class="pbig" data-fade><b class="num">${money(p.sale)}</b>${p.reg>p.sale?`<s class="num">${fmt(p.reg)} ${t("cur")}</s><span class="save num">${t("save")} ${fmt(p.reg-p.sale)} ${t("cur")}</span>`:""}</div>
        ${list.length?`<ul class="feat" data-fade>${list.map(([n,q],i)=>`<li><i class="num">${pad(i+1)}</i><span>${esc(n)}</span>${q?`<b class="num">× ${q}</b>`:""}</li>`).join("")}</ul>`:""}
        <div class="buy" data-fade>
          <div class="qty"><button id="qm" aria-label="${t("qty_less")}">−</button><span class="num" id="qv">1</span><button id="qp" aria-label="${t("qty_more")}">+</button></div>
          <button class="btn btn-white" id="ppAdd" data-add="${p.id}" data-qty="1" data-magnetic>${ICON.plus}${btxt(t("add"))}</button>
          <a class="btn btn-wa" href="${waLink(t("wa_order")+nm(p)+" ("+vr(p)+")")}" target="_blank" rel="noopener">${ICON.wa}${btxt(t("order_wa"))}</a>
        </div>
        ${d3?`<a class="btn btn-line" href="#experience-${d3}" style="justify-self:start" data-fade>${ICON.house}${btxt(t("see3d"))}</a>`:""}
        <div class="perks" data-fade>${PK.map(([b,s],i)=>`<div>${[ICON.install,ICON.pin,ICON.app][i]}<b>${b}</b><span>${s}</span></div>`).join("")}</div>
        ${specs.length?`<div class="specs" data-fade><table><caption>${t("specs")}</caption>${specs.map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table></div>`:""}
      </div>
    </div>
  </section>
  <section class="sec"><div class="wrap"><div class="shead"><div>${tag(t("pairs_tag"))}<h2 data-split>${t("pairs")}</h2></div></div><div class="grid" data-stagger>${rel.map(card).join("")}</div></div></section>`;
}
function initProduct(id){
  const p=byId[id];if(!p)return;let q=1;
  const setQ=v=>{q=Math.max(1,Math.min(20,v));$("#qv").textContent=q;$("#ppAdd").dataset.qty=q;};
  $("#qm").onclick=()=>setQ(q-1);$("#qp").onclick=()=>setQ(q+1);
  const main=$("#galMain"),gi=$("#galImg");
  const th=$("#thumbs");if(th)th.onclick=e=>{const b=e.target.closest("button");if(!b)return;$$("#thumbs button").forEach(x=>x.classList.toggle("on",x===b));
    const s2=src(p.imgs[+b.dataset.i]);if(hasGsap)gsap.to(gi,{opacity:0,scale:.94,duration:.25,onComplete:()=>{gi.src=s2;gsap.to(gi,{opacity:1,scale:1,duration:.6,ease:"expo.out"});}});else gi.src=s2;};
  main.addEventListener("pointermove",e=>{const r=main.getBoundingClientRect();gi.style.transformOrigin=`${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%`;});
  main.addEventListener("click",()=>main.classList.toggle("zoom"));main.addEventListener("pointerleave",()=>main.classList.remove("zoom"));
}
function pageExperience(){
  return `<section class="xp">${frame3d(true)}</section>
  <section class="sec"><div class="wrap"><div class="shead"><div>${tag(t("xp_tag"))}<h2 data-split>${t("xp_h")}</h2></div><div class="side"><p data-fade>${t("xp_p")}</p></div></div>
    <div class="xp-list" data-stagger>${(window.TechiHome?TechiHome.devices:[]).map(d=>{const p=byId[D3MAP[d.id]];return `<button class="xp-item" data-dev="${d.id}"><img src="${img(p)}" alt=""><span><b>${d.name}</b><small>${d.room} · ${fmt(p.sale)} ${t("cur")}</small></span><span class="n num">${pad(d.n)}</span></button>`;}).join("")}</div>
  </div></section>`;
}
function initExperience(dev){
  $$(".xp-item").forEach(b=>b.onclick=()=>{(lenis?lenis.scrollTo(0,{duration:1.2}):scrollTo({top:0,behavior:"smooth"}));setTimeout(()=>TechiHome.activate(b.dataset.dev,true),reduce?0:700);});
  if(dev&&window.TechiHome)setTimeout(()=>TechiHome.activate(dev,true),1600);
}
function pageAbout(){
  return `${phead(t("ab_tag"),"Techi.",t("ab_p"),"")}
  <section class="sec" style="padding-top:60px"><div class="wrap about-grid">
    <p class="big" data-fade>${t("ab_big")}</p>
    <div class="facts" data-fade>${t("facts").map(([b,s],i)=>`<div>${[ICON.pin,ICON.install,ICON.shield,ICON.app][i]}<b>${b}</b><span>${s}</span></div>`).join("")}</div>
  </div></section>${finale()}`;
}

/* ================= HERO SWITCH ================= */
function initHero(){
  const hero=$("#hero");if(!hero)return;
  const keys=$$(".key",hero),words=$$(".word",hero),sw=$("#sw"),scan=$("#swScan"),rip=$$(".ripples span",hero),wifi=$("#swWifi");
  const state=[0,0,0];
  function set(k,on,silent){
    state[k]=on?1:0;keys[k].classList.toggle("on",on);keys[k].setAttribute("aria-pressed",on);words[k].classList.toggle("on",on);
    wifi.classList.toggle("on",state.some(Boolean));
    if(!hasGsap||reduce){if(k===0){if(BGM)BGM.lux=on?1:0;hero.style.setProperty("--lux",on?1:0);}return;}
    gsap.fromTo(keys[k],{scale:.86},{scale:1,duration:.6,ease:"elastic.out(1,.4)"});
    if(k===0){if(BGM)gsap.to(BGM,{lux:on?1:0,duration:on?1.4:.8,ease:"power2.out",overwrite:"auto"});
      gsap.to(hero,{"--lux":on?1:0,duration:on?1.4:.8,ease:"power2.out"});
      if(on)gsap.fromTo(hero.querySelector(".cone"),{opacity:0},{keyframes:[{opacity:.6,duration:.05},{opacity:.1,duration:.06},{opacity:.9,duration:.05},{opacity:.3,duration:.08},{opacity:1,duration:.3}],clearProps:"opacity"});}
    if(k===1&&on){gsap.fromTo(scan,{yPercent:-100,opacity:1},{yPercent:250,opacity:0,duration:1.1,ease:"power2.inOut"});if(!silent)toast(`<small>Techi Home</small><span>${t("lock_toast")}</span>`);}
    if(k===2&&on){rip.forEach((r,i)=>gsap.fromTo(r,{scale:.5,opacity:.9},{scale:2.6,opacity:0,duration:2.2,delay:i*.35,ease:"power2.out"}));if(BGM)gsap.fromTo(BGM,{spin:8},{spin:1,duration:2.5,ease:"power3.out"});}
  }
  keys.forEach((b,k)=>b.addEventListener("click",()=>set(k,!state[k])));
  words.forEach((w,k)=>w.addEventListener("click",()=>set(k,!state[k])));
  if(fine&&hasGsap){const rx=gsap.quickTo(sw,"rotationX",{duration:.8,ease:"power3"}),ry=gsap.quickTo(sw,"rotationY",{duration:.8,ease:"power3"});
    hero.addEventListener("pointermove",e=>{const r=sw.getBoundingClientRect();const nx=(e.clientX-(r.left+r.width/2))/innerWidth,ny=(e.clientY-(r.top+r.height/2))/innerHeight;
      ry(nx*28);rx(-ny*22);sw.querySelector(".sw-glass").style.setProperty("--sheen",(nx*160)+"%");});
    hero.addEventListener("pointerleave",()=>{rx(0);ry(0);});}
  if(hasGsap&&!reduce){
    gsap.timeline({delay:.3})
      .from(".word b",{yPercent:110,opacity:0,duration:1.4,ease:"expo.out",stagger:.12})
      .from(".word em",{opacity:0,duration:1,ease:"power3.out",stagger:.12},"-=1")
      .from(sw,{y:80,rotationX:40,opacity:0,duration:1.6,ease:"expo.out"},"-=1.3")
      .from("#hero .tag, #hero [data-fade], .hero-status",{y:30,opacity:0,duration:1,ease:"power3.out",stagger:.1},"-=1")
      .add(()=>set(0,true,true),"+=.1").add(()=>set(1,true,true),"+=.7").add(()=>set(2,true,true),"+=.7");
    gsap.to(".hero-grid",{yPercent:-12,opacity:.2,ease:"none",scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:true}});
  }else{set(0,true,true);set(1,true,true);set(2,true,true);}
}

/* ================= MOTION ================= */
function bgScenes(route){
  if(!BGM)return;const s=dirSign();const mob=innerWidth<900;
  if(route!=="home"){bgPlace(.62*-s,.15,mob?.55:.75);bgTo({dim:.55});return;}
  const heroPos=()=>{bgPlace(mob?0:-.42*s,mob?.2:0,mob?.62:1);bgTo({dim:1});};
  heroPos();
  if(!hasGsap||reduce)return;
  const stops=[
    ["#mfSec",()=>{bgPlace(0,0,mob?1.1:1.55,{d:2.2});bgTo({dim:.75},2);}],
    [".xp-sec",()=>{bgPlace(.55*s,-.35,.7);bgTo({dim:.35});}],
    ["#collection",()=>{bgPlace(0,.05,mob?.9:1.25);bgTo({dim:.4});}],
    ["#rooms",()=>{bgPlace(-.6*s,.1,.8);bgTo({dim:.6});}],
    ["#suites",()=>{bgPlace(.65*s,.2,.6);bgTo({dim:.35});}],
    ["#finale",()=>{bgPlace(0,.1,mob?.9:1.3);bgTo({dim:.9});}]];
  stops.forEach(([sel,fn],i)=>ScrollTrigger.create({trigger:sel,start:"top 65%",onEnter:fn,onLeaveBack:i?stops[i-1][1]:heroPos}));
}
function animatePage(route){
  $$("[data-split]").forEach(split);
  initHero();initSuites();bgScenes(route);
  if(!hasGsap||reduce)return;
  const head=$(".phead");
  if(head){gsap.from($$("[data-split] .w>span",head),{yPercent:120,duration:1.4,ease:"expo.out",stagger:.08,delay:.2});
    gsap.from($$("[data-fade],.tag",head),{y:30,opacity:0,duration:1,ease:"power3.out",stagger:.1,delay:.5});}
  $$("[data-split]").filter(el=>!el.closest(".phead")).forEach(el=>{
    gsap.from($$(".w>span",el),{yPercent:120,duration:1.3,ease:"expo.out",stagger:.06,scrollTrigger:{trigger:el,start:"top 88%"}});});
  $$("[data-fade]").filter(el=>!el.closest(".phead,#hero")).forEach(el=>{
    gsap.from(el,{y:40,opacity:0,duration:1.2,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 90%"}});});
  $$("[data-stagger]").forEach(g=>gsap.from(g.children,{y:80,opacity:0,duration:1.2,ease:"expo.out",stagger:.08,scrollTrigger:{trigger:g,start:"top 85%"}}));
  const sg=$("#shopGrid");if(sg)gsap.from(sg.children,{y:80,opacity:0,duration:1.2,ease:"expo.out",stagger:.05,delay:.5});
  $$(".gal-main").forEach(el=>gsap.from(el,{scale:.85,opacity:0,rotationY:-20*dirSign(),duration:1.6,ease:"expo.out",delay:.15}));
  const mf=$("#mf");if(mf){split(mf);const ws=$$(".w",mf);
    ScrollTrigger.create({trigger:mf,start:"top 75%",end:"bottom 45%",scrub:true,onUpdate:s=>{const n=Math.round(s.progress*ws.length);ws.forEach((w,i)=>w.classList.toggle("lit",i<n));}});}
  $$(".t3d-frame:not(.full)").forEach(f=>gsap.from(f,{clipPath:"inset(18% 14% 18% 14% round 60px)",duration:1.8,ease:"expo.out",scrollTrigger:{trigger:f,start:"top 85%"}}));
  const col=$("#collection"),track=$("#colTrack");
  if(col&&innerWidth>900){const slides=$$(".slide",track);const dist=()=>track.scrollWidth-innerWidth;
    const parts=slides.map(sl=>({sl,c:$(".case",sl),i:$(".s-info",sl),g:$(".ghost",sl)}));
    const paint=()=>{const W=innerWidth;parts.forEach(o=>{const r=o.sl.getBoundingClientRect();const c=(r.left+r.width/2-W/2)/W;const a=Math.min(1,Math.abs(c)*1.5);
      gsap.set(o.c,{scale:1-.38*a,rotation:c*-16,opacity:1-.55*a});gsap.set(o.i,{opacity:Math.max(0,1-a*1.6),x:c*60});gsap.set(o.g,{x:c*-420,opacity:1-a*.6});});};
    gsap.to(track,{x:()=>dist()*dirSign(),ease:"none",scrollTrigger:{trigger:col,start:"top top",end:()=>"+="+dist(),pin:".col-pin",scrub:1,invalidateOnRefresh:true,
      onUpdate:s=>{$("#colBar").style.transform=`scaleX(${s.progress})`;$("#colN").textContent=pad(Math.min(slides.length,Math.round(s.progress*(slides.length-1))+1));},onRefresh:paint}});
    gsap.ticker.add(paint);paint();}
  else if(col){$$(".slide",col).forEach(sl=>gsap.from($(".case",sl),{scale:.7,opacity:0,duration:1.4,ease:"expo.out",scrollTrigger:{trigger:sl,start:"top 80%"}}));}
  const rooms=$("#rooms");if(rooms){gsap.from($$(".room-row",rooms),{y:60,opacity:0,duration:1.1,ease:"expo.out",stagger:.08,scrollTrigger:{trigger:rooms,start:"top 85%"}});
    if(fine){const hi=$("#hoverImg");const xT=gsap.quickTo(hi,"x",{duration:.7,ease:"power3"}),yT=gsap.quickTo(hi,"y",{duration:.7,ease:"power3"});let lastX=0;
      $$(".room-row",rooms).forEach(r=>{r.addEventListener("mouseenter",e=>{gsap.set(hi,{x:e.clientX,y:e.clientY});lastX=e.clientX;hi.innerHTML=`<img src="${r.dataset.img}" alt="">`;gsap.to(hi,{opacity:1,scale:1,duration:.6,ease:"expo.out"});});
        r.addEventListener("mouseleave",()=>gsap.to(hi,{opacity:0,scale:.6,duration:.4}));
        r.addEventListener("mousemove",e=>{xT(e.clientX);yT(e.clientY);gsap.to(hi,{rotation:Math.max(-12,Math.min(12,(e.clientX-lastX)*.6)),duration:.5});lastX=e.clientX;});});}}
  const figs=$("#figs");if(figs){const w=figs.scrollWidth/2;const mq=gsap.to(figs,{x:-w,duration:40,ease:"none",repeat:-1});
    ScrollTrigger.create({trigger:figs,start:"top bottom",end:"bottom top",onUpdate:s=>gsap.to(mq,{timeScale:1+Math.abs(s.getVelocity()/250),duration:.3,overwrite:true,onComplete:()=>gsap.to(mq,{timeScale:1,duration:1})})});}
  const su=$("#suites");if(su)gsap.from($$(".suite",su),{y:120,opacity:0,duration:1.4,ease:"expo.out",stagger:.08,scrollTrigger:{trigger:su,start:"top 85%"}});
  const rit=$("#ritual");if(rit){const items=$$(".rit",rit);items.forEach((it,i)=>{gsap.to($(".bar",it),{scaleX:1,duration:1.2,ease:"expo.inOut",scrollTrigger:{trigger:rit,start:"top 75%"},delay:i*.25,onComplete:()=>it.classList.add("on")});});
    gsap.from(items,{y:50,opacity:0,stagger:.12,duration:1.2,ease:"expo.out",scrollTrigger:{trigger:rit,start:"top 80%"}});}
  const fin=$("#finale");if(fin){const g=$(".giant",fin);gsap.from(g,{yPercent:30,opacity:0,duration:1.6,ease:"expo.out",scrollTrigger:{trigger:fin,start:"top 80%"}});
    fin.addEventListener("pointermove",e=>{const r=g.getBoundingClientRect();g.style.setProperty("--mx",((e.clientX-r.left)/r.width*100)+"%");g.style.setProperty("--my",((e.clientY-r.top)/r.height*100)+"%");});
    if(!fine)gsap.to(g,{"--mx":"100%",duration:4,yoyo:true,repeat:-1,ease:"sine.inOut"});}
  if(fine)$$(".card").forEach(c=>{const top=$(".card-top",c),m=$(".card-media",c);
    c.addEventListener("pointermove",e=>{const r=m.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      m.style.setProperty("--gx",x*100+"%");m.style.setProperty("--gy",y*100+"%");gsap.to(top,{rotationY:(x-.5)*14,rotationX:-(y-.5)*14,duration:.6,ease:"power3"});});
    c.addEventListener("pointerleave",()=>gsap.to(top,{rotationY:0,rotationX:0,duration:1,ease:"elastic.out(1,.5)"}));});
  magnetic();
}
function magnetic(){
  if(!fine||!hasGsap)return;
  $$("[data-magnetic]").forEach(el=>{if(el.dataset.mg)return;el.dataset.mg=1;const xT=gsap.quickTo(el,"x",{duration:.8,ease:"elastic.out(1,.4)"}),yT=gsap.quickTo(el,"y",{duration:.8,ease:"elastic.out(1,.4)"});
    el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect();xT((e.clientX-r.left-r.width/2)*.35);yT((e.clientY-r.top-r.height/2)*.45);});
    el.addEventListener("pointerleave",()=>{xT(0);yT(0);});});
}

/* ================= ROUTER + "power cut" transition ================= */
function parse(){const h=(location.hash||"#home").slice(1);
  if(h.startsWith("p-"))return{r:"product",id:+h.slice(2)};
  if(h.startsWith("shop-"))return{r:"shop",cat:h.slice(5)};
  if(h.startsWith("experience-"))return{r:"experience",dev:h.slice(11)};
  if(["home","shop","bundles","experience","about"].includes(h))return{r:h};
  return{r:"home"};}
let first=true,busy=false,pending=false,ctx=null;
function render(){
  const R=parse();const app=$("#app");
  if(hasGsap){if(ctx)ctx.revert();ScrollTrigger.getAll().forEach(x=>x.kill());}
  if(window.TechiHome)TechiHome.unmount();
  if(BGM)BGM.lux=0;cur.classList.remove("big");document.body.classList.remove("loading");
  const hi=$("#hoverImg");if(hi){hi.style.opacity=0;hi.innerHTML="";}
  app.innerHTML=R.r==="shop"?pageShop(R.cat):R.r==="bundles"?pageBundles():R.r==="product"?pageProduct(R.id):R.r==="experience"?pageExperience():R.r==="about"?pageAbout():pageHome();
  const navR=R.r==="product"?(byId[R.id]&&byId[R.id].cat==="bundles"?"bundles":"shop"):R.r;
  $$("#capsule a").forEach(a=>a.classList.toggle("on",a.dataset.r===navR));movePill($("#capsule"));
  document.title=R.r==="product"&&byId[R.id]?`${nm(byId[R.id])} · Techi`:"Techi Smart Home";
  if(lenis)lenis.scrollTo(0,{immediate:true});else scrollTo(0,0);
  if(R.r==="shop")initShop(R.cat);
  if(R.r==="product")initProduct(R.id);
  mount3d();
  if(R.r==="experience")initExperience(R.dev);
  if(hasGsap)ctx=gsap.context(()=>animatePage(R.r));else animatePage(R.r);
  bindCursorTargets();tick();
  if(hasGsap)requestAnimationFrame(()=>ScrollTrigger.refresh());
}
function wipe(mid){
  const t1=$("#tr .t1"),t2=$("#tr .t2"),ln=$("#tr b");
  return gsap.timeline()
    .to([t1,t2],{yPercent:0,duration:.6,ease:"expo.inOut"})
    .to(ln,{scaleX:1,opacity:1,duration:.35,ease:"power3.out"},"-=.15")
    .add(mid)
    .to(ln,{keyframes:[{opacity:.2,duration:.05},{opacity:1,duration:.05},{opacity:.4,duration:.06},{opacity:1,duration:.08}]})
    .to(t1,{yPercent:-101,duration:.9,ease:"expo.inOut"},"+=.05")
    .to(t2,{yPercent:101,duration:.9,ease:"expo.inOut"},"<")
    .to(ln,{scaleY:40,opacity:0,duration:.6,ease:"power2.out"},"<")
    .set(ln,{scaleX:0,scaleY:1});
}
function go(){
  if(first||!hasGsap||reduce){first=false;render();return;}
  if(busy){pending=true;return;}busy=true;
  wipe(()=>render()).eventCallback("onComplete",()=>{busy=false;if(pending){pending=false;go();}});
}
addEventListener("hashchange",()=>{closeCart();closeMenu();go();});
addEventListener("resize",()=>movePill($("#capsule")));
$("#langBtn").addEventListener("click",()=>{LANG=isEn()?"ar":"en";try{localStorage.setItem("techi-lang",LANG);}catch(e){}
  if(!hasGsap||reduce){applyLang();render();return;}
  wipe(()=>{applyLang();render();});
});

let lastY=0;
addEventListener("scroll",()=>{const y=scrollY;$("#hdr").classList.toggle("hide",y>lastY&&y>300);lastY=y;},{passive:true});

function openMenu(){const m=$("#mmenu");m.hidden=false;lenis&&lenis.stop();
  if(hasGsap){gsap.fromTo(m,{clipPath:"inset(0 0 100% 0)"},{clipPath:"inset(0 0 0% 0)",duration:.9,ease:"expo.inOut"});gsap.from($$("#mmenu a span"),{yPercent:110,duration:1,ease:"expo.out",stagger:.06,delay:.35});}
  else m.style.clipPath="none";}
function closeMenu(){const m=$("#mmenu");if(m.hidden)return;lenis&&lenis.start();if(hasGsap)gsap.to(m,{clipPath:"inset(100% 0 0% 0)",duration:.7,ease:"expo.inOut",onComplete:()=>m.hidden=true});else m.hidden=true;}
$("#menuBtn").onclick=openMenu;$("#menuClose").onclick=closeMenu;

const cur=$("#cur"),curT=$("#curT");let cx;
if(fine&&hasGsap&&!reduce){cx=gsap.quickTo(cur,"x",{duration:.12});const cy=gsap.quickTo(cur,"y",{duration:.12});
  addEventListener("pointermove",e=>{document.body.classList.add("cur-on");cx(e.clientX);cy(e.clientY);},{passive:true});
  document.addEventListener("pointerleave",()=>document.body.classList.remove("cur-on"));}
function bindCursorTargets(){
  if(!cx)return;
  $$("[data-cursor]").forEach(el=>{if(el.dataset.cb)return;el.dataset.cb=1;
    el.addEventListener("mouseenter",()=>{curT.textContent=el.dataset.cursor;cur.classList.add("big");});
    el.addEventListener("mouseleave",()=>cur.classList.remove("big"));});
}
function tick(){try{const s=new Intl.DateTimeFormat("en-GB",{timeZone:"Africa/Cairo",hour:"2-digit",minute:"2-digit"}).format(new Date());$("#clock").textContent="CAIRO "+s;const cb=$("#clockBig");if(cb)cb.textContent="CAI "+s;}catch(e){}}
setInterval(tick,20000);

function boot(){
  $("#yr").textContent=new Date().getFullYear();$("#footWa").href=waLink("Techi");
  applyLang();
  if(hasGsap&&window.Lenis&&!reduce){lenis=new Lenis({lerp:.085,smoothWheel:true});lenis.on("scroll",ScrollTrigger.update);gsap.ticker.add(x=>lenis.raf(x*1000));gsap.ticker.lagSmoothing(0);}
  const pre=$("#pre");
  if(!hasGsap||reduce||!BGM){if(BGM)BGM.morph=1;pre.remove();render();return;}
  // preloader: the logo mark appears as a network, then unfolds into the mesh globe
  BGM.morph=0;BGM.dim=0;BGM.g.position.set(0,0,0);BGM.g.scale.setScalar(innerWidth<700?.7:.9);
  const o={v:0};
  gsap.timeline()
    .to(BGM,{dim:1,duration:1,ease:"power2.out"})
    .to(o,{v:100,duration:1.8,ease:"power2.inOut",onUpdate:()=>{$("#preNum").textContent=String(Math.round(o.v)).padStart(3,"0");}},0)
    .to(".pre-in",{opacity:0,y:-20,duration:.5,ease:"power3.in"},"+=.1")
    .to(BGM,{morph:1,duration:2.2,ease:"power2.inOut"},"-=.2")
    .add(()=>render(),"-=1.4")
    .to(pre,{opacity:0,duration:.8,onComplete:()=>pre.remove()},"<");
}
boot();
})();
