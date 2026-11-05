/* Techi storefront — router, catalogue, cart, motion */
(function(){
"use strict";
const WA_NUMBER="201000000000"; // TODO: رقم واتساب الشركة بصيغة دولية من غير +
const P=window.TECHI_PRODUCTS||[];
const byId=Object.fromEntries(P.map(p=>[p.id,p]));
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const hasGsap=!!window.gsap;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
if(hasGsap){gsap.registerPlugin(ScrollTrigger);if(window.Flip)gsap.registerPlugin(Flip);}
const CATS={screens:"شاشات التحكم",switches:"السويتشات والبرايز",security:"الأمان والحساسات",voice:"التحكم والصوت",bundles:"الباقات"};
const CAT_IMG={screens:231759,switches:231686,security:231855,voice:231737,bundles:231792};
const D3MAP={light_living:231840,light_kitchen:231840,light_bedroom:231840,curtain_living:231686,curtain_bed:231711,ac:231783,socket:231689,hub:231933,echo:231737,panel:231759,lock:231855,motion:231925,gas:231916,valve:231940};
const fmt=n=>n.toLocaleString("en-US");
const money=n=>`${fmt(n)}<span class="cur-l">ج.م</span>`;
const off=p=>p.reg>p.sale?Math.round((1-p.sale/p.reg)*100):0;
const src=f=>(window.TECHI_IMG&&window.TECHI_IMG[f])||"img/"+f;
const img=(p,i=0)=>src(p.imgs[i]||p.imgs[0]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const waLink=t=>`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;
const ICON={
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  arr:'<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  arrUp:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7L7 17M8 7h9v9"/></svg>',
  wa:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>'
};

/* ================= cart ================= */
const store={get(){try{return JSON.parse(localStorage.getItem("techi-cart")||"[]");}catch(e){return [];}},set(v){try{localStorage.setItem("techi-cart",JSON.stringify(v));}catch(e){}}};
let cart=store.get().filter(i=>byId[i.id]);
function saveCart(){store.set(cart);renderCart();}
function addToCart(id,qty=1,fromEl){
  const it=cart.find(i=>i.id===id);if(it)it.qty+=qty;else cart.push({id,qty});saveCart();
  const p=byId[id];flyToCart(fromEl,p);
  toast(`<small>اتضاف للسلة</small><span>${esc(p.ar)}</span>`,img(p));
  if(hasGsap)gsap.fromTo("#cartBtn",{scale:1},{scale:1.25,duration:.18,yoyo:true,repeat:1,ease:"power2.out"});
}
function cartTotals(){let t=0,s=0,c=0;cart.forEach(i=>{const p=byId[i.id];t+=p.sale*i.qty;s+=(p.reg-p.sale)*i.qty;c+=i.qty;});return{t,s,c};}
function orderText(){const {t}=cartTotals();return "أهلاً Techi، عايز أطلب:\n"+cart.map(i=>`• ${byId[i.id].ar} (${byId[i.id].variant}) × ${i.qty} = ${fmt(byId[i.id].sale*i.qty)} ج.م`).join("\n")+`\n\nالإجمالي: ${fmt(t)} ج.م`;}
function renderCart(){
  const {t,s,c}=cartTotals();const cc=$("#cartCount");cc.textContent=c;cc.hidden=!c;
  const list=$("#cartList"),foot=$("#cartFoot");
  if(!cart.length){list.innerHTML=`<div class="dempty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg><b>السلة فاضية</b><span>ابدأ بأي جهاز، وكل حاجة بتتربط ببعض بعدين.</span><a class="btn btn-navy" href="#shop" data-close>تسوّق الأجهزة ${ICON.arr}</a></div>`;foot.innerHTML="";return;}
  list.innerHTML=cart.map(i=>{const p=byId[i.id];return `<div class="ci" data-id="${p.id}"><img src="${img(p)}" alt=""><div><h4>${esc(p.ar)}</h4><div class="cv">${esc(p.variant)}</div><div class="q"><button data-q="-1" aria-label="قلل">−</button><span class="num">${i.qty}</span><button data-q="1" aria-label="زوّد">+</button><button class="rm" data-rm>شيل</button></div></div><div class="lp num">${fmt(p.sale*i.qty)}</div></div>`;}).join("");
  foot.innerHTML=`${s?`<div class="r s"><span>وفّرت</span><span class="num">${fmt(s)} ج.م</span></div>`:""}<div class="r t"><span>الإجمالي</span><span class="num">${fmt(t)} ج.م</span></div>
   <a class="btn btn-wa" href="${waLink(orderText())}" target="_blank" rel="noopener">${ICON.wa} اطلب على واتساب</a>
   <details><summary style="cursor:pointer;font-size:.85rem;color:var(--ink-2)">نص الطلب لو واتساب ما فتحش</summary><div class="order-msg">${esc(orderText())}</div></details>`;
}
$("#cartList").addEventListener("click",e=>{const row=e.target.closest(".ci");if(!row)return;const id=+row.dataset.id;const it=cart.find(i=>i.id===id);
  if(e.target.closest("[data-rm]")){cart=cart.filter(i=>i.id!==id);}else{const q=e.target.closest("[data-q]");if(!q)return;it.qty+= +q.dataset.q;if(it.qty<1)cart=cart.filter(i=>i.id!==id);}saveCart();});
$("#cartList").addEventListener("click",e=>{if(e.target.closest("[data-close]"))closeCart();});
let lenis=null;
function openCart(){$("#drawer").classList.add("on");$("#scrim").classList.add("on");lenis&&lenis.stop();
  if(hasGsap&&!reduce)gsap.from("#cartList .ci",{x:-40,opacity:0,stagger:.06,duration:.6,ease:"power3.out",delay:.15});}
function closeCart(){$("#drawer").classList.remove("on");$("#scrim").classList.remove("on");lenis&&lenis.start();}
$("#cartBtn").onclick=openCart;$("#drawerClose").onclick=closeCart;$("#scrim").onclick=closeCart;
addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeMenu();}});

function flyToCart(fromEl,p){
  if(!hasGsap||reduce||!fromEl)return;
  const src=fromEl.closest(".card,.pp,.dev-card,.xp-item")?.querySelector("img")||fromEl;
  const a=src.getBoundingClientRect(),b=$("#cartBtn").getBoundingClientRect();
  const f=document.createElement("img");f.src=img(p);f.className="flyimg";const sz=Math.min(a.width,160);
  Object.assign(f.style,{width:sz+"px",height:sz+"px",left:a.left+(a.width-sz)/2+"px",top:a.top+(a.height-sz)/2+"px"});document.body.appendChild(f);
  const dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2);
  gsap.timeline({onComplete:()=>f.remove()})
    .to(f,{x:dx*.5,y:dy*.5-120,scale:.7,rotation:-12,duration:.45,ease:"power2.out"})
    .to(f,{x:dx,y:dy,scale:.12,rotation:0,opacity:.4,duration:.45,ease:"power2.in"});
}

/* ================= toasts ================= */
function toast(html,image,alert){
  const t=document.createElement("div");t.className="toast"+(alert?" alert":"");
  t.innerHTML=`<div class="ti">${image?`<img src="${image}" alt="">`:alert?"!":`<img src="${src("logo-navy.png")}" alt="">`}</div><div>${html}</div>`;
  $("#toasts").prepend(t);
  if(hasGsap){gsap.from(t,{y:30,opacity:0,scale:.95,duration:.5,ease:"back.out(1.6)"});gsap.to(t,{y:20,opacity:0,duration:.4,delay:3.4,onComplete:()=>t.remove()});}
  else setTimeout(()=>t.remove(),3800);
}
addEventListener("techi:notify",e=>toast(`<small>Techi Home · دلوقتي</small><span>${esc(e.detail.msg)}</span>`,null,e.detail.alert));

/* ================= components ================= */
function card(p){
  const o=off(p),alt=p.imgs.length>1;
  return `<article class="card${alt?" has-alt":""}" data-id="${p.id}" data-cat="${p.cat}">
    <div class="card-top"><a class="card-media" href="#p-${p.id}" data-cursor="view">
      ${o?`<span class="badge num">-${o}%</span>`:""}${p.cat==="bundles"?`<span class="badge b2">باقة</span>`:""}
      <img class="main" src="${img(p)}" alt="${esc(p.ar)}" loading="lazy">${alt?`<img class="alt" src="${img(p,1)}" alt="" loading="lazy">`:""}
    </a>
    <button class="add" data-add="${p.id}" aria-label="أضف ${esc(p.ar)} للسلة">${ICON.plus}<span class="lbl">أضف للسلة</span></button></div>
    <div class="card-body">
      <span class="card-cat">${CATS[p.cat]}</span>
      <h3><a href="#p-${p.id}">${esc(p.ar)}</a></h3>
      <span class="var">${esc(p.variant)}</span>
      <div class="price"><b class="num">${money(p.sale)}</b>${p.reg>p.sale?`<s class="num">${fmt(p.reg)}</s>`:""}</div>
    </div></article>`;
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-add]");if(!b)return;e.preventDefault();
  const id=+b.dataset.add,qty=+(b.dataset.qty||1);addToCart(id,qty,b);
  if(b.classList.contains("add")){b.classList.add("done");b.innerHTML=ICON.check+'<span class="lbl">اتضاف</span>';setTimeout(()=>{b.classList.remove("done");b.innerHTML=ICON.plus+'<span class="lbl">أضف للسلة</span>';},1600);}
});

/* split headings into masked words */
function split(el){
  if(el.dataset.done)return;el.dataset.done=1;el.classList.add("split");
  const walk=n=>{[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){const parts=c.textContent.split(/(\s+)/);const f=document.createDocumentFragment();
      parts.forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return;}const w=document.createElement("span");w.className="w";w.innerHTML=`<span>${esc(t)}</span>`;f.appendChild(w);});c.replaceWith(f);}
    else if(c.nodeType===1&&!c.classList.contains("w"))walk(c);});};
  walk(el);
}

/* network canvas (echoes the logo mark) */
function netCanvas(cv){
  const g=cv.getContext("2d");let w,h,dpr,pts=[],mx=-999,my=-999,raf,alive=true;
  const N=innerWidth<700?34:70;
  function size(){dpr=Math.min(devicePixelRatio||1,2);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;g.setTransform(dpr,0,0,dpr,0,0);}
  size();for(let i=0;i<N;i++)pts.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()<.15?Math.random()*4+3:Math.random()*2+1});
  const host=cv.parentElement;host.addEventListener("pointermove",e=>{const r=cv.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;});host.addEventListener("pointerleave",()=>{mx=my=-999;});
  const ro=new ResizeObserver(size);ro.observe(cv);
  function tick(){if(!alive||!cv.isConnected){ro.disconnect();return;}raf=requestAnimationFrame(tick);g.clearRect(0,0,w,h);
    for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;
      const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);if(d<140){p.x+=dx/d*1.2;p.y+=dy/d*1.2;}}
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const a=pts[i],b=pts[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<150){g.strokeStyle=`rgba(127,168,255,${(1-d/150)*.35})`;g.lineWidth=1;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();}}
    for(const p of pts){const near=Math.hypot(p.x-mx,p.y-my)<180;g.fillStyle=near?"rgba(255,255,255,.95)":"rgba(169,196,255,.7)";g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill();}
    if(mx>0){for(const p of pts){const d=Math.hypot(p.x-mx,p.y-my);if(d<180){g.strokeStyle=`rgba(255,255,255,${(1-d/180)*.5})`;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(mx,my);g.stroke();}}}
  }
  if(reduce){tick();alive=false;}else tick();
}

/* ================= pages ================= */
const SHOP=P.filter(p=>p.cat!=="bundles").concat(P.filter(p=>p.cat==="bundles"));
const featured=[231855,231759,231737,231916,231689,231686,231925,231940];
function pageHome(){
  const top=[...P].filter(p=>p.cat!=="bundles");
  const maxOff=Math.max(...P.map(off));
  return `
  <section class="hero" data-hdr="dark">
    <canvas class="net"></canvas>
    <div class="wrap hero-grid">
      <div>
        <span class="eyebrow" style="color:#7FA8FF">Techi Smart Home · مصر</span>
        <h1 data-split style="margin-top:22px">بيتك <span class="ghost">بقى</span><br>بيفهمك.</h1>
        <p class="sub" data-fade>سويتشات وشاشات وكوالين وحساسات Zigbee، كلهم شغالين مع بعض في أبلكيشن واحد. احنا بنركّب، وانت بتتحكم.</p>
        <div class="ctas" data-fade>
          <a class="btn btn-light" href="#shop" data-magnetic>تسوّق الأجهزة ${ICON.arr}</a>
          <a class="btn btn-ghost" href="#experience" data-magnetic>جرّب البيت 3D</a>
        </div>
      </div>
      <div class="hero-visual" id="heroVis">
        <div class="chip-live"><b></b> 14 جهاز شغالين مع بعض</div>
        <a class="float f1" href="#p-231759" data-depth="30"><img src="${img(byId[231759])}" alt="شاشة تحكم"><span class="tag">شاشة 10.1"</span></a>
        <a class="float f2" href="#p-231855" data-depth="55"><img src="${img(byId[231855])}" alt="كالون ذكي"><span class="tag">كالون بكاميرا</span></a>
        <a class="float f3" href="#p-231737" data-depth="80"><img src="${img(byId[231737])}" alt="Echo Dot"><span class="tag">Echo Dot</span></a>
      </div>
    </div>
    <div class="scroll-hint"><i></i>SCROLL</div>
    <div class="marquee"><div class="track">${Array(2).fill(`<span>Zigbee 3.0</span><span>Tuya Smart</span><span>Amazon Alexa</span><span>Google Home</span><span>تركيب احترافي</span><span>TYSH</span><span>Value Mall · التجمع الخامس</span>`).join("")}</div></div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">تجربة تفاعلية</span><h2 data-split>جرّب بيتك قبل ما تشتري.</h2></div><p data-fade>دوس على أي رقم في الشقة وشوف الجهاز بيعمل إيه: النور بينور، والستارة بتتحرك، والكالون بيفتح، وحساس الغاز بيقفل المية.</p></div>
      ${frame3d(false)}
    </div>
  </section>

  <section class="sec band" style="padding-bottom:clamp(60px,8vw,110px)">
    <div class="wrap"><div class="sec-head"><div><span class="eyebrow">الأقسام</span><h2 data-split>كل اللي بيتك محتاجه.</h2></div><p data-fade>اسحب واكتشف الأقسام، كل قسم فيه أجهزة بتتربط مع بعض على نفس الأبلكيشن.</p></div></div>
    <div class="hscroll" id="hs"><div class="hs-track" id="hsTrack">
      ${Object.keys(CATS).map((k,i)=>{const n=P.filter(p=>p.cat===k).length;return `<a class="cat-panel" href="#${k==="bundles"?"bundles":"shop-"+k}" data-cursor="view"><span class="cn num">0${i+1} · ${n} منتج</span><div class="cimg"><img src="${img(byId[CAT_IMG[k]])}" alt="" loading="lazy"></div><div><h3>${CATS[k]}</h3><div class="go"><span>اكتشف</span><i>${ICON.arrUp}</i></div></div></a>`;}).join("")}
    </div></div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">عروض دلوقتي</span><h2 data-split>الأكثر طلبًا.</h2></div><a class="btn btn-ghost-ink" href="#shop" data-magnetic>كل المنتجات ${ICON.arr}</a></div>
      <div class="grid" data-stagger>${featured.map(id=>card(byId[id])).join("")}</div>
      <div class="stats" style="margin-top:clamp(60px,8vw,110px)">
        <div class="stat"><b class="num" data-count="${top.length}">0</b><span>جهاز في المتجر</span></div>
        <div class="stat"><b class="num" data-count="${maxOff}" data-suffix="%">0</b><span>أعلى خصم دلوقتي</span></div>
        <div class="stat"><b class="num" data-count="${P.filter(p=>p.cat==="bundles").length}">0</b><span>باقات جاهزة</span></div>
        <div class="stat"><b class="num" data-count="5" data-suffix=" سنين">0</b><span>ضمان باقة السويتشات والحساسات</span></div>
      </div>
    </div>
  </section>

  <section class="sec navy-band">
    <div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">الباقات</span><h2 data-split>بيت ذكي كامل، في باقة واحدة.</h2></div><p data-fade>باقات متظبطة لشقة أو فيلا، بسعر أقل من شراء كل جهاز لوحده.</p></div>
      <div class="stack" id="stack">${P.filter(p=>p.cat==="bundles").slice(0,4).map(bundleCard).join("")}</div>
    </div>
  </section>

  <section class="sec navy-band" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">إزاي بنشتغل</span><h2 data-split>من المعاينة لحد ما البيت يشتغل.</h2></div></div>
      <div class="steps" id="steps"><div class="line"><i></i></div>
        <div class="step"><div class="dot num">1</div><h4>معاينة</h4><p>بنزورك ونحدد أماكن السويتشات والحساسات والكالون.</p></div>
        <div class="step"><div class="dot num">2</div><h4>عرض سعر</h4><p>عرض واضح بالأجهزة والتركيب، أو باقة جاهزة تناسبك.</p></div>
        <div class="step"><div class="dot num">3</div><h4>تركيب</h4><p>تركيب احترافي على نفس العلب الموجودة.</p></div>
        <div class="step"><div class="dot num">4</div><h4>نظبط معاك</h4><p>نربط الأبلكيشن وAlexa ونعملك السيناريوهات.</p></div>
      </div>
    </div>
  </section>

  <section class="sec" style="padding-bottom:0">
    <div class="wrap"><div class="cta"><img class="mark" src="${src("logo-mark-white.png")}" alt="">
      <span class="eyebrow" style="color:#7FA8FF">Value Mall · التجمع الخامس</span>
      <h2 data-split>تعالى شوف الأجهزة شغالة.</h2>
      <p style="color:var(--on-navy-2);max-width:48ch" data-fade>زور الشوروم أو كلمنا على واتساب، وهنساعدك تختار اللي يناسب بيتك.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap" data-fade><a class="btn btn-light" href="${waLink("أهلاً Techi، عايز أعرف أكتر عن البيت الذكي")}" target="_blank" rel="noopener" data-magnetic>${ICON.wa} كلمنا على واتساب</a><a class="btn btn-ghost" href="#bundles" data-magnetic>شوف الباقات</a></div>
    </div></div>
  </section>`;
}
function bundleCard(p){
  const save=p.reg-p.sale;
  return `<article class="bundle" data-id="${p.id}">
    <a class="bimg" href="#p-${p.id}" data-cursor="view"><img src="${img(p)}" alt="${esc(p.ar)}" loading="lazy"></a>
    <div><span class="bv">${esc(p.variant)}</span><h3>${esc(p.ar)}</h3><p>${esc(p.pitch)}</p>
      <ul>${(p.items||[]).slice(0,8).map(([n,q])=>`<li><span>${esc(n)}</span>${q?`<b class="num">× ${q}</b>`:""}</li>`).join("")}</ul>
      <div class="bfoot"><span class="big num">${fmt(p.sale)} <small style="font-size:.4em;font-weight:500">ج.م</small><s>${fmt(p.reg)}</s></span>${save>0?`<span class="save num">وفّر ${fmt(save)} ج.م</span>`:""}</div>
      <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn btn-light" data-add="${p.id}" data-magnetic>أضف الباقة للسلة</button><a class="btn btn-ghost" href="#p-${p.id}">التفاصيل</a></div>
    </div></article>`;
}
function frame3d(full){
  return `<div class="t3d-frame${full?" full":""}" data-lenis-prevent data-hdr="dark">
    <div class="t3d-host" id="t3dHost"></div>
    <div class="t3d-ui">
      <div class="t3d-top">
        <div class="t3d-title">${full?`<h2>بيت Techi الذكي</h2><p>اسحب عشان تلف حوالين البيت، واعمل زووم، ودوس على أي رقم.</p>`:`<p class="t3d-hint">اسحب عشان تلف · دوس على الأرقام</p>`}</div>
        <div class="t3d-tools"><button class="glass-btn" data-day aria-pressed="false">☀ نهار</button><button class="glass-btn" data-pins aria-pressed="true">الأرقام</button><button class="glass-btn" data-home3d>البيت كله</button></div>
      </div>
      <div class="t3d-bottom">
        <div class="scenes3d"><button class="glass-btn" data-scene="sleep">تصبح على خير</button><button class="glass-btn" data-scene="away">خارج البيت</button><button class="glass-btn" data-scene="home">راجع البيت</button></div>
        <div class="dev-card" id="devCard" hidden></div>
      </div>
    </div>
  </div>`;
}
function mount3d(){
  const host=$("#t3dHost");if(!host)return;
  const frame=host.closest(".t3d-frame");
  if(!window.TechiHome){host.innerHTML=`<div class="t3d-fallback">الجهاز ده مش بيدعم الـ 3D. جرّب من متصفح تاني.</div>`;return;}
  TechiHome.mount(host);
  const dc=$("#devCard",frame);
  if(off3d)off3d();
  off3d=TechiHome.on((id,did)=>{if(!id)return;const pid=D3MAP[id];const p=byId[pid];const dv=TechiHome.devices.find(d=>d.id===id);
    dc.hidden=false;dc.innerHTML=`<img src="${img(p)}" alt=""><div><span class="r">${dv.room} · ${dv.name}</span><h4>${esc(p.ar)}</h4><div class="did">${esc(did)}</div></div>
      <div class="row"><span class="p num">${fmt(p.sale)} ج.م<small>${p.reg>p.sale?fmt(p.reg):""}</small></span><span style="display:flex;gap:6px"><a class="mini-add" style="background:#E6EBF3;color:var(--navy)" href="#p-${p.id}">التفاصيل</a><button class="mini-add" data-add="${p.id}">${ICON.plus.replace('<svg','<svg width="16" height="16"')} أضف</button></span></div>`;
    if(hasGsap&&!reduce)gsap.fromTo(dc,{y:20,opacity:0},{y:0,opacity:1,duration:.5,ease:"power3.out"});});
  frame.querySelectorAll("[data-scene]").forEach(b=>b.onclick=()=>{TechiHome.runScene(b.dataset.scene);frame.querySelectorAll("[data-scene]").forEach(x=>x.classList.toggle("run",x===b));setTimeout(()=>b.classList.remove("run"),2600);});
  const day=$("[data-day]",frame);day.onclick=()=>{const on=day.getAttribute("aria-pressed")!=="true";day.setAttribute("aria-pressed",on);day.textContent=on?"☾ ليل":"☀ نهار";TechiHome.setDay(on);};
  const pins=$("[data-pins]",frame);pins.onclick=()=>{const on=frame.classList.toggle("nopins");pins.setAttribute("aria-pressed",!on);};
  $("[data-home3d]",frame).onclick=()=>TechiHome.home();
}
let off3d=null;

function pageShop(cat){
  const counts=Object.fromEntries(Object.keys(CATS).map(k=>[k,P.filter(p=>p.cat===k).length]));
  return `<section class="phead" data-hdr="dark"><canvas class="net"></canvas><div class="wrap"><span class="eyebrow" style="color:#7FA8FF">المتجر</span><h1 data-split>كل الأجهزة.</h1><p data-fade>${P.length} منتج من TYSH وAmazon، كلهم شغالين على Tuya وبيتربطوا ببعض.</p></div></section>
  <section class="wrap" style="padding-bottom:40px">
    <div class="toolbar">
      <div class="chips" id="chips"><button data-c="all" class="${cat?"":"on"}">الكل<sup class="num">${P.length}</sup></button>${Object.keys(CATS).map(k=>`<button data-c="${k}" class="${cat===k?"on":""}">${CATS[k]}<sup class="num">${counts[k]}</sup></button>`).join("")}</div>
      <div class="tsearch"><input id="q" type="search" placeholder="دوّر على جهاز…" aria-label="بحث"><select id="sort" aria-label="ترتيب"><option value="pop">الأكثر طلبًا</option><option value="lo">السعر: الأقل</option><option value="hi">السعر: الأعلى</option><option value="off">أعلى خصم</option></select></div>
    </div>
    <div class="grid" id="shopGrid">${SHOP.map(card).join("")}</div>
    <p class="empty" id="empty" hidden>مالقيناش حاجة بالاسم ده. جرّب كلمة تانية.</p>
  </section>`;
}
function initShop(cat){
  let c=cat||"all";const grid=$("#shopGrid");const order=SHOP.map(p=>p.id);
  function apply(animate){
    const q=$("#q").value.trim().toLowerCase(),s=$("#sort").value;
    const state=animate&&hasGsap&&window.Flip&&!reduce?Flip.getState(".card",{props:"opacity"}):null;
    const cards=$$(".card",grid);
    cards.forEach(el=>{const p=byId[+el.dataset.id];const ok=(c==="all"||p.cat===c)&&(!q||(p.ar+" "+p.en+" "+p.variant).toLowerCase().includes(q));el.hidden=!ok;});
    const sorted=cards.sort((a,b)=>{const A=byId[+a.dataset.id],B=byId[+b.dataset.id];
      return s==="lo"?A.sale-B.sale:s==="hi"?B.sale-A.sale:s==="off"?off(B)-off(A):order.indexOf(A.id)-order.indexOf(B.id);});
    sorted.forEach(el=>grid.appendChild(el));
    $("#empty").hidden=cards.some(el=>!el.hidden);
    if(state)Flip.from(state,{duration:.7,ease:"power3.inOut",scale:true,absolute:true,stagger:.02,onEnter:els=>gsap.fromTo(els,{opacity:0,scale:.85},{opacity:1,scale:1,duration:.5}),onLeave:els=>gsap.to(els,{opacity:0,scale:.85,duration:.4})});
  }
  $("#chips").onclick=e=>{const b=e.target.closest("button");if(!b)return;c=b.dataset.c;$$("#chips button").forEach(x=>x.classList.toggle("on",x===b));history.replaceState(null,"",c==="all"?"#shop":"#shop-"+c);apply(true);};
  $("#q").oninput=()=>apply(true);$("#sort").onchange=()=>apply(true);
  apply(false);
}
function pageBundles(){
  const b=P.filter(p=>p.cat==="bundles");
  return `<section class="phead" data-hdr="dark"><canvas class="net"></canvas><div class="wrap"><span class="eyebrow" style="color:#7FA8FF">الباقات</span><h1 data-split>باقات جاهزة لبيتك.</h1><p data-fade>${b.length} باقات متظبطة، من الشقة الصغيرة لحد البيت الكامل، وكلها أرخص من شراء كل جهاز لوحده.</p></div></section>
  <section class="sec navy-band" style="padding-top:60px"><div class="wrap"><div class="stack" id="stack">${b.map(bundleCard).join("")}</div></div></section>`;
}
function pageProduct(id){
  const p=byId[id];if(!p)return pageShop();
  const o=off(p);const d3=Object.keys(D3MAP).find(k=>D3MAP[k]===p.id);
  const rel=P.filter(x=>x.cat===p.cat&&x.id!==p.id).concat(P.filter(x=>x.cat!==p.cat&&x.cat!=="bundles")).slice(0,4);
  return `<section class="pp wrap">
    <nav class="crumbs" aria-label="المسار"><a href="#home">الرئيسية</a>/<a href="#${p.cat==="bundles"?"bundles":"shop-"+p.cat}">${CATS[p.cat]}</a>/<span>${esc(p.ar)}</span></nav>
    <div class="pp-grid">
      <div class="gal">
        <div class="gal-main" id="galMain" data-cursor="zoom">${o?`<span class="badge num">-${o}%</span>`:""}<img id="galImg" src="${img(p)}" alt="${esc(p.ar)}"></div>
        ${p.imgs.length>1?`<div class="thumbs" id="thumbs">${p.imgs.map((f,i)=>`<button class="${i?"":"on"}" data-i="${i}" aria-label="صورة ${i+1}"><img src="${src(f)}" alt=""></button>`).join("")}</div>`:""}
      </div>
      <div class="pinfo">
        <span class="pc" data-fade>${CATS[p.cat]} · ${esc(p.variant)}</span>
        <h1 data-split>${esc(p.ar)}</h1>
        <div class="en" data-fade>${esc(p.en)}</div>
        <div class="pbig" data-fade><b class="num">${money(p.sale)}</b>${p.reg>p.sale?`<s class="num">${fmt(p.reg)} ج.م</s><span class="save" style="background:color-mix(in srgb,var(--ok) 15%,transparent);color:var(--ok)">وفّر ${fmt(p.reg-p.sale)} ج.م</span>`:""}</div>
        <p class="lead" data-fade>${esc(p.pitch)}</p>
        ${p.feat?`<ul class="feat" data-fade>${p.feat.map(f=>`<li><i>${ICON.check.replace("<svg",'<svg width="14" height="14"')}</i>${esc(f)}</li>`).join("")}</ul>`:""}
        ${p.items?`<ul class="feat" data-fade>${p.items.map(([n,q])=>`<li><i>${ICON.check.replace("<svg",'<svg width="14" height="14"')}</i>${esc(n)}${q?` <b class="num" style="margin-inline-start:auto">× ${q}</b>`:""}</li>`).join("")}</ul>`:""}
        <div class="buy" data-fade>
          <div class="qty"><button id="qm" aria-label="قلل">−</button><span class="num" id="qv">1</span><button id="qp" aria-label="زوّد">+</button></div>
          <button class="btn btn-navy" id="ppAdd" data-add="${p.id}" data-qty="1" data-magnetic>أضف للسلة ${ICON.plus.replace("<svg",'<svg width="18" height="18"')}</button>
          <a class="btn btn-wa" href="${waLink("أهلاً Techi، عايز أطلب: "+p.ar+" ("+p.variant+")")}" target="_blank" rel="noopener">${ICON.wa} اطلب على واتساب</a>
        </div>
        ${d3?`<a class="btn btn-ghost-ink" href="#experience-${d3}" style="justify-self:start" data-fade>شوفه شغال في البيت 3D ${ICON.arr}</a>`:""}
        <div class="perks" data-fade><div><b>تركيب احترافي</b><span>فريقنا بيركّب ويظبط</span></div><div><b>شوروم</b><span>Value Mall، التجمع الخامس</span></div><div><b>Tuya</b><span>أبلكيشن واحد لكل البيت</span></div></div>
        ${p.specs&&p.specs.length?`<div class="specs" data-fade><details open><summary>المواصفات <i>${ICON.plus.replace("<svg",'<svg width="18" height="18"')}</i></summary><table>${p.specs.map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table></details></div>`:""}
      </div>
    </div>
  </section>
  <section class="sec"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">ممكن يعجبك</span><h2 data-split>أجهزة بتشتغل معاه.</h2></div></div><div class="grid" data-stagger>${rel.map(card).join("")}</div></div></section>`;
}
function initProduct(id){
  const p=byId[id];if(!p)return;let q=1;
  const setQ=v=>{q=Math.max(1,Math.min(20,v));$("#qv").textContent=q;$("#ppAdd").dataset.qty=q;};
  $("#qm").onclick=()=>setQ(q-1);$("#qp").onclick=()=>setQ(q+1);
  const main=$("#galMain"),gi=$("#galImg");
  $("#thumbs")&&($("#thumbs").onclick=e=>{const b=e.target.closest("button");if(!b)return;$$("#thumbs button").forEach(x=>x.classList.toggle("on",x===b));
    const s2=src(p.imgs[+b.dataset.i]);if(hasGsap)gsap.to(gi,{opacity:0,scale:.96,duration:.2,onComplete:()=>{gi.src=s2;gsap.to(gi,{opacity:1,scale:1,duration:.45,ease:"power3.out"});}});else gi.src=s2;});
  main.addEventListener("pointermove",e=>{const r=main.getBoundingClientRect();gi.style.transformOrigin=`${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%`;});
  main.addEventListener("click",()=>main.classList.toggle("zoom"));main.addEventListener("pointerleave",()=>main.classList.remove("zoom"));
}
function pageExperience(){
  return `<section class="xp" data-hdr="dark">${frame3d(true)}</section>
  <section class="sec"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">الأجهزة في البيت</span><h2 data-split>كل رقم في البيت، منتج تقدر تطلبه.</h2></div><p data-fade>دوس على أي جهاز هنا والكاميرا هتروحله وتشغّله.</p></div>
    <div class="xp-list" data-stagger>${(window.TechiHome?TechiHome.devices:[]).map(d=>{const p=byId[D3MAP[d.id]];return `<button class="xp-item" data-dev="${d.id}"><img src="${img(p)}" alt=""><span><b>${d.name}</b><small>${d.room} · ${fmt(p.sale)} ج.م</small></span><span class="n num">${d.n}</span></button>`;}).join("")}</div>
  </div></section>`;
}
function initExperience(dev){
  $$(".xp-item").forEach(b=>b.onclick=()=>{(lenis?lenis.scrollTo(0,{duration:1.2}):scrollTo({top:0,behavior:"smooth"}));setTimeout(()=>TechiHome.activate(b.dataset.dev,true),reduce?0:700);});
  if(dev&&window.TechiHome)setTimeout(()=>TechiHome.activate(dev,true),1600);
}
function pageAbout(){
  return `<section class="phead" data-hdr="dark"><canvas class="net"></canvas><div class="wrap"><span class="eyebrow" style="color:#7FA8FF">مين احنا</span><h1 data-split>Techi.</h1><p data-fade>شركة مصرية للبيوت الذكية، والشوروم بتاعنا في Value Mall بالتجمع الخامس.</p></div></section>
  <section class="sec"><div class="wrap about-grid">
    <p class="big-p" data-fade>بنختار أجهزة TYSH وAmazon اللي شغالة على Tuya وZigbee 3.0، وبنركّبها ونظبطها لحد ما بيتك كله يبقى في أبلكيشن واحد.</p>
    <div class="info-cards" style="grid-template-columns:1fr">
      <div data-fade><b>الشوروم</b><span>Value Mall، التجمع الخامس، القاهرة الجديدة</span></div>
      <div data-fade><b>التركيب</b><span>تركيب احترافي على نفس العلب، ونظبط معاك الأبلكيشن وAlexa.</span></div>
      <div data-fade><b>الضمان</b><span>باقة السويتشات والحساسات عليها ضمان 5 سنين.</span></div>
    </div>
  </div></section>
  <section class="sec" style="padding-top:0"><div class="wrap"><div class="cta"><img class="mark" src="${src("logo-mark-white.png")}" alt=""><h2 data-split>عندك سؤال؟</h2><div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-light" href="${waLink("أهلاً Techi")}" target="_blank" rel="noopener" data-magnetic>${ICON.wa} كلمنا على واتساب</a></div></div></div></section>`;
}

/* ================= motion per page ================= */
function animatePage(){
  $$("canvas.net").forEach(netCanvas);
  $$("[data-split]").forEach(split);
  if(!hasGsap||reduce){$$("[data-count]").forEach(el=>el.textContent=el.dataset.count+(el.dataset.suffix||""));return;}
  // hero intro
  const hero=$(".hero,.phead");
  if(hero){
    const tl=gsap.timeline({delay:.15});
    tl.from($$("[data-split] .w>span",hero),{yPercent:115,rotate:6,duration:1.1,ease:"expo.out",stagger:.06})
      .from($$("[data-fade]",hero),{y:30,opacity:0,duration:.9,ease:"power3.out",stagger:.1},"-=.7")
      .from($$(".float",hero),{y:120,opacity:0,rotate:i=>[-8,6,10][i],duration:1.3,ease:"expo.out",stagger:.12},"-=1")
      .from($$(".chip-live",hero),{scale:.6,opacity:0,duration:.6,ease:"back.out(2)"},"-=.6");
  }
  // section headings
  $$("[data-split]").filter(el=>!el.closest(".hero,.phead")).forEach(el=>{
    gsap.from($$(".w>span",el),{yPercent:115,rotate:4,duration:1,ease:"expo.out",stagger:.05,scrollTrigger:{trigger:el,start:"top 88%"}});});
  $$("[data-fade]").filter(el=>!el.closest(".hero,.phead")).forEach(el=>{
    gsap.from(el,{y:40,opacity:0,duration:1,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 90%"}});});
  $$("[data-stagger]").forEach(g=>{gsap.from(g.children,{y:70,opacity:0,duration:1,ease:"power3.out",stagger:.08,scrollTrigger:{trigger:g,start:"top 85%"}});});
  const sg=$("#shopGrid");if(sg)gsap.from(sg.children,{y:60,opacity:0,duration:.9,ease:"power3.out",stagger:.05,delay:.4});
  $$(".pp .gal-main").forEach(el=>gsap.from(el,{scale:.9,opacity:0,duration:1.2,ease:"expo.out",delay:.1}));
  // 3D frame reveal
  $$(".t3d-frame:not(.full)").forEach(f=>gsap.from(f,{clipPath:"inset(12% 8% 12% 8% round 40px)",duration:1.4,ease:"expo.out",scrollTrigger:{trigger:f,start:"top 80%"}}));
  // counters
  $$("[data-count]").forEach(el=>{const o={v:0};gsap.to(o,{v:+el.dataset.count,duration:2,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 90%"},onUpdate:()=>el.textContent=Math.round(o.v)+(el.dataset.suffix||"")});});
  // marquee with scroll velocity
  const tr=$(".marquee .track");if(tr){const w=tr.scrollWidth/2;const mq=gsap.to(tr,{x:-w,duration:28,ease:"none",repeat:-1});
    ScrollTrigger.create({trigger:tr,start:"top bottom",end:"bottom top",onUpdate:s=>{const v=s.getVelocity()/300;gsap.to(mq,{timeScale:v<0?-1-Math.abs(v)*.2:1+v*.2,duration:.4,overwrite:true});}});}
  // hero parallax + mouse depth
  const hv=$("#heroVis");if(hv){gsap.to(hv,{yPercent:18,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});
    $$(".float",hv).forEach((f,i)=>gsap.to(f,{y:"+=14",rotation:i%2?1.5:-1.5,duration:2.6+i*.4,ease:"sine.inOut",yoyo:true,repeat:-1}));
    if(matchMedia("(hover:hover)").matches){const qs=$$(".float",hv).map(f=>({x:gsap.quickTo(f,"x",{duration:.9,ease:"power3"}),y:gsap.quickTo(f,"y",{duration:.9,ease:"power3"}),d:+f.dataset.depth}));
      $(".hero").addEventListener("pointermove",e=>{const nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;qs.forEach(q=>{q.x(nx*q.d);});});}}
  // horizontal categories
  const hs=$("#hs"),track=$("#hsTrack");
  if(hs&&innerWidth>900){const dist=()=>track.scrollWidth-innerWidth;
    gsap.to(track,{x:()=>dist(),ease:"none",scrollTrigger:{trigger:hs,start:"center center",end:()=>"+="+dist(),pin:true,scrub:1,invalidateOnRefresh:true}});}
  // bundle stack: previous cards shrink
  const stack=$("#stack");if(stack&&innerWidth>860){const cards=$$(".bundle",stack);cards.forEach((c,i)=>{if(i===cards.length-1)return;
    gsap.to(c,{scale:.92,filter:"brightness(.55)",ease:"none",scrollTrigger:{trigger:cards[i+1],start:"top bottom",end:"top 120px",scrub:true}});});}
  // steps progress
  const st=$("#steps");if(st){const ln=$(".line i",st);const steps=$$(".step",st);
    gsap.to(ln,{scaleX:1,ease:"none",scrollTrigger:{trigger:st,start:"top 75%",end:"bottom 55%",scrub:true,onUpdate:s=>steps.forEach((x,i)=>x.classList.toggle("on",s.progress>=i/(steps.length-1)-.02))}});
    gsap.from(steps,{y:40,opacity:0,stagger:.12,duration:.9,ease:"power3.out",scrollTrigger:{trigger:st,start:"top 80%"}});}
  // CTA mark spin
  $$(".cta .mark").forEach(m=>gsap.to(m,{rotation:40,ease:"none",scrollTrigger:{trigger:m,start:"top bottom",end:"bottom top",scrub:true}}));
  // footer giant word
  gsap.from(".foot .big-word",{yPercent:40,opacity:0,ease:"none",scrollTrigger:{trigger:".foot",start:"top bottom",end:"bottom bottom",scrub:true}});
  magnetic();
}
function magnetic(){
  if(!matchMedia("(hover:hover)").matches||!hasGsap)return;
  $$("[data-magnetic]").forEach(el=>{if(el.dataset.mg)return;el.dataset.mg=1;const xT=gsap.quickTo(el,"x",{duration:.6,ease:"elastic.out(1,.4)"}),yT=gsap.quickTo(el,"y",{duration:.6,ease:"elastic.out(1,.4)"});
    el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect();xT((e.clientX-r.left-r.width/2)*.3);yT((e.clientY-r.top-r.height/2)*.4);});
    el.addEventListener("pointerleave",()=>{xT(0);yT(0);});});
}

/* ================= router + transitions ================= */
function parse(){const h=(location.hash||"#home").slice(1);
  if(h.startsWith("p-"))return{r:"product",id:+h.slice(2)};
  if(h.startsWith("shop-"))return{r:"shop",cat:h.slice(5)};
  if(h.startsWith("experience-"))return{r:"experience",dev:h.slice(11)};
  if(["home","shop","bundles","experience","about"].includes(h))return{r:h};
  return{r:"home"};}
let first=true,busy=false,pending=false,ctx=null;
function render(){
  const R=parse();const app=$("#app");
  if(hasGsap){if(ctx)ctx.revert();ScrollTrigger.getAll().forEach(t=>t.kill());}
  if(window.TechiHome)TechiHome.unmount();
  app.innerHTML=R.r==="shop"?pageShop(R.cat):R.r==="bundles"?pageBundles():R.r==="product"?pageProduct(R.id):R.r==="experience"?pageExperience():R.r==="about"?pageAbout():pageHome();
  $$(".nav a").forEach(a=>a.classList.toggle("on",a.dataset.r===(R.r==="product"?"shop":R.r)));
  document.title=R.r==="product"&&byId[R.id]?`${byId[R.id].ar} · Techi`:"Techi Smart Home";
  if(lenis)lenis.scrollTo(0,{immediate:true});else scrollTo(0,0);
  if(R.r==="shop")initShop(R.cat);
  if(R.r==="product")initProduct(R.id);
  mount3d();
  if(R.r==="experience")initExperience(R.dev);
  if(hasGsap)ctx=gsap.context(animatePage);else animatePage();
  hdrState();
  if(hasGsap)requestAnimationFrame(()=>ScrollTrigger.refresh());
}
function go(){
  if(first||!hasGsap||reduce){first=false;render();return;}
  if(busy){pending=true;return;}busy=true;
  const bars=$$("#wipe i"),logo=$("#wipe .wlogo");
  gsap.timeline({onComplete:()=>{busy=false;if(pending){pending=false;go();}}})
    .set(bars,{transformOrigin:"bottom"})
    .to(bars,{scaleY:1,duration:.55,ease:"power4.inOut",stagger:.06})
    .to(logo,{opacity:1,duration:.3},"-=.25")
    .add(()=>{render();})
    .to(logo,{opacity:0,duration:.25},"+=.15")
    .set(bars,{transformOrigin:"top"})
    .to(bars,{scaleY:0,duration:.6,ease:"power4.inOut",stagger:.06});
}
addEventListener("hashchange",()=>{closeCart();closeMenu();go();});

/* header: transparent over dark heroes, hides on scroll down */
let lastY=0;
function hdrState(){const y=scrollY;const hdr=$("#hdr");
  const overDark=$$("[data-hdr=dark]").some(el=>{const r=el.getBoundingClientRect();return r.top<=40&&r.bottom>=40;});
  hdr.classList.toggle("solid",!overDark);
  hdr.classList.toggle("hide",y>lastY&&y>300&&!$("#drawer").classList.contains("on"));lastY=y;}
addEventListener("scroll",hdrState,{passive:true});

/* mobile menu */
function openMenu(){const m=$("#mmenu");m.hidden=false;lenis&&lenis.stop();
  if(hasGsap){gsap.fromTo(m,{clipPath:"circle(0% at 8% 4%)"},{clipPath:"circle(150% at 8% 4%)",duration:.9,ease:"power4.inOut"});gsap.from($$("#mmenu a span"),{yPercent:110,duration:.8,ease:"expo.out",stagger:.06,delay:.3});}
  else m.style.clipPath="none";}
function closeMenu(){const m=$("#mmenu");if(m.hidden)return;lenis&&lenis.start();if(hasGsap)gsap.to(m,{clipPath:"circle(0% at 8% 4%)",duration:.6,ease:"power4.inOut",onComplete:()=>m.hidden=true});else m.hidden=true;}
$("#menuBtn").onclick=openMenu;$("#menuClose").onclick=closeMenu;

/* cursor */
if(matchMedia("(hover:hover) and (pointer:fine)").matches&&hasGsap&&!reduce){
  const c=$("#cur"),r=$("#curRing");const cx=gsap.quickTo(c,"x",{duration:.15}),cy=gsap.quickTo(c,"y",{duration:.15}),rx=gsap.quickTo(r,"x",{duration:.5,ease:"power3"}),ry=gsap.quickTo(r,"y",{duration:.5,ease:"power3"});
  addEventListener("pointermove",e=>{document.body.classList.add("cur-on");cx(e.clientX);cy(e.clientY);rx(e.clientX);ry(e.clientY);});document.addEventListener("pointerleave",()=>document.body.classList.remove("cur-on"));
  document.addEventListener("pointerover",e=>{r.classList.toggle("big",!!e.target.closest("a,button,[data-cursor],.t3d-canvas"));});
}else{$("#cur").hidden=true;$("#curRing").hidden=true;}

/* preloader: draw the logo's network */
const NODES=[[185,25,22],[252,73,11],[357,113,11],[292,158,16],[180,158,23],[25,192,24],[102,245,21],[200,252,34],[345,245,11],[430,192,18],[517,265,17],[285,288,11],[430,326,18],[160,353,16],[322,352,18],[52,381,16],[202,407,16],[452,415,34],[272,505,34]];
const DOTS=[[320,18,6],[325,76,11],[408,54,8],[446,106,10],[536,169,13]];
const EDGES=[[0,1],[0,4],[0,5],[1,4],[1,3],[4,3],[4,5],[4,6],[4,8],[3,7],[3,2],[2,9],[2,8],[9,8],[9,12],[8,11],[8,14],[8,12],[6,7],[6,13],[6,15],[5,15],[7,11],[7,13],[13,11],[11,16],[11,18],[11,14],[13,15],[15,16],[15,18],[16,18],[14,18],[14,12],[12,10],[12,17],[17,18]];
function buildMark(svg,color){
  const ns="http://www.w3.org/2000/svg";let h="";
  h+=`<path d="M185,25 A245,245 0 0 0 52,381" stroke="${color}" stroke-width="3" class="ln"/><path d="M52,381 Q150,492 272,505 Q390,490 452,415" stroke="${color}" stroke-width="3" class="ln"/><path d="M517,265 Q505,360 452,415" stroke="${color}" stroke-width="3" class="ln"/>`;
  EDGES.forEach(([a,b])=>{h+=`<line x1="${NODES[a][0]}" y1="${NODES[a][1]}" x2="${NODES[b][0]}" y2="${NODES[b][1]}" stroke="${color}" stroke-width="3" class="ln"/>`;});
  NODES.concat(DOTS).forEach(([x,y,r])=>{h+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" class="nd"/>`;});
  svg.innerHTML=h;
}
function boot(){
  $("#yr").textContent=new Date().getFullYear();
  $("#footWa").href=waLink("أهلاً Techi");
  renderCart();
  if(hasGsap&&window.Lenis&&!reduce){lenis=new Lenis({lerp:.1,smoothWheel:true});lenis.on("scroll",ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);}
  const pre=$("#pre");
  if(!hasGsap||reduce){pre.remove();render();return;}
  const svg=$("#preMark");buildMark(svg,"#ffffff");
  $$(".ln",svg).forEach(l=>{const L=l.getTotalLength?l.getTotalLength():400;l.style.strokeDasharray=L;l.style.strokeDashoffset=L;});
  const o={v:0};
  gsap.timeline()
    .from($$(".nd",svg),{scale:0,transformOrigin:"center",transformBox:"fill-box",duration:.6,ease:"back.out(3)",stagger:{each:.025,from:"random"}})
    .to($$(".ln",svg),{strokeDashoffset:0,duration:1.1,ease:"power2.inOut",stagger:.012},"-=.5")
    .to(o,{v:100,duration:1.8,ease:"power2.inOut",onUpdate:()=>{$("#preNum").textContent=Math.round(o.v);$("#preBar").style.transform=`scaleX(${o.v/100})`;}},0)
    .add(()=>render())
    .to(".pre-in",{y:-40,opacity:0,duration:.5,ease:"power3.in"})
    .to(pre,{yPercent:-100,duration:1,ease:"expo.inOut",onComplete:()=>pre.remove()},"-=.15");
}
boot();
})();
