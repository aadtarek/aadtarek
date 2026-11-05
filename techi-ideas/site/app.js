/* Techi storefront v2 — "the site is a smart home" */
(function(){
"use strict";
const WA_NUMBER="201000000000"; // TODO: رقم واتساب الشركة بصيغة دولية من غير +
const P=window.TECHI_PRODUCTS||[];
const byId=Object.fromEntries(P.map(p=>[p.id,p]));
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const hasGsap=!!window.gsap;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
if(hasGsap){gsap.registerPlugin(ScrollTrigger);if(window.Flip)gsap.registerPlugin(Flip);}
const CATS={screens:"شاشات التحكم",switches:"السويتشات والبرايز",security:"الأمان والحساسات",voice:"التحكم والصوت",bundles:"الباقات"};
const CAT_EN={screens:"Screens",switches:"Switches",security:"Security",voice:"Voice & Hub",bundles:"Suites"};
const CAT_IMG={screens:231759,switches:231686,security:231855,voice:231737,bundles:231792};
const D3MAP={light_living:231840,light_kitchen:231840,light_bedroom:231840,curtain_living:231686,curtain_bed:231711,ac:231783,socket:231689,hub:231933,echo:231737,panel:231759,lock:231855,motion:231925,gas:231916,valve:231940};
const GHOST={231855:"LOCK",231759:"PANEL",231737:"ECHO",231916:"GAS",231689:"SOCKET",231686:"CURTAIN",231925:"MOTION",231940:"VALVE"};
const SHOP=P.filter(p=>p.cat!=="bundles").concat(P.filter(p=>p.cat==="bundles"));
const fmt=n=>n.toLocaleString("en-US");
const money=n=>`${fmt(n)}<span class="cur-l">ج.م</span>`;
const off=p=>p.reg>p.sale?Math.round((1-p.sale/p.reg)*100):0;
const src=f=>(window.TECHI_IMG&&window.TECHI_IMG[f])||"img/"+f;
const img=(p,i=0)=>src(p.imgs[i]||p.imgs[0]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pad=n=>String(n).padStart(2,"0");
const waLink=t=>`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;
const btxt=t=>`<span class="bt"><span>${t}</span><span>${t}</span></span>`;
const ICON={
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  arr:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  arrUp:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7L7 17M8 7h9v9"/></svg>',
  wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>'
};

/* ================= living background (WebGL) ================= */
const BG={lux:0,mx:.5,my:.5};
(function bgShader(){
  const c=$("#bg");let gl=null;try{gl=c.getContext("webgl",{antialias:false,alpha:false,powerPreference:"low-power"});}catch(e){}
  if(!gl||reduce){c.classList.add("fallback");return;}
  const vs="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const fs=`precision mediump float;uniform vec2 r;uniform float t,lux;uniform vec2 m;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
  void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
    float q=fb(p*1.3+vec2(t*.02,-t*.015));float w=fb(p*2.2+q*1.8+vec2(-t*.03,t*.02));
    vec3 col=vec3(0.,.016,.07);
    col=mix(col,vec3(.004,.07,.19),smoothstep(.25,.85,w));
    col+=vec3(.25,.42,.9)*pow(smoothstep(.55,.95,w),3.)*.22;
    vec2 mm=(m*r-.5*r)/r.y;float d=length(p-mm);col+=vec3(.3,.45,.9)*exp(-d*d*5.)*.07;
    float beam=exp(-pow((p.x+.25-p.y*.35)*2.2,2.))*smoothstep(-.6,.6,p.y);
    col+=vec3(1.,.82,.58)*lux*(beam*.16+exp(-pow(p.y-.55,2.)*3.)*.05);
    col*=1.-.6*dot(uv-.5,uv-.5)*1.6;
    col+=(h(gl_FragCoord.xy+t)-.5)*.012;
    gl_FragColor=vec4(col,1.);}`;
  const sh=(type,s)=>{const o=gl.createShader(type);gl.shaderSource(o,s);gl.compileShader(o);return o;};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){c.classList.add("fallback");return;}
  gl.useProgram(pr);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,"p");gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const U={r:gl.getUniformLocation(pr,"r"),t:gl.getUniformLocation(pr,"t"),lux:gl.getUniformLocation(pr,"lux"),m:gl.getUniformLocation(pr,"m")};
  const S=.5;function size(){c.width=Math.max(1,innerWidth*S);c.height=Math.max(1,innerHeight*S);gl.viewport(0,0,c.width,c.height);}
  addEventListener("resize",size);size();
  let last=0,t0=performance.now(),sm={x:.5,y:.5};
  (function loop(now){requestAnimationFrame(loop);if(document.hidden||now-last<33)return;last=now;
    sm.x+=(BG.mx-sm.x)*.06;sm.y+=(BG.my-sm.y)*.06;
    gl.uniform2f(U.r,c.width,c.height);gl.uniform1f(U.t,(now-t0)/1000);gl.uniform1f(U.lux,BG.lux);gl.uniform2f(U.m,sm.x,1-sm.y);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);})(0);
})();
addEventListener("pointermove",e=>{BG.mx=e.clientX/innerWidth;BG.my=e.clientY/innerHeight;},{passive:true});

/* ================= cart ================= */
const store={get(){try{return JSON.parse(localStorage.getItem("techi-cart")||"[]");}catch(e){return [];}},set(v){try{localStorage.setItem("techi-cart",JSON.stringify(v));}catch(e){}}};
let cart=store.get().filter(i=>byId[i.id]);
function saveCart(){store.set(cart);renderCart();}
function addToCart(id,qty=1,fromEl){
  const it=cart.find(i=>i.id===id);if(it)it.qty+=qty;else cart.push({id,qty});saveCart();
  const p=byId[id];flyToCart(fromEl,p);
  toast(`<small>اتضاف للسلة</small><span>${esc(p.ar)}</span>`,img(p));
  if(hasGsap)gsap.fromTo("#cartCount",{scale:1},{scale:1.5,duration:.2,yoyo:true,repeat:1,ease:"power2.out"});
}
function cartTotals(){let t=0,s=0,c=0;cart.forEach(i=>{const p=byId[i.id];t+=p.sale*i.qty;s+=(p.reg-p.sale)*i.qty;c+=i.qty;});return{t,s,c};}
function orderText(){const {t}=cartTotals();return "أهلاً Techi، عايز أطلب:\n"+cart.map(i=>`• ${byId[i.id].ar} (${byId[i.id].variant}) × ${i.qty} = ${fmt(byId[i.id].sale*i.qty)} ج.م`).join("\n")+`\n\nالإجمالي: ${fmt(t)} ج.م`;}
function renderCart(){
  const {t,s,c}=cartTotals();$("#cartCount").textContent=c;$("#drawerN").textContent=c?`(${c})`:"";
  const list=$("#cartList"),foot=$("#cartFoot");
  if(!cart.length){list.innerHTML=`<div class="dempty"><span class="serif">Empty, for now.</span><span>ابدأ بأي جهاز، وكل حاجة بتتربط ببعض بعدين.</span><a class="btn btn-white" href="#shop" data-close>${btxt("اكتشف المجموعة")}</a></div>`;foot.innerHTML="";return;}
  list.innerHTML=cart.map(i=>{const p=byId[i.id];return `<div class="ci" data-id="${p.id}"><img src="${img(p)}" alt=""><div><h4>${esc(p.ar)}</h4><div class="cv">${esc(p.variant)}</div><div class="q"><button data-q="-1" aria-label="قلل">−</button><span class="num">${i.qty}</span><button data-q="1" aria-label="زوّد">+</button><button class="rm" data-rm>شيل</button></div></div><div class="lp num">${fmt(p.sale*i.qty)}</div></div>`;}).join("");
  foot.innerHTML=`${s?`<div class="r s"><span>وفّرت</span><span class="num">${fmt(s)} ج.م</span></div>`:""}<div class="r t"><span>الإجمالي</span><span class="num">${fmt(t)} ج.م</span></div>
   <a class="btn btn-wa" href="${waLink(orderText())}" target="_blank" rel="noopener">${ICON.wa}${btxt("اطلب على واتساب")}</a>
   <details><summary style="cursor:pointer;font-size:.85rem;color:var(--dim)">نص الطلب لو واتساب ما فتحش</summary><div class="order-msg">${esc(orderText())}</div></details>`;
}
$("#cartList").addEventListener("click",e=>{
  if(e.target.closest("[data-close]")){closeCart();return;}
  const row=e.target.closest(".ci");if(!row)return;const id=+row.dataset.id;const it=cart.find(i=>i.id===id);
  if(e.target.closest("[data-rm]")){cart=cart.filter(i=>i.id!==id);}else{const q=e.target.closest("[data-q]");if(!q)return;it.qty+= +q.dataset.q;if(it.qty<1)cart=cart.filter(i=>i.id!==id);}saveCart();});
let lenis=null;
function openCart(){$("#drawer").classList.add("on");$("#scrim").classList.add("on");lenis&&lenis.stop();
  if(hasGsap&&!reduce)gsap.from("#cartList>*",{x:-60,opacity:0,stagger:.07,duration:.8,ease:"expo.out",delay:.2});}
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
  const t=document.createElement("div");t.className="toast"+(alert?" alert":"");
  t.innerHTML=`<div class="ti">${image?`<img src="${image}" alt="">`:alert?"!":`<img src="${src("logo-navy.png")}" alt="">`}</div><div>${html}</div>`;
  $("#toasts").prepend(t);
  if(hasGsap){gsap.from(t,{y:40,opacity:0,filter:"blur(8px)",duration:.7,ease:"expo.out"});gsap.to(t,{y:20,opacity:0,filter:"blur(8px)",duration:.5,delay:3.4,onComplete:()=>t.remove()});}
  else setTimeout(()=>t.remove(),3800);
}
addEventListener("techi:notify",e=>toast(`<small>Techi Home · دلوقتي</small><span>${esc(e.detail.msg)}</span>`,null,e.detail.alert));
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-add]");if(!b)return;e.preventDefault();
  addToCart(+b.dataset.add,+(b.dataset.qty||1),b);
  if(b.classList.contains("add")){b.classList.add("done");b.innerHTML=ICON.check+'<span class="lbl">اتضاف</span>';setTimeout(()=>{b.classList.remove("done");b.innerHTML=ICON.plus+'<span class="lbl">أضف للسلة</span>';},1600);}
});

/* ================= helpers ================= */
function split(el){
  if(el.dataset.done)return;el.dataset.done=1;el.classList.add("split");
  const walk=n=>{[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){const parts=c.textContent.split(/(\s+)/);const f=document.createDocumentFragment();
      parts.forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return;}const w=document.createElement("span");w.className="w";w.innerHTML=`<span>${esc(t)}</span>`;f.appendChild(w);});c.replaceWith(f);}
    else if(c.nodeType===1&&!c.classList.contains("w"))walk(c);});};
  walk(el);
}
function card(p){
  const o=off(p),alt=p.imgs.length>1;
  return `<article class="card${alt?" has-alt":""}" data-id="${p.id}" data-cat="${p.cat}">
    <div class="card-top"><a class="card-media" href="#p-${p.id}" data-cursor="شوف">
      ${o?`<span class="badge num">−${o}%</span>`:""}${p.cat==="bundles"?`<span class="badge b2">Suite</span>`:""}
      <img class="main" src="${img(p)}" alt="${esc(p.ar)}" loading="lazy">${alt?`<img class="alt" src="${img(p,1)}" alt="" loading="lazy">`:""}<span class="glare"></span>
    </a><button class="add" data-add="${p.id}" aria-label="أضف ${esc(p.ar)} للسلة">${ICON.plus}<span class="lbl">أضف للسلة</span></button></div>
    <div class="card-body"><span class="card-cat">${CAT_EN[p.cat]}</span><h3><a href="#p-${p.id}">${esc(p.ar)}</a></h3><span class="var">${esc(p.variant)}</span>
      <div class="price"><b class="num">${money(p.sale)}</b>${p.reg>p.sale?`<s class="num">${fmt(p.reg)}</s>`:""}</div></div></article>`;
}

/* ================= HOME ================= */
const featured=[231855,231759,231737,231916,231689,231686,231925,231940];
function pageHome(){
  const maxOff=Math.max(...P.map(off)),bundles=P.filter(p=>p.cat==="bundles");
  return `
  <section class="hero" id="hero">
    <div class="cone"></div>
    <div class="wrap hero-grid">
      <div>
        <span class="label" data-fade>Techi Smart Home · Cairo</span>
        <div class="words" style="margin-top:26px">
          <div class="word" data-k="0"><b>نوّر.</b><em>Light</em></div>
          <div class="word" data-k="1"><b>اقفل.</b><em>Lock</em></div>
          <div class="word" data-k="2"><b>عيش.</b><em>Live</em></div>
        </div>
        <div class="hero-meta" data-fade>
          <p>بيت بيفهمك. سويتشات وشاشات وكوالين وحساسات Zigbee بتشتغل مع بعض في أبلكيشن واحد، واحنا بنركّبها.</p>
          <div class="hero-ctas"><a class="btn btn-white" href="#shop" data-magnetic>${btxt("اكتشف المجموعة")}</a><a class="btn btn-line" href="#experience" data-magnetic>${btxt("ادخل البيت 3D")}</a></div>
        </div>
      </div>
      <div class="switch-wrap" id="swWrap">
        <div class="ripples"><span></span><span></span><span></span></div>
        <div class="switch" id="sw">
          <div class="sw-edge"></div>
          <div class="sw-glass"><i class="sw-wifi" id="swWifi"></i>
            <button class="key" data-k="0" aria-label="النور" aria-pressed="false"><i></i><span>Light</span></button>
            <button class="key" data-k="1" aria-label="القفل" aria-pressed="false"><i></i><span>Lock</span></button>
            <button class="key" data-k="2" aria-label="المشاهد" aria-pressed="false"><i></i><span>Live</span></button>
            <div class="sw-scan" id="swScan"></div>
          </div>
        </div>
        <div class="sw-shadow"></div>
        <div class="sw-hint"><i></i>المس السويتش<i></i></div>
      </div>
    </div>
    <div class="scroll-cue"><i></i>SCROLL</div>
  </section>

  <section class="sec manifesto">
    <div class="mf-float" style="top:12%;inset-inline-end:6%" data-par="-120"><img src="${img(byId[231737])}" alt=""></div>
    <div class="mf-float" style="bottom:10%;inset-inline-end:22%;width:120px" data-par="-60"><img src="${img(byId[231925])}" alt=""></div>
    <div class="wrap">
      <span class="label">Manifesto</span>
      <p class="big" id="mf" style="margin-top:40px">البيت الذكي مش أجهزة. هو إن النور يستناك وانت راجع، والباب يعرفك من وشّك، والبيت كله يفهمك من غير ما تقول ولا كلمة.</p>
      <div class="sig"><img src="${src("logo-white.png")}" alt="Techi"><span class="serif" style="font-size:1.2rem">Light · Lock · Live</span></div>
    </div>
  </section>

  <section class="sec xp-sec" style="padding-top:0">
    <div class="wrap">
      <div class="shead"><div><span class="idx">(01) — The House</span><h2 data-split>ادخل البيت. دوس على أي حاجة.</h2></div>
        <div class="side"><p data-fade>شقة كاملة بالـ 3D. كل رقم جهاز حقيقي من المجموعة، والنور والستاير والكالون والتكييف بيشتغلوا قدامك.</p></div></div>
      ${frame3d(false)}
    </div>
  </section>

  <section class="collection" id="collection">
    <div class="col-pin">
      <div class="wrap col-head"><div><span class="idx">(02) — The Collection</span><h2 data-split style="margin-top:14px">المجموعة.</h2></div>
        <div class="col-prog"><span id="colN">01</span><i><b id="colBar"></b></i><span>${pad(featured.length)}</span></div></div>
      <div class="col-track" id="colTrack">
        ${featured.map((id,i)=>{const p=byId[id];const o=off(p);return `<article class="slide">
          <div class="ghost">${GHOST[id]}</div>
          <div class="s-info">
            <span class="idx">${pad(i+1)} / ${pad(featured.length)}</span>
            <span class="room">${CATS[p.cat]}</span>
            <h3>${esc(p.ar)}</h3><span class="var">${esc(p.en)}</span>
            <p>${esc(p.pitch)}</p>
            <div class="s-price"><b class="num">${money(p.sale)}</b>${p.reg>p.sale?`<s class="num">${fmt(p.reg)}</s><span class="off num">−${o}%</span>`:""}</div>
            <div class="s-btns"><button class="btn btn-white" data-add="${p.id}">${btxt("أضف للسلة")}</button><a class="btn btn-line" href="#p-${p.id}">${btxt("التفاصيل")}</a></div>
          </div>
          <div class="case-wrap"><a class="case" href="#p-${p.id}" data-cursor="شوف"><img src="${img(p)}" alt="${esc(p.ar)}" loading="lazy"></a><div class="plinth"></div></div>
        </article>`;}).join("")}
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="shead"><div><span class="idx">(03) — Rooms</span><h2 data-split>كل ركن في بيتك.</h2></div><div class="side"><p data-fade>خمس عائلات من الأجهزة، كلهم على نفس الأبلكيشن.</p></div></div>
      <div class="rooms" id="rooms">${Object.keys(CATS).map((k,i)=>`<a class="room-row" href="#${k==="bundles"?"bundles":"shop-"+k}" data-img="${img(byId[CAT_IMG[k]])}"><span class="idx">(${pad(i+1)})</span><h3>${CATS[k]}</h3><span class="cnt">${P.filter(p=>p.cat===k).length} pieces</span><span class="go">${ICON.arrUp}</span></a>`).join("")}</div>
    </div>
  </section>

  <div class="figs"><div class="track" id="figs">${Array(2).fill(`<div class="f"><b>${maxOff}%</b><span>أعلى خصم</span></div><div class="f"><b>${SHOP.filter(p=>p.cat!=="bundles").length}</b><span>جهاز</span></div><div class="f"><b>${bundles.length}</b><span>باقات</span></div><div class="f"><b>5Y</b><span>ضمان باقة الحساسات</span></div><div class="f"><b>3.0</b><span>Zigbee</span></div>`).join("")}</div></div>

  <section class="sec">
    <div class="wrap">
      <div class="shead"><div><span class="idx">(04) — Suites</span><h2 data-split>بيت كامل، في باقة واحدة.</h2></div><div class="side"><p data-fade>دوس على أي باقة عشان تفتح.</p><a class="btn btn-line" href="#bundles">${btxt("كل الباقات")}</a></div></div>
      ${suites(bundles)}
    </div>
  </section>

  <section class="sec" style="padding-top:0">
    <div class="wrap">
      <div class="shead"><div><span class="idx">(05) — The Ritual</span><h2 data-split>من المعاينة لحد أول "تصبح على خير".</h2></div></div>
      <div class="ritual" id="ritual">
        <div class="rit"><i class="bar"></i><span class="n">01</span><h4>معاينة</h4><p>بنزورك ونحدد أماكن السويتشات والحساسات والكالون.</p></div>
        <div class="rit"><i class="bar"></i><span class="n">02</span><h4>عرض سعر</h4><p>عرض واضح بالأجهزة والتركيب، أو باقة جاهزة.</p></div>
        <div class="rit"><i class="bar"></i><span class="n">03</span><h4>تركيب</h4><p>تركيب احترافي على نفس العلب الموجودة.</p></div>
        <div class="rit"><i class="bar"></i><span class="n">04</span><h4>نظبط معاك</h4><p>نربط الأبلكيشن وAlexa ونعملك السيناريوهات.</p></div>
      </div>
    </div>
  </section>
  ${finale()}`;
}
function suites(list){
  return `<div class="suites" id="suites">${list.map((p,i)=>`<article class="suite${i===0?" on":""}" data-id="${p.id}" tabindex="0">
    <div class="tab"><span class="idx">${pad(i+1)}</span><h4>${esc(p.ar)}</h4><span class="pr num">${fmt(p.sale)} EGP</span></div>
    <div class="body"><a class="bimg" href="#p-${p.id}" data-cursor="شوف"><img src="${img(p)}" alt="${esc(p.ar)}" loading="lazy"></a>
      <div class="info"><span class="idx">${pad(i+1)} / ${pad(list.length)}</span><h3>${esc(p.ar)}</h3><span class="v">${esc(p.variant)} · ${esc(p.en)}</span><p>${esc(p.pitch)}</p>
        <ul>${(p.items||[]).slice(0,8).map(([n,q])=>`<li><span>${esc(n)}</span>${q?`<b class="num">× ${q}</b>`:""}</li>`).join("")}</ul>
        <div class="pr-big"><b class="num">${money(p.sale)}</b><s class="num">${fmt(p.reg)}</s>${p.reg>p.sale?`<span class="save num">وفّر ${fmt(p.reg-p.sale)} ج.م</span>`:""}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-white" data-add="${p.id}">${btxt("أضف الباقة")}</button><a class="btn btn-line" href="#p-${p.id}">${btxt("التفاصيل")}</a></div>
      </div></div></article>`).join("")}</div>`;
}
function initSuites(){
  const box=$("#suites");if(!box)return;
  const open=el=>{if(el.classList.contains("on"))return;
    const st=hasGsap&&window.Flip&&!reduce&&innerWidth>900?null:null;
    $$(".suite",box).forEach(s=>s.classList.toggle("on",s===el));
    if(innerWidth<=900&&hasGsap)gsap.from($(".body",el),{opacity:0,y:20,duration:.6,ease:"power3.out"});};
  $$(".suite",box).forEach(s=>{s.addEventListener("click",()=>open(s));s.addEventListener("keydown",e=>{if(e.key==="Enter")open(s);});
    if(fine)s.addEventListener("mouseenter",()=>open(s));});
}
function finale(){
  return `<section class="finale" id="finale"><div class="wrap">
    <div class="giant">TECHI</div>
    <div class="row"><h2 data-split>تعالى شوف البيت شغال.</h2>
      <div class="addr"><b>Value Mall — New Cairo</b><span>الشوروم في التجمع الخامس</span></div>
      <a class="btn btn-white" href="${waLink("أهلاً Techi، عايز أعرف أكتر عن البيت الذكي")}" target="_blank" rel="noopener" data-magnetic>${ICON.wa}${btxt("كلمنا على واتساب")}</a></div>
  </div></section>`;
}

/* ================= 3D frame (unchanged behaviour) ================= */
function frame3d(full){
  return `<div class="t3d-frame${full?" full":""}" data-lenis-prevent>
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
let off3d=null;
function mount3d(){
  const host=$("#t3dHost");if(!host)return;const frame=host.closest(".t3d-frame");
  if(!window.TechiHome){host.innerHTML=`<div class="t3d-fallback">الجهاز ده مش بيدعم الـ 3D. جرّب من متصفح تاني.</div>`;return;}
  TechiHome.mount(host);const dc=$("#devCard",frame);
  if(off3d)off3d();
  off3d=TechiHome.on((id,did)=>{if(!id)return;const p=byId[D3MAP[id]];const dv=TechiHome.devices.find(d=>d.id===id);
    dc.hidden=false;dc.innerHTML=`<img src="${img(p)}" alt=""><div><span class="r">${dv.room} · ${dv.name}</span><h4>${esc(p.ar)}</h4><div class="did">${esc(did)}</div></div>
      <div class="row"><span class="p num">${fmt(p.sale)} ج.م<small>${p.reg>p.sale?fmt(p.reg):""}</small></span><span style="display:flex;gap:6px"><a class="mini-add" style="background:#E6EBF3;color:var(--navy)" href="#p-${p.id}">التفاصيل</a><button class="mini-add" data-add="${p.id}">${ICON.plus.replace("<svg",'<svg width="16" height="16"')} أضف</button></span></div>`;
    if(hasGsap&&!reduce)gsap.fromTo(dc,{y:20,opacity:0},{y:0,opacity:1,duration:.5,ease:"power3.out"});});
  frame.querySelectorAll("[data-scene]").forEach(b=>b.onclick=()=>{TechiHome.runScene(b.dataset.scene);frame.querySelectorAll("[data-scene]").forEach(x=>x.classList.toggle("run",x===b));setTimeout(()=>b.classList.remove("run"),2600);});
  const day=$("[data-day]",frame);day.onclick=()=>{const on=day.getAttribute("aria-pressed")!=="true";day.setAttribute("aria-pressed",on);day.textContent=on?"☾ ليل":"☀ نهار";TechiHome.setDay(on);};
  const pins=$("[data-pins]",frame);pins.onclick=()=>{const on=frame.classList.toggle("nopins");pins.setAttribute("aria-pressed",!on);};
  $("[data-home3d]",frame).onclick=()=>TechiHome.home();
}

/* ================= SHOP / PRODUCT / OTHER PAGES ================= */
function pageShop(cat){
  const counts=Object.fromEntries(Object.keys(CATS).map(k=>[k,P.filter(p=>p.cat===k).length]));
  return `<section class="phead"><div class="wrap"><span class="idx">(${pad(P.length)}) — The Collection</span><h1 data-split>المجموعة.</h1>
    <div class="sub"><p data-fade>أجهزة TYSH وAmazon، كلها شغالة على Tuya وبتتربط ببعض في أبلكيشن واحد.</p><span class="serif" style="font-size:1.4rem;color:var(--dim)" data-fade>${P.length} pieces</span></div></div></section>
  <section class="wrap" style="padding-bottom:40px">
    <div class="toolbar"><div class="chips" id="chips"><span class="pill"></span><button data-c="all" class="${cat?"":"on"}">الكل<sup>${P.length}</sup></button>${Object.keys(CATS).map(k=>`<button data-c="${k}" class="${cat===k?"on":""}">${CATS[k]}<sup>${counts[k]}</sup></button>`).join("")}</div>
      <div class="tsearch"><input id="q" type="search" placeholder="دوّر على جهاز…" aria-label="بحث"><select id="sort" aria-label="ترتيب"><option value="pop">المختارة</option><option value="lo">السعر: الأقل</option><option value="hi">السعر: الأعلى</option><option value="off">أعلى خصم</option></select></div></div>
    <div class="grid" id="shopGrid">${SHOP.map(card).join("")}</div>
    <p class="empty" id="empty" hidden>مالقيناش حاجة بالاسم ده. جرّب كلمة تانية.</p>
  </section>`;
}
function movePill(box){const on=$("button.on,a.on",box),pill=$(".pill",box);if(!pill)return;if(!on){pill.style.opacity=0;return;}pill.style.opacity=1;pill.style.left=on.offsetLeft+"px";pill.style.width=on.offsetWidth+"px";}
function initShop(cat){
  let c=cat||"all";const grid=$("#shopGrid");const order=SHOP.map(p=>p.id);
  function apply(animate){
    const q=$("#q").value.trim().toLowerCase(),s=$("#sort").value;
    const state=animate&&hasGsap&&window.Flip&&!reduce?Flip.getState(".card",{props:"opacity"}):null;
    const cards=$$(".card",grid);
    cards.forEach(el=>{const p=byId[+el.dataset.id];el.hidden=!((c==="all"||p.cat===c)&&(!q||(p.ar+" "+p.en+" "+p.variant).toLowerCase().includes(q)));});
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
  return `<section class="phead"><div class="wrap"><span class="idx">(${pad(b.length)}) — Suites</span><h1 data-split>الباقات.</h1>
    <div class="sub"><p data-fade>من الشقة الصغيرة لحد البيت الكامل، كل باقة أرخص من شراء كل جهاز لوحده.</p><span class="serif" style="font-size:1.4rem;color:var(--dim)" data-fade>${b.length} suites</span></div></div></section>
  <section class="wrap" style="padding-bottom:60px">${suites(b)}</section>
  <section class="sec" style="padding-top:60px"><div class="wrap"><div class="grid" data-stagger>${b.map(card).join("")}</div></div></section>`;
}
function pageProduct(id){
  const p=byId[id];if(!p)return pageShop();
  const o=off(p);const d3=Object.keys(D3MAP).find(k=>D3MAP[k]===p.id);
  const rel=P.filter(x=>x.cat===p.cat&&x.id!==p.id).concat(P.filter(x=>x.cat!==p.cat&&x.cat!=="bundles")).slice(0,4);
  const list=(p.feat||[]).map(f=>[f,0]).concat(p.items||[]);
  return `<section class="pp wrap">
    <nav class="crumbs" aria-label="المسار"><a href="#home">الرئيسية</a><span>/</span><a href="#${p.cat==="bundles"?"bundles":"shop-"+p.cat}">${CATS[p.cat]}</a><span>/</span><span>${esc(p.ar)}</span></nav>
    <div class="pp-grid">
      <div class="gal"><div class="gal-stage"><div class="gal-main" id="galMain" data-cursor="زووم">${o?`<span class="badge num">−${o}%</span>`:""}<img id="galImg" src="${img(p)}" alt="${esc(p.ar)}"></div></div>
        ${p.imgs.length>1?`<div class="thumbs" id="thumbs">${p.imgs.map((f,i)=>`<button class="${i?"":"on"}" data-i="${i}" aria-label="صورة ${i+1}"><img src="${src(f)}" alt=""></button>`).join("")}</div>`:""}</div>
      <div class="pinfo">
        <span class="pc" data-fade>${CAT_EN[p.cat]} — ${esc(p.variant)}</span>
        <h1 data-split>${esc(p.ar)}</h1>
        <div class="en" data-fade>${esc(p.en)}</div>
        <p class="lead" data-fade>${esc(p.pitch)}</p>
        <div class="pbig" data-fade><b class="num">${money(p.sale)}</b>${p.reg>p.sale?`<s class="num">${fmt(p.reg)} ج.م</s><span class="save num">وفّر ${fmt(p.reg-p.sale)} ج.م</span>`:""}</div>
        ${list.length?`<ul class="feat" data-fade>${list.map(([n,q],i)=>`<li><i>${pad(i+1)}</i><span>${esc(n)}</span>${q?`<b class="num serif" style="margin-inline-start:auto;color:var(--ice)">× ${q}</b>`:""}</li>`).join("")}</ul>`:""}
        <div class="buy" data-fade>
          <div class="qty"><button id="qm" aria-label="قلل">−</button><span class="num" id="qv">1</span><button id="qp" aria-label="زوّد">+</button></div>
          <button class="btn btn-white" id="ppAdd" data-add="${p.id}" data-qty="1" data-magnetic>${btxt("أضف للسلة")}</button>
          <a class="btn btn-wa" href="${waLink("أهلاً Techi، عايز أطلب: "+p.ar+" ("+p.variant+")")}" target="_blank" rel="noopener">${ICON.wa}${btxt("واتساب")}</a>
        </div>
        ${d3?`<a class="btn btn-line" href="#experience-${d3}" style="justify-self:start" data-fade>${btxt("شوفه شغال في البيت 3D")}</a>`:""}
        <div class="perks" data-fade><div><b>تركيب احترافي</b><span>فريقنا بيركّب ويظبط</span></div><div><b>الشوروم</b><span>Value Mall، التجمع</span></div><div><b>Tuya</b><span>أبلكيشن واحد</span></div></div>
        ${p.specs&&p.specs.length?`<div class="specs" data-fade><table><caption>SPECIFICATIONS — المواصفات</caption>${p.specs.map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table></div>`:""}
      </div>
    </div>
  </section>
  <section class="sec"><div class="wrap"><div class="shead"><div><span class="idx">— Pairs well with</span><h2 data-split>أجهزة بتشتغل معاه.</h2></div></div><div class="grid" data-stagger>${rel.map(card).join("")}</div></div></section>`;
}
function initProduct(id){
  const p=byId[id];if(!p)return;let q=1;
  const setQ=v=>{q=Math.max(1,Math.min(20,v));$("#qv").textContent=q;$("#ppAdd").dataset.qty=q;};
  $("#qm").onclick=()=>setQ(q-1);$("#qp").onclick=()=>setQ(q+1);
  const main=$("#galMain"),gi=$("#galImg");
  const th=$("#thumbs");if(th)th.onclick=e=>{const b=e.target.closest("button");if(!b)return;$$("#thumbs button").forEach(x=>x.classList.toggle("on",x===b));
    const s2=src(p.imgs[+b.dataset.i]);if(hasGsap)gsap.to(gi,{opacity:0,scale:.94,filter:"blur(6px)",duration:.25,onComplete:()=>{gi.src=s2;gsap.to(gi,{opacity:1,scale:1,filter:"blur(0px)",duration:.6,ease:"expo.out"});}});else gi.src=s2;};
  main.addEventListener("pointermove",e=>{const r=main.getBoundingClientRect();gi.style.transformOrigin=`${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%`;});
  main.addEventListener("click",()=>main.classList.toggle("zoom"));main.addEventListener("pointerleave",()=>main.classList.remove("zoom"));
}
function pageExperience(){
  return `<section class="xp">${frame3d(true)}</section>
  <section class="sec"><div class="wrap"><div class="shead"><div><span class="idx">— Every number is a product</span><h2 data-split>كل رقم في البيت، جهاز تقدر تطلبه.</h2></div><div class="side"><p data-fade>دوس على أي جهاز والكاميرا هتروحله وتشغّله.</p></div></div>
    <div class="xp-list" data-stagger>${(window.TechiHome?TechiHome.devices:[]).map(d=>{const p=byId[D3MAP[d.id]];return `<button class="xp-item" data-dev="${d.id}"><img src="${img(p)}" alt=""><span><b>${d.name}</b><small>${d.room} · ${fmt(p.sale)} ج.م</small></span><span class="n">${pad(d.n)}</span></button>`;}).join("")}</div>
  </div></section>`;
}
function initExperience(dev){
  $$(".xp-item").forEach(b=>b.onclick=()=>{(lenis?lenis.scrollTo(0,{duration:1.2}):scrollTo({top:0,behavior:"smooth"}));setTimeout(()=>TechiHome.activate(b.dataset.dev,true),reduce?0:700);});
  if(dev&&window.TechiHome)setTimeout(()=>TechiHome.activate(dev,true),1600);
}
function pageAbout(){
  return `<section class="phead"><div class="wrap"><span class="idx">— About</span><h1 data-split>Techi.</h1><div class="sub"><p data-fade>شركة مصرية للبيوت الذكية، والشوروم بتاعنا في Value Mall بالتجمع الخامس.</p><span class="serif" style="font-size:1.4rem;color:var(--dim)" data-fade>Light · Lock · Live</span></div></div></section>
  <section class="sec" style="padding-top:60px"><div class="wrap about-grid">
    <p class="big" data-fade>بنختار أجهزة TYSH وAmazon اللي شغالة على Tuya وZigbee 3.0، وبنركّبها ونظبطها لحد ما بيتك كله يبقى في أبلكيشن واحد.</p>
    <div class="facts" data-fade><div><b>Showroom</b><span>Value Mall، التجمع الخامس، القاهرة الجديدة</span></div><div><b>Install</b><span>تركيب احترافي على نفس العلب، ونظبط معاك الأبلكيشن وAlexa.</span></div><div><b>Warranty</b><span>باقة السويتشات والحساسات عليها ضمان 5 سنين.</span></div><div><b>Platform</b><span>Tuya · Zigbee 3.0 · Alexa · Google Home</span></div></div>
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
    if(!hasGsap||reduce){if(k===0){BG.lux=on?1:0;hero.style.setProperty("--lux",on?1:0);}return;}
    gsap.fromTo(keys[k],{scale:.86},{scale:1,duration:.6,ease:"elastic.out(1,.4)"});
    if(k===0){gsap.to(BG,{lux:on?1:0,duration:on?1.4:.8,ease:on?"power2.out":"power2.in"});
      gsap.to(hero,{"--lux":on?1:0,duration:on?1.4:.8,ease:"power2.out"});
      if(on)gsap.fromTo(hero.querySelector(".cone"),{opacity:0},{keyframes:[{opacity:.6,duration:.05},{opacity:.1,duration:.06},{opacity:.9,duration:.05},{opacity:.3,duration:.08},{opacity:1,duration:.3}],clearProps:"opacity"});}
    if(k===1&&on){gsap.fromTo(scan,{yPercent:-100,opacity:1},{yPercent:250,opacity:0,duration:1.1,ease:"power2.inOut"});if(!silent)toast("<small>Techi Home</small><span>الباب اتقفل</span>");}
    if(k===2&&on){rip.forEach((r,i)=>gsap.fromTo(r,{scale:.5,opacity:.9},{scale:2.6,opacity:0,duration:2.2,delay:i*.35,ease:"power2.out"}));}
  }
  keys.forEach((b,k)=>b.addEventListener("click",()=>set(k,!state[k])));
  words.forEach((w,k)=>w.addEventListener("click",()=>set(k,!state[k])));
  // tilt + sheen
  if(fine&&hasGsap){const rx=gsap.quickTo(sw,"rotationX",{duration:.8,ease:"power3"}),ry=gsap.quickTo(sw,"rotationY",{duration:.8,ease:"power3"});
    hero.addEventListener("pointermove",e=>{const r=sw.getBoundingClientRect();const nx=(e.clientX-(r.left+r.width/2))/innerWidth,ny=(e.clientY-(r.top+r.height/2))/innerHeight;
      ry(nx*28);rx(-ny*22);sw.querySelector(".sw-glass").style.setProperty("--sheen",(nx*160)+"%");});
    hero.addEventListener("pointerleave",()=>{rx(0);ry(0);});}
  // intro demo: the house switches itself on
  if(hasGsap&&!reduce){
    gsap.timeline({delay:.4})
      .from(".word b",{yPercent:110,opacity:0,duration:1.4,ease:"expo.out",stagger:.12})
      .from(".word em",{opacity:0,x:-20,duration:1,ease:"power3.out",stagger:.12},"-=1")
      .from(sw,{y:80,rotationX:40,opacity:0,duration:1.6,ease:"expo.out"},"-=1.3")
      .from("#hero [data-fade]",{y:30,opacity:0,duration:1,ease:"power3.out",stagger:.12},"-=1")
      .add(()=>set(0,true,true),"+=.1").add(()=>set(1,true,true),"+=.7").add(()=>set(2,true,true),"+=.7");
    gsap.to(".hero-grid",{yPercent:-12,opacity:.2,ease:"none",scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:true}});
  }else{set(0,true,true);set(1,true,true);set(2,true,true);}
}

/* ================= MOTION ================= */
function animatePage(){
  $$("[data-split]").forEach(split);
  initHero();initSuites();
  if(!hasGsap||reduce)return;
  const head=$(".phead");
  if(head){gsap.from($$("[data-split] .w>span",head),{yPercent:120,duration:1.4,ease:"expo.out",stagger:.08,delay:.2});
    gsap.from($$("[data-fade]",head),{y:30,opacity:0,duration:1,ease:"power3.out",stagger:.1,delay:.6});
    gsap.from(".phead .sub",{"--x":0,borderTopColor:"rgba(0,0,0,0)",duration:1.2,delay:.4});}
  $$("[data-split]").filter(el=>!el.closest(".phead")).forEach(el=>{
    gsap.from($$(".w>span",el),{yPercent:120,duration:1.3,ease:"expo.out",stagger:.06,scrollTrigger:{trigger:el,start:"top 88%"}});});
  $$("[data-fade]").filter(el=>!el.closest(".phead,#hero")).forEach(el=>{
    gsap.from(el,{y:40,opacity:0,filter:"blur(6px)",duration:1.2,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 90%"}});});
  $$("[data-stagger]").forEach(g=>gsap.from(g.children,{y:80,opacity:0,duration:1.2,ease:"expo.out",stagger:.08,scrollTrigger:{trigger:g,start:"top 85%"}}));
  const sg=$("#shopGrid");if(sg)gsap.from(sg.children,{y:80,opacity:0,duration:1.2,ease:"expo.out",stagger:.05,delay:.5});
  $$(".gal-main").forEach(el=>gsap.from(el,{scale:.85,opacity:0,rotationY:-20,duration:1.6,ease:"expo.out",delay:.15}));
  // manifesto: words light up as you scroll
  const mf=$("#mf");if(mf){split(mf);const ws=$$(".w",mf);
    ScrollTrigger.create({trigger:mf,start:"top 75%",end:"bottom 45%",scrub:true,onUpdate:s=>{const n=Math.round(s.progress*ws.length);ws.forEach((w,i)=>w.classList.toggle("lit",i<n));}});
    $$("[data-par]").forEach(el=>gsap.to(el,{y:+el.dataset.par,rotation:8,ease:"none",scrollTrigger:{trigger:".manifesto",start:"top bottom",end:"bottom top",scrub:true}}));}
  // 3D frame reveal
  $$(".t3d-frame:not(.full)").forEach(f=>gsap.from(f,{clipPath:"inset(18% 14% 18% 14% round 60px)",duration:1.8,ease:"expo.out",scrollTrigger:{trigger:f,start:"top 85%"}}));
  // collection: pinned horizontal showcase
  const col=$("#collection"),track=$("#colTrack");
  if(col&&innerWidth>900){const slides=$$(".slide",track);const dist=()=>track.scrollWidth-innerWidth;
    const parts=slides.map(sl=>({sl,c:$(".case",sl),i:$(".s-info",sl),g:$(".ghost",sl)}));
    const paint=()=>{const W=innerWidth;parts.forEach(o=>{const r=o.sl.getBoundingClientRect();const c=(r.left+r.width/2-W/2)/W;const a=Math.min(1,Math.abs(c)*1.5);
      gsap.set(o.c,{scale:1-.38*a,rotation:c*-16,opacity:1-.55*a});gsap.set(o.i,{opacity:Math.max(0,1-a*1.6),x:c*160});gsap.set(o.g,{x:c*-420,opacity:1-a*.6});});};
    gsap.to(track,{x:()=>dist(),ease:"none",scrollTrigger:{trigger:col,start:"top top",end:()=>"+="+dist(),pin:".col-pin",scrub:1,invalidateOnRefresh:true,
      onUpdate:s=>{$("#colBar").style.transform=`scaleX(${s.progress})`;$("#colN").textContent=pad(Math.min(slides.length,Math.round(s.progress*(slides.length-1))+1));},onRefresh:paint}});
    gsap.ticker.add(paint);paint();}
  else if(col){$$(".slide",col).forEach(sl=>gsap.from($(".case",sl),{scale:.7,opacity:0,duration:1.4,ease:"expo.out",scrollTrigger:{trigger:sl,start:"top 80%"}}));}
  // rooms: draw lines + hover image follower
  const rooms=$("#rooms");if(rooms){gsap.from($$(".room-row",rooms),{y:60,opacity:0,duration:1.1,ease:"expo.out",stagger:.08,scrollTrigger:{trigger:rooms,start:"top 85%"}});
    if(fine){const hi=$("#hoverImg");const xT=gsap.quickTo(hi,"x",{duration:.7,ease:"power3"}),yT=gsap.quickTo(hi,"y",{duration:.7,ease:"power3"});let lastX=0;
      $$(".room-row",rooms).forEach(r=>{r.addEventListener("mouseenter",e=>{gsap.set(hi,{x:e.clientX,y:e.clientY});lastX=e.clientX;hi.innerHTML=`<img src="${r.dataset.img}" alt="">`;gsap.to(hi,{opacity:1,scale:1,duration:.6,ease:"expo.out"});});
        r.addEventListener("mouseleave",()=>gsap.to(hi,{opacity:0,scale:.6,duration:.4}));
        r.addEventListener("mousemove",e=>{xT(e.clientX);yT(e.clientY);gsap.to(hi,{rotation:Math.max(-12,Math.min(12,(e.clientX-lastX)*.6)),duration:.5});lastX=e.clientX;});});}}
  // figures marquee
  const figs=$("#figs");if(figs){const w=figs.scrollWidth/2;const mq=gsap.to(figs,{x:-w,duration:40,ease:"none",repeat:-1});
    ScrollTrigger.create({trigger:figs,start:"top bottom",end:"bottom top",onUpdate:s=>gsap.to(mq,{timeScale:1+Math.abs(s.getVelocity()/250),duration:.3,overwrite:true,onComplete:()=>gsap.to(mq,{timeScale:1,duration:1})})});}
  // suites entrance
  const su=$("#suites");if(su)gsap.from($$(".suite",su),{y:120,opacity:0,duration:1.4,ease:"expo.out",stagger:.08,scrollTrigger:{trigger:su,start:"top 85%"}});
  // ritual
  const rit=$("#ritual");if(rit){const items=$$(".rit",rit);items.forEach((it,i)=>{gsap.to($(".bar",it),{scaleX:1,duration:1.2,ease:"expo.inOut",scrollTrigger:{trigger:rit,start:"top 75%"},delay:i*.25,onComplete:()=>it.classList.add("on")});});
    gsap.from(items,{y:50,opacity:0,stagger:.12,duration:1.2,ease:"expo.out",scrollTrigger:{trigger:rit,start:"top 80%"}});}
  // finale: light passes through the letters
  const fin=$("#finale");if(fin){const g=$(".giant",fin);gsap.from(g,{yPercent:30,opacity:0,duration:1.6,ease:"expo.out",scrollTrigger:{trigger:fin,start:"top 80%"}});
    fin.addEventListener("pointermove",e=>{const r=g.getBoundingClientRect();g.style.setProperty("--mx",((e.clientX-r.left)/r.width*100)+"%");g.style.setProperty("--my",((e.clientY-r.top)/r.height*100)+"%");});
    if(!fine)gsap.to(g,{"--mx":"100%",duration:4,yoyo:true,repeat:-1,ease:"sine.inOut"});}
  // card tilt + glare
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
  if(hasGsap){if(ctx)ctx.revert();ScrollTrigger.getAll().forEach(t=>t.kill());}
  if(window.TechiHome)TechiHome.unmount();
  BG.lux=0;cur.classList.remove("big");
  app.innerHTML=R.r==="shop"?pageShop(R.cat):R.r==="bundles"?pageBundles():R.r==="product"?pageProduct(R.id):R.r==="experience"?pageExperience():R.r==="about"?pageAbout():pageHome();
  const navR=R.r==="product"?(byId[R.id]&&byId[R.id].cat==="bundles"?"bundles":"shop"):R.r;
  $$("#capsule a").forEach(a=>a.classList.toggle("on",a.dataset.r===navR));movePill($("#capsule"));
  document.title=R.r==="product"&&byId[R.id]?`${byId[R.id].ar} · Techi`:"Techi Smart Home";
  if(lenis)lenis.scrollTo(0,{immediate:true});else scrollTo(0,0);
  if(R.r==="shop")initShop(R.cat);
  if(R.r==="product")initProduct(R.id);
  mount3d();
  if(R.r==="experience")initExperience(R.dev);
  if(hasGsap)ctx=gsap.context(animatePage);else animatePage();
  bindCursorTargets();
  if(hasGsap)requestAnimationFrame(()=>ScrollTrigger.refresh());
}
function go(){
  if(first||!hasGsap||reduce){first=false;render();return;}
  if(busy){pending=true;return;}busy=true;
  const t1=$("#tr .t1"),t2=$("#tr .t2"),ln=$("#tr b");
  gsap.timeline({onComplete:()=>{busy=false;if(pending){pending=false;go();}}})
    .to([t1,t2],{yPercent:0,duration:.6,ease:"expo.inOut"})
    .to(ln,{scaleX:1,opacity:1,duration:.35,ease:"power3.out"},"-=.15")
    .add(()=>render())
    .to(ln,{keyframes:[{opacity:.2,duration:.05},{opacity:1,duration:.05},{opacity:.4,duration:.06},{opacity:1,duration:.08}]})
    .to(t1,{yPercent:-101,duration:.9,ease:"expo.inOut"},"+=.05")
    .to(t2,{yPercent:101,duration:.9,ease:"expo.inOut"},"<")
    .to(ln,{scaleY:40,opacity:0,duration:.6,ease:"power2.out"},"<")
    .set(ln,{scaleX:0,scaleY:1});
}
addEventListener("hashchange",()=>{closeCart();closeMenu();go();});
addEventListener("resize",()=>movePill($("#capsule")));

let lastY=0;
addEventListener("scroll",()=>{const y=scrollY;$("#hdr").classList.toggle("hide",y>lastY&&y>300);lastY=y;},{passive:true});

/* mobile menu */
function openMenu(){const m=$("#mmenu");m.hidden=false;lenis&&lenis.stop();
  if(hasGsap){gsap.fromTo(m,{clipPath:"inset(0 0 100% 0)"},{clipPath:"inset(0 0 0% 0)",duration:.9,ease:"expo.inOut"});gsap.from($$("#mmenu a span"),{yPercent:110,duration:1,ease:"expo.out",stagger:.06,delay:.35});}
  else m.style.clipPath="none";}
function closeMenu(){const m=$("#mmenu");if(m.hidden)return;lenis&&lenis.start();if(hasGsap)gsap.to(m,{clipPath:"inset(100% 0 0% 0)",duration:.7,ease:"expo.inOut",onComplete:()=>m.hidden=true});else m.hidden=true;}
$("#menuBtn").onclick=openMenu;$("#menuClose").onclick=closeMenu;

/* cursor + spotlight */
const cur=$("#cur"),curT=$("#curT"),spot=$("#spot");
let cx,cy,sx,sy;
if(fine&&hasGsap&&!reduce){cx=gsap.quickTo(cur,"x",{duration:.12}),cy=gsap.quickTo(cur,"y",{duration:.12}),sx=gsap.quickTo(spot,"x",{duration:1.2,ease:"power3"}),sy=gsap.quickTo(spot,"y",{duration:1.2,ease:"power3"});
  addEventListener("pointermove",e=>{document.body.classList.add("cur-on");cx(e.clientX);cy(e.clientY);sx(e.clientX);sy(e.clientY);},{passive:true});
  document.addEventListener("pointerleave",()=>document.body.classList.remove("cur-on"));}
function bindCursorTargets(){
  if(!cx)return;
  $$("[data-cursor]").forEach(el=>{if(el.dataset.cb)return;el.dataset.cb=1;
    el.addEventListener("mouseenter",()=>{curT.textContent=el.dataset.cursor;cur.classList.add("big");});
    el.addEventListener("mouseleave",()=>cur.classList.remove("big"));});
}

/* clock: Cairo time */
function tick(){try{$("#clock").textContent="CAIRO "+new Intl.DateTimeFormat("en-GB",{timeZone:"Africa/Cairo",hour:"2-digit",minute:"2-digit"}).format(new Date());}catch(e){}}
tick();setInterval(tick,20000);

/* preloader: draw the logo's network */
const NODES=[[185,25,22],[252,73,11],[357,113,11],[292,158,16],[180,158,23],[25,192,24],[102,245,21],[200,252,34],[345,245,11],[430,192,18],[517,265,17],[285,288,11],[430,326,18],[160,353,16],[322,352,18],[52,381,16],[202,407,16],[452,415,34],[272,505,34]];
const DOTS=[[320,18,6],[325,76,11],[408,54,8],[446,106,10],[536,169,13]];
const EDGES=[[0,1],[0,4],[0,5],[1,4],[1,3],[4,3],[4,5],[4,6],[4,8],[3,7],[3,2],[2,9],[2,8],[9,8],[9,12],[8,11],[8,14],[8,12],[6,7],[6,13],[6,15],[5,15],[7,11],[7,13],[13,11],[11,16],[11,18],[11,14],[13,15],[15,16],[15,18],[16,18],[14,18],[14,12],[12,10],[12,17],[17,18]];
function buildMark(svg){
  let h=`<path d="M185,25 A245,245 0 0 0 52,381" stroke="#fff" stroke-width="3" class="ln"/><path d="M52,381 Q150,492 272,505 Q390,490 452,415" stroke="#fff" stroke-width="3" class="ln"/><path d="M517,265 Q505,360 452,415" stroke="#fff" stroke-width="3" class="ln"/>`;
  EDGES.forEach(([a,b])=>{h+=`<line x1="${NODES[a][0]}" y1="${NODES[a][1]}" x2="${NODES[b][0]}" y2="${NODES[b][1]}" stroke="#fff" stroke-width="3" class="ln"/>`;});
  NODES.concat(DOTS).forEach(([x,y,r])=>{h+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" class="nd"/>`;});
  svg.innerHTML=h;
}
function boot(){
  $("#yr").textContent=new Date().getFullYear();$("#footWa").href=waLink("أهلاً Techi");
  renderCart();
  if(hasGsap&&window.Lenis&&!reduce){lenis=new Lenis({lerp:.085,smoothWheel:true});lenis.on("scroll",ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);}
  const pre=$("#pre");
  if(!hasGsap||reduce){pre.remove();render();return;}
  const svg=$("#preMark");buildMark(svg);
  $$(".ln",svg).forEach(l=>{const L=l.getTotalLength?l.getTotalLength():400;l.style.strokeDasharray=L;l.style.strokeDashoffset=L;});
  const o={v:0};
  gsap.timeline()
    .from($$(".nd",svg),{scale:0,transformOrigin:"center",transformBox:"fill-box",duration:.6,ease:"back.out(3)",stagger:{each:.02,from:"random"}})
    .to($$(".ln",svg),{strokeDashoffset:0,duration:1,ease:"power2.inOut",stagger:.01},"-=.5")
    .to(o,{v:100,duration:1.7,ease:"power2.inOut",onUpdate:()=>{$("#preNum").textContent=String(Math.round(o.v)).padStart(3,"0");}},0)
    .to(".pre-in",{scale:.9,opacity:0,filter:"blur(10px)",duration:.5,ease:"power3.in"})
    .add(()=>render())
    .to(pre,{clipPath:"inset(0 0 100% 0)",duration:1.2,ease:"expo.inOut",onComplete:()=>pre.remove()});
}
boot();
})();
