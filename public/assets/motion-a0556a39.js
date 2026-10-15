/* Rfaheya: frame-based desktop wheel easing; touch and nested scrollers stay native. */
(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const desktop=matchMedia('(hover: hover) and (pointer: fine)');
  const bar=document.createElement('div');
  bar.className='rf-scroll-progress';bar.setAttribute('aria-hidden','true');
  document.body.appendChild(bar);
  let frame=0,paint=0,target=scrollY,last=0;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const limit=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
  function progress(){paint=0;const max=limit();bar.style.transform=`scaleX(${max?clamp(scrollY/max,0,1):0})`}
  function scheduleProgress(){if(!paint)paint=requestAnimationFrame(progress)}
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;target=scrollY}
  function tick(time){
    const dt=last?Math.min(40,time-last):16.67;last=time;
    target=clamp(target,0,limit());
    const distance=target-scrollY;
    if(Math.abs(distance)<.75){window.scrollTo({top:target,behavior:'instant'});frame=0;last=0;return}
    window.scrollTo({top:scrollY+distance*(1-Math.exp(-dt/85)),behavior:'instant'});
    frame=requestAnimationFrame(tick);
  }
  function wheel(event){
    if(event.defaultPrevented||!desktop.matches||reduced.matches||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||document.body.style.overflow==='hidden')return;
    const element=event.target instanceof Element?event.target:null;
    if(element?.closest('input,textarea,select,[contenteditable="true"],[role="dialog"],.overflow-y-auto,.overflow-auto,.rf-carousel-viewport')){stop();return}
    if(Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
    // Trackpad streams already carry native inertia; only discrete mouse-wheel steps need easing.
    if(event.deltaMode===0&&Math.abs(event.deltaY)<40){stop();return}
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    const max=limit(),next=clamp((frame?target:scrollY)+delta,0,max);
    if(!frame&&next===scrollY)return;
    event.preventDefault();target=next;
    if(!frame){last=0;frame=requestAnimationFrame(tick)}
  }
  window.addEventListener('wheel',wheel,{passive:false});
  window.addEventListener('scroll',scheduleProgress,{passive:true});
  window.addEventListener('pointerdown',stop,{passive:true});
  window.addEventListener('touchstart',stop,{passive:true});
  window.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))stop()});
  window.addEventListener('resize',()=>{stop();scheduleProgress()},{passive:true});
  window.addEventListener('popstate',stop);window.addEventListener('hashchange',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
  reduced.addEventListener('change',stop);desktop.addEventListener('change',stop);
  scheduleProgress();
})();
