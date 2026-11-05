/* Techi 3D smart home: mountable module. Exposes window.TechiHome */
(function(){
"use strict";
if(!window.THREE){window.TechiHome=null;return;}
let R;
try{R=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});}catch(e){window.TechiHome=null;return;}
R.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
R.outputEncoding=THREE.sRGBEncoding;
R.toneMapping=THREE.ACESFilmicToneMapping;
R.toneMappingExposure=1.05;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.setClearColor(0x000000,0);
R.domElement.className="t3d-canvas";

const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(R);
scene.environment=pmrem.fromScene(new THREE.RoomEnvironment(),0.04).texture;
const camera=new THREE.PerspectiveCamera(36,1,0.1,140);
const controls=new THREE.OrbitControls(camera,R.domElement);
controls.enableDamping=true;controls.dampingFactor=0.08;
controls.maxPolarAngle=1.38;controls.minDistance=2.5;controls.maxDistance=48;
controls.screenSpacePanning=true;controls.enableZoom=true;
const hemi=new THREE.HemisphereLight("#cfe0ff","#0a1430",0.06);scene.add(hemi);
const sun=new THREE.DirectionalLight("#fff1dc",0);
sun.position.set(-7,10,-12);sun.target.position.set(-2,0,-1);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-11,right:11,top:11,bottom:-11,near:1,far:40});
sun.shadow.bias=-0.0004;sun.shadow.normalBias=0.03;
scene.add(sun,sun.target);
/* ============ materials & textures ============ */
const allMats=[];
function M(color,o={}){
  const m=new THREE.MeshStandardMaterial(Object.assign({color,roughness:o.r??0.7,metalness:o.m??0},o.extra||{}));
  if(o.map) m.map=o.map;
  if(o.em){m.emissive=new THREE.Color(o.em);m.emissiveIntensity=o.ei??0;}
  if(o.side) m.side=o.side;
  if(o.op!=null){m.transparent=true;m.opacity=o.op;}
  allMats.push(m); return m;
}
function canvasTex(w,h,draw,rep){
  const c=document.createElement("canvas"); c.width=w; c.height=h; draw(c.getContext("2d"),w,h);
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=R.capabilities.getMaxAnisotropy();
  if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}
  return t;
}
function rnd(a,b){return a+Math.random()*(b-a)}
function wood(base,rep){
  return canvasTex(1024,1024,(g,w,h)=>{
    const rows=8, ph=h/rows;
    for(let r=0;r<rows;r++){
      let x=-rnd(0,300);
      while(x<w){
        const len=rnd(280,520), l=rnd(-7,7);
        g.fillStyle=`hsl(${base[0]+rnd(-3,3)},${base[1]+rnd(-6,6)}%,${base[2]+l}%)`;
        g.fillRect(x,r*ph,len,ph);
        g.globalAlpha=.12;
        for(let k=0;k<14;k++){g.strokeStyle=Math.random()<.5?"#000":"#fff";g.lineWidth=rnd(.5,2);g.beginPath();const yy=r*ph+rnd(4,ph-4);g.moveTo(x,yy);g.bezierCurveTo(x+len*.3,yy+rnd(-5,5),x+len*.6,yy+rnd(-5,5),x+len,yy+rnd(-3,3));g.stroke();}
        g.globalAlpha=1; g.fillStyle="rgba(0,0,0,.35)"; g.fillRect(x,r*ph,2,ph);
        x+=len;
      }
      g.fillStyle="rgba(0,0,0,.3)"; g.fillRect(0,r*ph,w,2);
    }
  },rep);
}
function tiles(c1,grout,n,rep){
  return canvasTex(512,512,(g,w,h)=>{
    g.fillStyle=grout; g.fillRect(0,0,w,h); const s=w/n;
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){g.fillStyle=c1;g.globalAlpha=1;g.fillRect(i*s+3,j*s+3,s-6,s-6);
      g.globalAlpha=.06;for(let k=0;k<40;k++){g.fillStyle=Math.random()<.5?"#000":"#fff";g.fillRect(i*s+rnd(4,s-6),j*s+rnd(4,s-6),rnd(1,4),rnd(1,4));}}
    g.globalAlpha=1;
  },rep);
}
const rugTex=canvasTex(512,512,(g,w,h)=>{
  g.fillStyle="#8C7B6B";g.fillRect(0,0,w,h);g.strokeStyle="#E7DED2";g.lineWidth=10;g.strokeRect(24,24,w-48,h-48);
  g.lineWidth=3;g.strokeRect(46,46,w-92,h-92);
  for(let i=0;i<6;i++){g.strokeStyle=i%2?"#C9A66B":"#E7DED2";g.beginPath();g.moveTo(80,90+i*66);for(let x=80;x<w-80;x+=32){g.lineTo(x+16,90+i*66+(x/32%2?14:-14));}g.stroke();}
  g.globalAlpha=.08;for(let k=0;k<4000;k++){g.fillStyle=Math.random()<.5?"#000":"#fff";g.fillRect(rnd(0,w),rnd(0,h),2,2);}
});

const mat={
  wall:M("#EEF1F5",{r:.92}), cap:M("#011738",{r:.6}), trim:M("#F7F4EF",{r:.6}),
  plinth:M("#011738",{r:.55,m:.2}), ground:M("#030C1F",{r:1}),
  oak:M("#ffffff",{r:.55,map:wood([30,45,42],[2.2,2.2])}),
  oakLight:M("#ffffff",{r:.55,map:wood([34,40,58],[1.6,1.6])}),
  tile:M("#ffffff",{r:.35,map:tiles("#D9D5CE","#AFA9A0",4,[2.5,2])}),
  hallTile:M("#ffffff",{r:.4,map:tiles("#CDC6BC","#A39B90",3,[3,1.2])}),
  rug:M("#ffffff",{r:1,map:rugTex}),
  fabric:M("#2C3F60",{r:1}), fabric2:M("#C9A66B",{r:1}), fabric3:M("#E6E0D6",{r:1}),
  woodDark:M("#5A3E2B",{r:.5}), woodMid:M("#8A6446",{r:.5}),
  black:M("#17191D",{r:.4,m:.4}), steel:M("#C9CED4",{r:.28,m:.85}), brass:M("#B48A4C",{r:.35,m:.9}),
  counter:M("#EFEEEA",{r:.3}), cabinet:M("#13284D",{r:.45,m:.1}),
  plant:M("#4E7A43",{r:.85}), plant2:M("#3E6A3A",{r:.85}), pot:M("#C7B8A4",{r:.8}),
  white:M("#F4F5F6",{r:.35}), skin:M("#C99B7A",{r:.7}), shirt:M("#3D7BFF",{r:.8}),
  duvet:M("#DED8CE",{r:1}), throw:M("#8A9A7B",{r:1}), headboard:M("#7C6B5C",{r:1}),
  curtain:M("#EAE3D7",{r:1,side:THREE.DoubleSide}),
  glass:M("#9FC3E0",{r:.05,m:0,op:.18}),
  water:M("#BFE3FF",{r:.05,op:.7,em:"#9fd3ff",ei:.4}),
};
mat.glass.depthWrite=false;
const bulbMat=()=>M("#FFF4E0",{r:.3,em:"#FFC98A",ei:0});
const shadeMat=()=>M("#F1EBDF",{r:.9,em:"#FFB866",ei:0,side:THREE.DoubleSide});

/* ============ helpers ============ */
const root=new THREE.Group(); scene.add(root);
function add(mesh,parent,cast=true,recv=true){mesh.castShadow=cast;mesh.receiveShadow=recv;(parent||root).add(mesh);return mesh;}
function box(w,h,d,m,x,y,z,p,round){
  const g=round?new THREE.RoundedBoxGeometry(w,h,d,3,Math.min(round,w/2-.001,h/2-.001,d/2-.001)):new THREE.BoxGeometry(w,h,d);
  const me=new THREE.Mesh(g,m); me.position.set(x,y,z); return add(me,p);
}
function cyl(rt,rb,h,m,x,y,z,p,seg=24){const me=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m);me.position.set(x,y,z);return add(me,p);}
function sph(r,m,x,y,z,p){const me=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),m);me.position.set(x,y,z);return add(me,p);}
function pointLight(color,x,y,z,dist=6){const l=new THREE.PointLight(color,0,dist,2);l.position.set(x,y,z);root.add(l);return l;}

/* ============ structure ============ */
const H=2.8,T=0.15;
box(12.9,0.4,8.9,mat.plinth,0,-0.25,0);
const ground=new THREE.Mesh(new THREE.CircleGeometry(40,64),mat.ground); ground.rotation.x=-Math.PI/2; ground.position.y=-0.45; add(ground,null,false,true);
const grid=new THREE.GridHelper(60,120,0x3D7BFF,0x3D7BFF);grid.material.transparent=true;grid.material.opacity=0.09;grid.position.y=-0.44;scene.add(grid);
const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(12.9,0.4,8.9)),new THREE.LineBasicMaterial({color:0x5B8CFF,transparent:true,opacity:.55}));edge.position.y=-0.25;scene.add(edge);
// floors
box(7,0.04,5.6,mat.oak,-2.5,-0.02,-1.2);       // living
box(7,0.04,2.4,mat.hallTile,-2.5,-0.02,2.8);   // hall
box(5,0.04,4,mat.tile,3.5,-0.02,-2);           // kitchen
box(5,0.04,4,mat.oakLight,3.5,-0.02,2);        // bedroom

const walls={};
function wall(id,axis,fixed,a0,a1,openings,outward){
  const full=new THREE.Group(), cut=new THREE.Group(); root.add(full,cut);
  const piece=(s,e,y0,y1,grp,m)=>{
    if(e-s<=0.001||y1-y0<=0.001)return;
    const c=(s+e)/2, yc=(y0+y1)/2;
    if(axis==="x") box(e-s,y1-y0,T,m,c,yc,fixed,grp); else box(T,y1-y0,e-s,m,fixed,yc,c,grp);
  };
  let cur=a0-T/2;
  openings.sort((a,b)=>a.s-b.s).forEach(o=>{
    piece(cur,o.s,0,H,full,mat.wall); piece(o.s,o.e,0,o.b,full,mat.wall); piece(o.s,o.e,o.t,H,full,mat.wall); cur=o.e;
    // glass + frame
    if(o.glass){
      const len=o.e-o.s, hh=o.t-o.b;
      if(axis==="x"){box(len,hh,0.02,mat.glass,(o.s+o.e)/2,(o.b+o.t)/2,fixed,full).castShadow=false;
        box(len,0.05,0.2,mat.trim,(o.s+o.e)/2,o.b,fixed,full); box(0.04,hh,0.06,mat.trim,(o.s+o.e)/2,(o.b+o.t)/2,fixed,full);}
      else{box(0.02,hh,len,mat.glass,fixed,(o.b+o.t)/2,(o.s+o.e)/2,full).castShadow=false;
        box(0.2,0.05,len,mat.trim,fixed,o.b,(o.s+o.e)/2,full); box(0.06,hh,0.04,mat.trim,fixed,(o.b+o.t)/2,(o.s+o.e)/2,full);}
    }
  });
  piece(cur,a1+T/2,0,H,full,mat.wall);
  piece(a0-T/2,a1+T/2,0,0.32,cut,mat.wall); piece(a0-T/2,a1+T/2,0.32,0.36,cut,mat.cap);
  const center=axis==="x"?new THREE.Vector3((a0+a1)/2,1,fixed):new THREE.Vector3(fixed,1,(a0+a1)/2);
  walls[id]={full,cut,outward:new THREE.Vector3(...outward),center,attached:[],isCut:false};
}
wall("back","x",-4,-6,6,[{s:-4.2,e:-1.8,b:0.8,t:2.4,glass:1},{s:2.7,e:4.3,b:1.35,t:2.35,glass:1}],[0,0,-1]);
wall("front","x",4,-6,6,[{s:-4,e:-2.4,b:0.9,t:2.3,glass:1}],[0,0,1]);
wall("left","z",-6,-4,4,[{s:2,e:3,b:0,t:2.2}],[-1,0,0]);
wall("right","z",6,-4,4,[{s:1,e:3,b:0.8,t:2.4,glass:1}],[1,0,0]);
function attach(id,...objs){walls[id].attached.push(...objs);}
// interior half walls
function half(axis,fixed,a,b){const h=1.05;if(axis==="x"){box(b-a,h,0.12,mat.wall,(a+b)/2,h/2,fixed);box(b-a,0.03,0.13,mat.cap,(a+b)/2,h+0.015,fixed);}else{box(0.12,h,b-a,mat.wall,fixed,h/2,(a+b)/2);box(0.13,0.03,b-a,mat.cap,fixed,h+0.015,(a+b)/2);}}
half("x",0,2.1,6); half("z",1,1.2,4);
// door frame (left wall)
const doorFrame=new THREE.Group(); root.add(doorFrame);
box(0.2,0.08,1.1,mat.trim,-6,2.24,2.5,doorFrame); box(0.2,2.24,0.06,mat.trim,-6,1.12,1.97,doorFrame); box(0.2,2.24,0.06,mat.trim,-6,1.12,3.03,doorFrame);
attach("left",doorFrame);

/* ============ products state ============ */
const S={
  light:{living:1,kitchen:1,bedroom:1,hall:0},
  curtain:{living:1,bed:1},
  locked:true, doorOpen:false, tv:false, ac:false, valveOpen:true, waterRun:true, gas:false, echo:0, hub:0, motion:0
};
const A={light:{living:0,kitchen:0,bedroom:0,hall:0},curL:1,curB:1,door:0,flap:0,day:0,dayT:0,valve:0};

/* ============ living room ============ */
// rug, sofa, table
const rug=new THREE.Mesh(new THREE.PlaneGeometry(2.4,3.2),mat.rug);rug.rotation.x=-Math.PI/2;rug.position.set(-3,0.006,-1.4);add(rug,null,false,true);
const sofa=new THREE.Group();root.add(sofa);sofa.position.set(-1.45,0,-1.4);
box(0.95,0.42,2.5,mat.fabric,0,0.24,0,sofa,.06); box(0.24,0.62,2.5,mat.fabric,0.36,0.62,0,sofa,.08);
box(0.95,0.56,0.2,mat.fabric,0,0.3,1.25,sofa,.07); box(0.95,0.56,0.2,mat.fabric,0,0.3,-1.25,sofa,.07);
box(0.7,0.14,1.08,mat.fabric3,-0.05,0.5,0.55,sofa,.06); box(0.7,0.14,1.08,mat.fabric3,-0.05,0.5,-0.55,sofa,.06);
const cush=box(0.14,0.42,0.42,mat.fabric2,0.2,0.75,0.75,sofa,.07);cush.rotation.z=-0.2;
const cush2=box(0.14,0.4,0.4,mat.fabric3,0.2,0.74,-0.8,sofa,.07);cush2.rotation.z=-0.2;
[[-.4,1.1],[-.4,-1.1],[.4,1.1],[.4,-1.1]].forEach(([x,z])=>cyl(.025,.02,.06,mat.woodDark,x,.03,z,sofa));
box(0.7,0.05,1.2,mat.woodMid,-3.1,0.42,-1.4,null,.02);
[[-.28,.52],[-.28,-.52],[.28,.52],[.28,-.52]].forEach(([x,z])=>cyl(.02,.02,.4,mat.black,-3.1+x,.2,-1.4+z));
const book=box(0.22,0.04,0.3,mat.fabric2,-3.15,0.465,-1.6); book.rotation.y=.3;
cyl(.07,.05,.12,mat.white,-3.0,.5,-1.15);
// TV console + TV on left wall
box(0.42,0.45,2.2,mat.woodDark,-5.7,0.24,-1.4,null,.02);
const tvGroup=new THREE.Group();root.add(tvGroup);
box(0.05,0.8,1.4,mat.black,-5.9,1.45,-1.4,tvGroup,.01);
const tvCanvas=document.createElement("canvas");tvCanvas.width=512;tvCanvas.height=292;
const tvTex=new THREE.CanvasTexture(tvCanvas);tvTex.encoding=THREE.sRGBEncoding;
const tvMat=new THREE.MeshStandardMaterial({color:"#050608",roughness:.15,metalness:.2,emissive:"#ffffff",emissiveMap:tvTex,emissiveIntensity:0});
const tvScreen=new THREE.Mesh(new THREE.PlaneGeometry(1.34,0.75),tvMat);tvScreen.rotation.y=Math.PI/2;tvScreen.position.set(-5.872,1.45,-1.4);tvGroup.add(tvScreen);
const tvLight=pointLight("#8fb8ff",-5.2,1.4,-1.4,4);
attach("left",tvGroup);
// socket on left wall
const socket=new THREE.Group();root.add(socket);
box(0.03,0.09,0.09,mat.white,-5.92,0.35,-0.15,socket,.01);
const socketLed=sph(.008,M("#222",{em:"#3BC283",ei:0}),-5.9,0.38,-0.12,socket);
attach("left",socket);
// hub on console
const hub=new THREE.Group();root.add(hub);
box(0.12,0.04,0.12,mat.white,-5.68,0.485,-2.2,hub,.02);
const hubLed=sph(.01,M("#222",{em:"#5B9BFF",ei:1}),-5.62,0.49,-2.2,hub);
// decor on console
cyl(.08,.06,.22,mat.pot,-5.7,.58,-0.6); sph(.14,mat.plant,-5.7,.8,-0.6);
// pendant over coffee table
cyl(.004,.004,.6,mat.black,-3.1,2.5,-1.4);
const pendShade=new THREE.Mesh(new THREE.SphereGeometry(.22,32,16,0,Math.PI*2,0,Math.PI/2),shadeMat());pendShade.position.set(-3.1,2.15,-1.4);add(pendShade,null,true,false);
const pendBulb=sph(.06,bulbMat(),-3.1,2.1,-1.4);pendBulb.castShadow=false;
const livL1=pointLight("#FFC48A",-3.1,1.95,-1.4,7);
// floor lamp
cyl(.16,.18,.03,mat.black,-1.2,.015,-3.3); cyl(.012,.012,1.5,mat.brass,-1.2,.76,-3.3);
const flShade=cyl(.17,.24,.3,shadeMat(),-1.2,1.62,-3.3,null,32);flShade.material.side=THREE.DoubleSide;
const flBulb=sph(.05,bulbMat(),-1.2,1.58,-3.3);flBulb.castShadow=false;
const livL2=pointLight("#FFC48A",-1.2,1.45,-3.3,5);
// side table + echo
cyl(.22,.22,.03,mat.woodMid,-1.4,.55,0.25); cyl(.02,.02,.54,mat.black,-1.4,.27,0.25); cyl(.15,.15,.02,mat.black,-1.4,.01,0.25);
const echoBody=cyl(.075,.075,.07,M("#2B2E33",{r:1}),-1.4,.6,0.25,null,32);
const echoRingMat=M("#0b1a2a",{em:"#33B8FF",ei:0});
const echoRing=new THREE.Mesh(new THREE.TorusGeometry(.065,.008,8,40),echoRingMat);echoRing.rotation.x=Math.PI/2;echoRing.position.set(-1.4,.636,0.25);add(echoRing,null,false,false);
// plant by window
cyl(.2,.15,.42,mat.pot,-4.9,.21,-3.45); [[0,.75,0,.32],[.12,1.0,.05,.24],[-.1,1.12,-.06,.2],[.04,.55,.12,.22]].forEach(([x,y,z,r],i)=>sph(r,i%2?mat.plant:mat.plant2,-4.9+x,y,-3.45+z));
// curtains
function curtains(cx,cy,cz,rotY,halfSpan,h,wallId){
  const g=new THREE.Group();g.position.set(cx,cy,cz);g.rotation.y=rotY;root.add(g);
  cyl(.015,.015,halfSpan*2+.3,mat.brass,0,h/2+.08,0,g).rotation.z=Math.PI/2;
  const mk=(sign)=>{
    const geo=new THREE.PlaneGeometry(halfSpan,h,48,1);geo.translate(halfSpan/2,0,0);
    const p=geo.attributes.position;for(let i=0;i<p.count;i++){p.setZ(i,Math.sin(p.getX(i)*28)*0.035);}geo.computeVertexNormals();
    const pivot=new THREE.Group();pivot.position.x=-sign*halfSpan;pivot.scale.x=sign;g.add(pivot);
    const mesh=new THREE.Mesh(geo,mat.curtain);mesh.castShadow=true;mesh.receiveShadow=true;pivot.add(mesh);
    return pivot;
  };
  const L=mk(1),Rr=mk(-1);attach(wallId,g);
  return {set(v){const s=0.16+0.84*(1-v);L.scale.x=s;Rr.scale.x=-s;}};
}
const curLiving=curtains(-3,1.42,-3.84,0,1.5,2.3,"back");
const curBed=curtains(5.84,1.42,2,-Math.PI/2,1.3,2.3,"right");
// AC unit on back wall
const ac=new THREE.Group();root.add(ac);ac.position.set(0,2.32,-3.8);
box(0.95,0.3,0.22,mat.white,0,0,0,ac,.04);
const flap=new THREE.Group();flap.position.set(0,-0.12,0.1);ac.add(flap);
box(0.85,0.015,0.08,M("#E4E6E8",{r:.4}),0,0,0.03,flap);
const acLed=box(0.06,0.02,0.005,M("#111",{em:"#5BD1FF",ei:0}),0.3,0.06,0.111,ac);
attach("back",ac);
const acParticles=(()=>{const n=90,pos=new Float32Array(n*3),life=new Float32Array(n);
  for(let i=0;i<n;i++){life[i]=Math.random();}
  const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:"#CFEFFF",size:.06,transparent:true,opacity:.55,depthWrite:false}));
  pts.visible=false;root.add(pts);return {pts,pos,life,n};})();
// control panel on left wall
const panelCanvas=document.createElement("canvas");panelCanvas.width=640;panelCanvas.height=400;
const panelTex=new THREE.CanvasTexture(panelCanvas);panelTex.encoding=THREE.sRGBEncoding;
const panel=new THREE.Group();root.add(panel);
box(0.03,0.36,0.56,mat.black,-5.92,1.4,0.9,panel,.015);
const panelScreen=new THREE.Mesh(new THREE.PlaneGeometry(0.52,0.325),new THREE.MeshStandardMaterial({color:"#000",emissive:"#fff",emissiveMap:panelTex,emissiveIntensity:1,roughness:.2}));
panelScreen.rotation.y=Math.PI/2;panelScreen.position.set(-5.903,1.4,0.9);panel.add(panelScreen);
attach("left",panel);

/* ============ hall / entrance ============ */
const doorPivot=new THREE.Group();doorPivot.position.set(-5.97,0,2.0);root.add(doorPivot);
box(0.05,2.18,0.98,mat.woodMid,0,1.09,0.5,doorPivot,.01);
box(0.06,0.5,0.6,mat.woodDark,0,1.55,0.5,doorPivot,.01);
const lockBody=box(0.06,0.26,0.075,mat.black,0.05,1.02,0.86,doorPivot,.015);
const lockLedMat=M("#111",{em:"#D9372B",ei:1.5});
const lockLed=sph(.012,lockLedMat,0.085,1.12,0.86,doorPivot);
box(0.05,0.03,0.14,mat.steel,0.09,0.98,0.8,doorPivot,.01);
attach("left",doorPivot);
// sconce
const sconce=new THREE.Group();root.add(sconce);
box(0.04,0.14,0.1,mat.brass,-5.92,2.0,3.5,sconce,.01);
const scShade=cyl(.09,.07,.16,shadeMat(),-5.82,2.05,3.5,sconce,24);
const scBulb=sph(.04,bulbMat(),-5.82,2.02,3.5,sconce);scBulb.castShadow=false;
const hallL=pointLight("#FFC48A",-5.5,2.0,3.3,6);
attach("left",sconce);
// motion sensor
const motion=new THREE.Group();root.add(motion);
const mDome=sph(.05,mat.white,-5.92,2.5,3.75,motion);mDome.scale.x=.6;
const motionLedMat=M("#111",{em:"#FF4433",ei:0});
sph(.01,motionLedMat,-5.89,2.47,3.75,motion);
attach("left",motion);
// shoe cabinet + mirror + plant
box(1.4,0.8,0.35,mat.woodMid,-4.3,0.4,3.75,null,.02); box(1.42,0.03,0.37,mat.woodDark,-4.3,0.815,3.75);
cyl(.09,.07,.2,mat.pot,-3.8,.93,3.75); sph(.13,mat.plant,-3.8,1.12,3.75);
// person (for motion / welcome scenes)
const person=new THREE.Group();root.add(person);
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.17,.72,6,16),mat.shirt);torso.position.y=.82;add(torso,person);
sph(.12,mat.skin,0,1.48,0,person);
person.visible=false;person.position.set(-7.2,0,2.5);
const walk={path:[],speed:1.1,done:null};

/* ============ kitchen ============ */
box(4.2,0.86,0.62,mat.cabinet,3.55,0.43,-3.62,null,.02);
box(4.26,0.04,0.66,mat.counter,3.55,0.88,-3.62,null,.01);
for(let i=0;i<6;i++)box(0.008,0.7,0.005,M("#0A1A38"),1.85+i*.68,0.45,-3.305);
box(1.2,0.7,0.36,mat.cabinet,1.9,1.98,-3.8,null,.02); box(1.2,0.7,0.36,mat.cabinet,5.1,1.98,-3.8,null,.02);
// sink + faucet + water
box(0.6,0.02,0.42,M("#9EA4AA",{r:.3,m:.8}),3.5,0.905,-3.6,null,.01);
cyl(.015,.015,.32,mat.steel,3.5,1.06,-3.82);
const spout=new THREE.Mesh(new THREE.TorusGeometry(.12,.012,8,24,Math.PI),mat.steel);spout.position.set(3.5,1.22,-3.7);spout.rotation.y=Math.PI/2;add(spout);
const water=cyl(.01,.014,.3,mat.water,3.5,1.04,-3.58,null,12);water.castShadow=false;
// cooktop
box(0.6,0.012,0.5,M("#0c0d10",{r:.15,m:.2}),5.0,0.905,-3.6,null,.004);
[[-.14,-.1],[.14,-.1],[-.14,.12],[.14,.12]].forEach(([x,z])=>{const r=new THREE.Mesh(new THREE.TorusGeometry(.07,.004,6,32),M("#444"));r.rotation.x=Math.PI/2;r.position.set(5+x,.913,-3.6+z);add(r,null,false,false);});
// gas sensor on backsplash
const gas=new THREE.Group();root.add(gas);
box(0.1,0.12,0.04,mat.white,5.0,1.38,-3.9,gas,.015);
const gasLedMat=M("#111",{em:"#3BC283",ei:1.2});
sph(.01,gasLedMat,5.0,1.42,-3.875,gas);
attach("back",gas);
const gasAlarm=pointLight("#FF3B2F",5.0,1.8,-3.0,7);
// water valve on backsplash
const valve=new THREE.Group();root.add(valve);
cyl(.025,.025,.5,mat.brass,2.25,1.15,-3.91,valve);
box(0.12,0.1,0.08,mat.brass,2.25,1.15,-3.89,valve,.015);
box(0.12,0.16,0.1,mat.black,2.25,1.3,-3.87,valve,.02);
const valveHandle=new THREE.Group();valveHandle.position.set(2.25,1.15,-3.84);valve.add(valveHandle);
box(0.18,0.025,0.02,M("#D9372B",{r:.5}),0.06,0,0,valveHandle,.008);
const valveLedMat=M("#111",{em:"#3BC283",ei:1.2});
sph(.009,valveLedMat,2.25,1.36,-3.818,valve);
attach("back",valve);
// fridge
box(0.75,1.95,0.7,mat.steel,5.55,0.975,-0.75,null,.04);
box(0.02,0.5,0.03,mat.black,5.17,1.25,-0.5);
// dining table + pendants
box(1.6,0.05,0.9,mat.woodMid,3.4,0.76,-1.75,null,.02);
[[-.7,-.38],[.7,-.38],[-.7,.38],[.7,.38]].forEach(([x,z])=>cyl(.025,.02,.74,mat.black,3.4+x,.37,-1.75+z));
[[2.85,-1.05],[3.95,-1.05],[2.85,-2.45],[3.95,-2.45]].forEach(([x,z])=>{box(.42,.04,.42,mat.fabric3,x,.47,z,null,.03);cyl(.02,.02,.45,mat.black,x,.225,z);});
const kBulbs=[],kShades=[];
[2.95,3.85].forEach(x=>{cyl(.004,.004,.75,mat.black,x,2.43,-1.75);const s=cyl(.05,.16,.22,shadeMat(),x,1.95,-1.75,null,32);kShades.push(s);const b=sph(.045,bulbMat(),x,1.86,-1.75);b.castShadow=false;kBulbs.push(b);});
kShades.forEach(s=>s.material=M("#2A2E33",{r:.5,m:.3,side:THREE.DoubleSide}));
const kitL=pointLight("#FFC48A",3.4,1.7,-1.75,7);

/* ============ bedroom ============ */
const rug2=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.2),M("#B7A894",{r:1}));rug2.rotation.x=-Math.PI/2;rug2.position.set(3.5,0.006,1.9);add(rug2,null,false,true);
box(1.95,1.15,0.1,mat.headboard,3.5,0.58,0.2,null,.05);
box(1.8,0.32,2.05,mat.woodMid,3.5,0.18,1.27,null,.03);
box(1.72,0.2,1.98,mat.white,3.5,0.43,1.27,null,.07);
box(1.76,0.08,1.5,mat.duvet,3.5,0.56,1.56,null,.04);
box(1.78,0.05,0.5,mat.throw,3.5,0.6,2.0,null,.02);
box(0.6,0.14,0.36,mat.fabric3,3.1,0.6,0.48,null,.07); box(0.6,0.14,0.36,mat.fabric3,3.9,0.6,0.48,null,.07);
const bedLamps=[],bedBulbs=[];
[2.2,4.8].forEach(x=>{box(.45,.48,.4,mat.woodDark,x,.24,.45,null,.02);cyl(.07,.08,.03,mat.brass,x,.495,.45);cyl(.012,.012,.28,mat.brass,x,.64,.45);
  const s=cyl(.13,.16,.2,shadeMat(),x,.84,.45,null,32);bedLamps.push(s);const b=sph(.035,bulbMat(),x,.8,.45);b.castShadow=false;bedBulbs.push(b);});
const bedL1=pointLight("#FFB877",2.2,0.95,0.55,4.5), bedL2=pointLight("#FFB877",4.8,0.95,0.55,4.5);
box(1.0,1.9,0.55,mat.woodMid,1.65,0.95,3.6,null,.02);

/* ============ zigbee network lines ============ */
const hubPos=new THREE.Vector3(-5.68,0.5,-2.2);
const netTargets=[[5.0,1.38,-3.9],[2.25,1.3,-3.87],[-5.92,2.5,3.75],[-3,2.5,-3.84],[5.84,2.5,2],[-5.92,1.4,0.9],[-5.92,1.02,2.86]];
const netLines=netTargets.map(t=>{
  const b=new THREE.Vector3(...t),mid=hubPos.clone().lerp(b,.5);mid.y+=1.6;
  const pts=new THREE.QuadraticBezierCurve3(hubPos,mid,b).getPoints(40);
  const g=new THREE.BufferGeometry().setFromPoints(pts);
  const l=new THREE.Line(g,new THREE.LineDashedMaterial({color:"#5B9BFF",dashSize:.12,gapSize:.08,transparent:true,opacity:.95}));
  l.computeLineDistances();l.visible=false;root.add(l);return l;
});

/* ============ screens (canvas UI) ============ */
function drawTV(){
  const g=tvCanvas.getContext("2d"),w=512,h=292;
  const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,"#1d3b6b");gr.addColorStop(.6,"#f2a93b");gr.addColorStop(1,"#c2410c");
  g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle="rgba(255,255,255,.9)";g.beginPath();g.arc(380,120,46,0,Math.PI*2);g.fill();
  g.fillStyle="#0c1a2e";g.beginPath();g.moveTo(0,h);g.lineTo(140,170);g.lineTo(240,230);g.lineTo(340,160);g.lineTo(w,h);g.fill();
  g.fillStyle="#fff";g.font="700 34px 'Readex Pro',sans-serif";g.textAlign="left";g.fillText("Techi",24,52);
  tvTex.needsUpdate=true;
}
function drawPanel(){
  const g=panelCanvas.getContext("2d"),w=640,h=400;
  g.fillStyle="#0E1520";g.fillRect(0,0,w,h);
  g.direction=LANG==="en"?"ltr":"rtl";g.textAlign="right";
  g.fillStyle="#E9EEF4";g.font="700 34px 'Readex Pro',sans-serif";g.fillText(TR("بيتي","My home"),w-28,56);
  g.fillStyle="#9AA6B6";g.font="500 22px 'IBM Plex Sans Arabic',sans-serif";
  g.fillText(A.dayT?TR("نهار · 31°","Day · 31°"):TR("بالليل · 27°","Night · 27°"),w-28,90);
  g.textAlign="left";g.direction="ltr";g.fillStyle="#E9EEF4";g.font="700 40px 'Readex Pro',sans-serif";g.fillText(A.dayT?"02:15":"09:40",28,60);
  const on=Object.values(S.light).filter(Boolean).length;
  const tiles=[[TR("النور","Lights"),on?on+TR(" شغالين"," on"):TR("مطفي","Off"),on>0],[TR("الستاير","Curtains"),(S.curtain.living||S.curtain.bed)?TR("مفتوحة","Open"):TR("مقفولة","Closed"),S.curtain.living||S.curtain.bed],
    [TR("الباب","Door"),S.locked?TR("مقفول","Locked"):TR("مفتوح","Open"),!S.locked],[TR("التكييف","AC"),S.ac?"24°":TR("مطفي","Off"),S.ac],[TR("الغاز","Gas"),S.gas?TR("تسريب!","Leak!"):TR("آمن","Safe"),S.gas],[TR("المية","Water"),S.valveOpen?TR("مفتوحة","Open"):TR("مقفولة","Closed"),S.valveOpen]];
  g.direction=LANG==="en"?"ltr":"rtl";g.textAlign="right";
  tiles.forEach((t,i)=>{const col=i%3,row=Math.floor(i/3),tw=184,th=118,x=w-28-tw-col*(tw+14),y=120+row*(th+14);
    const alert=i===4&&S.gas;
    g.fillStyle=alert?"#D9372B":t[2]?"#F2A93B":"#1B2533";g.beginPath();g.roundRect?g.roundRect(x,y,tw,th,16):g.rect(x,y,tw,th);g.fill();
    g.fillStyle=t[2]||alert?"#141B26":"#E9EEF4";if(alert)g.fillStyle="#fff";
    g.font="600 26px 'IBM Plex Sans Arabic',sans-serif";g.fillText(t[0],x+tw-16,y+44);
    g.font="500 22px 'IBM Plex Sans Arabic',sans-serif";g.fillText(t[1],x+tw-16,y+88);});
  panelTex.needsUpdate=true;
}


/* ============ glow sprites ============ */
const glowTex=(()=>{const c=document.createElement("canvas");c.width=c.height=128;const g=c.getContext("2d");const r=g.createRadialGradient(64,64,0,64,64,64);
  r.addColorStop(0,"rgba(255,255,255,1)");r.addColorStop(.25,"rgba(255,255,255,.45)");r.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=r;g.fillRect(0,0,128,128);
  const t=new THREE.CanvasTexture(c);return t;})();
function glow(x,y,z,color,size){const m=new THREE.SpriteMaterial({map:glowTex,color,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0});
  const s=new THREE.Sprite(m);s.position.set(x,y,z);s.scale.setScalar(size);root.add(s);return s;}
const glows={
  living:[glow(-3.1,2.08,-1.4,"#FFC48A",1.6),glow(-1.2,1.56,-3.3,"#FFC48A",1.3)],
  kitchen:[glow(2.95,1.84,-1.75,"#FFC48A",1.0),glow(3.85,1.84,-1.75,"#FFC48A",1.0)],
  bedroom:[glow(2.2,.82,.45,"#FFB877",1.0),glow(4.8,.82,.45,"#FFB877",1.0)],
  hall:[glow(-5.8,2.03,3.5,"#FFC48A",1.0)]
};
const gasGlow=glow(5.0,1.42,-3.85,"#FF3B2F",0.9), echoGlow=glow(-1.4,0.64,0.25,"#33B8FF",0.7), acGlow=glow(0.3,2.38,-3.68,"#5BD1FF",0.4), tvGlow=glow(-5.85,1.45,-1.4,"#7FA8FF",2.4);
// ripple ring for activation feedback
const ripple=new THREE.Mesh(new THREE.RingGeometry(0.55,0.62,64),new THREE.MeshBasicMaterial({color:0x5B8CFF,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));
ripple.rotation.x=-Math.PI/2;scene.add(ripple);let rippleT=1;
function pulseAt(v){ripple.position.set(v.x,0.02,v.z);rippleT=0;}

/* ============ devices ============ */
const D=[
 {id:"light_living",room:["الصالة","Living"],name:["سويتش النور","Light switch"],wall:null,pos:[-3.1,2.35,-1.4],cam:[2.8,2.4,4]},
 {id:"curtain_living",room:["الصالة","Living"],name:["سويتش الستارة","Curtain switch"],wall:"back",pos:[-3,2.6,-3.8],cam:[1.8,1.2,5.2]},
 {id:"ac",room:["الصالة","Living"],name:["ريموت التكييف IR","AC IR remote"],wall:"back",pos:[0,2.62,-3.75],cam:[.5,.6,5.5]},
 {id:"socket",room:["الصالة","Living"],name:["البريزة السمارت","Smart socket"],wall:"left",pos:[-5.9,0.55,-0.15],cam:[4.2,1.2,1.2]},
 {id:"hub",room:["الصالة","Living"],name:["Zigbee Hub","Zigbee Hub"],wall:null,pos:[-5.68,0.7,-2.2],cam:[4.5,3.6,3.2]},
 {id:"echo",room:["الصالة","Living"],name:["Echo Dot","Echo Dot"],wall:null,pos:[-1.4,0.85,0.25],cam:[2,1.4,2.6]},
 {id:"panel",room:["الصالة","Living"],name:["شاشة التحكم","Control panel"],wall:"left",pos:[-5.9,1.7,0.9],cam:[3,.6,.4]},
 {id:"lock",room:["المدخل","Entrance"],name:["الكالون الذكي","Smart lock"],wall:"left",pos:[-5.9,1.35,2.85],look:[-5,1,2.4],lookCam:[0.2,3.6,7.2]},
 {id:"motion",room:["المدخل","Entrance"],name:["حساس الحركة","Motion sensor"],wall:"left",pos:[-5.9,2.75,3.75],look:[-4.4,0.9,2.4],lookCam:[0.6,5.2,8]},
 {id:"gas",room:["المطبخ","Kitchen"],name:["حساس الغاز","Gas sensor"],wall:"back",pos:[5.0,1.62,-3.85],cam:[-.6,1.1,3.8]},
 {id:"valve",room:["المطبخ","Kitchen"],name:["محبس المياه","Water valve"],wall:"back",pos:[2.25,1.55,-3.85],cam:[.6,.9,3.6]},
 {id:"light_kitchen",room:["المطبخ","Kitchen"],name:["نور المطبخ","Kitchen lights"],wall:null,pos:[3.4,2.2,-1.75],cam:[1.8,2.2,4]},
 {id:"light_bedroom",room:["أوضة النوم","Bedroom"],name:["نور أوضة النوم","Bedroom lamps"],wall:null,pos:[2.2,1.15,.45],cam:[-1.4,2.2,3.4]},
 {id:"curtain_bed",room:["أوضة النوم","Bedroom"],name:["ستارة أوضة النوم","Bedroom curtain"],wall:"right",pos:[5.84,2.65,2],cam:[-4,1,.4]}
];
D.forEach((p,i)=>{p.n=i+1;p.v=new THREE.Vector3(...p.pos);});
const byId=Object.fromEntries(D.map(p=>[p.id,p]));
const clickMap=[
 [pendShade,"light_living"],[pendBulb,"light_living"],[flShade,"light_living"],[flBulb,"light_living"],
 [ac,"ac"],[socket,"socket"],[tvGroup,"socket"],[hub,"hub"],[echoBody,"echo"],[echoRing,"echo"],
 [panel,"panel"],[doorPivot,"lock"],[motion,"motion"],[gas,"gas"],[valve,"valve"],[water,"valve"],
 [kShades[0],"light_kitchen"],[kShades[1],"light_kitchen"],[bedLamps[0],"light_bedroom"],[bedLamps[1],"light_bedroom"]
];
clickMap.forEach(([o,id])=>o.traverse(c=>c.userData.pid=id));
walls.back.attached.forEach(g=>g.traverse(c=>{if(c.material===mat.curtain)c.userData.pid="curtain_living";}));
walls.right.attached.forEach(g=>g.traverse(c=>{if(c.material===mat.curtain)c.userData.pid="curtain_bed";}));

/* ============ language ============ */
let LANG=(window.TECHI_LANG==="en")?"en":"ar";
const TR=(a,e)=>LANG==="en"?e:a;
const L=v=>Array.isArray(v)?(LANG==="en"?v[1]:v[0]):v;
/* ============ host wiring ============ */
let host=null,pinsEl=null,listeners=[],running=false,visible=true;
const emit=(id,did)=>listeners.forEach(f=>f(id,did,S));
function notify(msg,alert){window.dispatchEvent(new CustomEvent("techi:notify",{detail:{msg,alert:!!alert}}));}
function buildPins(){
  pinsEl=document.createElement("div");pinsEl.className="t3d-pins";
  D.forEach(p=>{const b=document.createElement("button");b.className="t3d-pin";b.dataset.id=p.id;b.setAttribute("aria-label",L(p.name));
    b.innerHTML=`<i>${p.n}</i><span>${L(p.name)}</span>`;b.addEventListener("click",e=>{e.stopPropagation();activate(p.id,true);});pinsEl.appendChild(b);p.el=b;});
}
buildPins();

/* ============ camera ============ */
const fly={t:1,dur:1.3,fp:new THREE.Vector3(),ft:new THREE.Vector3(),tp:new THREE.Vector3(),tt:new THREE.Vector3()};
function flyTo(pos,target,dur){fly.fp.copy(camera.position);fly.ft.copy(controls.target);fly.tp.copy(pos);fly.tt.copy(target);fly.dur=dur||1.3;fly.t=0;}
let W=1,Hh=1;
function homeView(dur){const a=W/Hh;if(a<0.8){flyTo(new THREE.Vector3(-0.6,31,26),new THREE.Vector3(-0.6,0,0.6),dur);return;}const k=a<1.2?1.35:1;flyTo(new THREE.Vector3(4.2*k,10.5*k,12*k),new THREE.Vector3(0,0.3,0),dur);}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

/* ============ actions ============ */
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let walkToken=0;
function walkPath(path){return new Promise(res=>{walk.path=path.map(p=>new THREE.Vector3(p[0],0,p[1]));walk.done=res;});}
async function personEnter(token){
  person.visible=true;person.position.set(-7.3,0,2.5);walk.path=[];
  S.locked=false;S.doorOpen=true;drawPanel();
  await wait(700);if(token!==walkToken)return;
  await walkPath([[-5.2,2.5],[-4.0,2.4]]);if(token!==walkToken)return;
  await walkPath([[-3.2,1.2],[-2.6,0.6]]);
  S.doorOpen=false;await wait(600);S.locked=true;drawPanel();emit(null,"");
}
const ACT={
  light_living(){S.light.living^=1;return S.light.living?TR("نور الصالة ولّع","Living-room lights on"):TR("نور الصالة طفى","Living-room lights off");},
  light_kitchen(){S.light.kitchen^=1;return S.light.kitchen?TR("نور المطبخ والسفرة ولّع","Kitchen and dining lights on"):TR("نور المطبخ طفى","Kitchen lights off");},
  light_bedroom(){S.light.bedroom^=1;return S.light.bedroom?TR("الأباجورات ولّعت","Bedside lamps on"):TR("الأباجورات طفت","Bedside lamps off");},
  curtain_living(){S.curtain.living^=1;return S.curtain.living?TR("الستارة بتفتح","Curtain opening"):TR("الستارة بتقفل","Curtain closing");},
  curtain_bed(){S.curtain.bed^=1;return S.curtain.bed?TR("ستارة أوضة النوم بتفتح","Bedroom curtain opening"):TR("ستارة أوضة النوم بتقفل","Bedroom curtain closing");},
  ac(){S.ac=!S.ac;if(S.ac)notify(TR("التكييف اشتغل على 24°","AC on at 24°"));return S.ac?TR("التكييف اشتغل، والريشة فتحت والهوا طالع","AC on: the flap opens and cool air flows"):TR("التكييف طفى","AC off");},
  socket(){S.tv=!S.tv;return S.tv?TR("البريزة اشتغلت والتلفزيون فتح","Socket on, the TV powers up"):TR("البريزة فصلت والتلفزيون طفى","Socket off, the TV shuts down");},
  hub(){S.hub=6;return TR("الـ Hub بيكلم الحساسات والكالون والستاير والشاشة","The hub talks to the sensors, lock, curtains and panel");},
  echo(){S.echo=2.8;notify(TR("Alexa: تصبح على خير","Alexa: good night"));setTimeout(()=>runScene("sleep",true),1300);return TR("قلت \"أليكسا تصبح على خير\"، والبيت بيجهز للنوم","You said \"Alexa, good night\" and the home gets ready for sleep");},
  panel(){S.hub=3;return TR("الشاشة بتعرض حالة البيت كله وبتتحدث مع كل جهاز","The panel shows the whole home and updates with every device");},
  lock(){
    if(S.locked){S.locked=false;S.doorOpen=true;notify(TR("الباب اتفتح ببصمة الوش","Door unlocked by face ID"));return TR("الكالون فتح ببصمة الوش والباب اتفتح","Face ID unlocked the door and it opens");}
    S.doorOpen=false;setTimeout(()=>{S.locked=true;drawPanel();emit(null,"");},700);notify(TR("الباب اتقفل","Door locked"));return TR("الباب اتقفل والكالون قفل لوحده","The door closes and locks itself");},
  motion(){const tk=++walkToken;S.motion=1;personEnter(tk);notify(TR("حركة في المدخل، النور ولّع","Motion at the entrance, lights on"));return TR("حد دخل من الباب، والحساس ولّع نور المدخل لوحده","Someone walks in and the sensor turns the hall light on");},
  gas(){
    if(S.gas){S.gas=false;return TR("رجعنا الوضع الطبيعي","Back to normal");}
    S.gas=true;S.valveOpen=false;S.waterRun=false;notify(TR("⚠ تسريب غاز في المطبخ، ومحبس المية اتقفل","⚠ Gas leak in the kitchen. Water valve closed"),true);
    return TR("إنذار أحمر، وتنبيه على الموبايل، والمحبس اتقفل لوحده","Red alarm, a phone alert, and the valve shuts itself");},
  valve(){S.valveOpen=!S.valveOpen;S.waterRun=S.valveOpen;notify(S.valveOpen?TR("محبس المية اتفتح","Water valve opened"):TR("محبس المية اتقفل من الموبايل","Water valve closed from the app"));return S.valveOpen?TR("المحبس فتح والمية رجعت","Valve open, water flows again"):TR("المحبس لف واتقفل، والمية وقفت","The valve turns shut and the water stops");}
};
function activate(id,moveCam){
  const p=byId[id];if(!p)return;
  const did=ACT[id]();drawPanel();pulseAt(p.v);
  D.forEach(q=>q.el.classList.toggle("sel",q.id===id));
  if(moveCam){if(p.look)flyTo(new THREE.Vector3(...p.lookCam),new THREE.Vector3(...p.look));else flyTo(p.v.clone().add(new THREE.Vector3(...p.cam)),p.v.clone());}
  emit(id,did);return did;
}
async function runScene(name,fromEcho){
  homeView();
  if(name==="sleep"){
    Object.assign(S.light,{living:0,kitchen:0,hall:0});S.tv=false;S.curtain.living=0;S.curtain.bed=0;S.doorOpen=false;S.locked=true;S.ac=true;
    drawPanel();emit(null,"");await wait(1600);S.light.bedroom=0;drawPanel();emit(null,"");
    if(!fromEcho)notify(TR("وضع النوم: كله طفى، والباب اتقفل، والتكييف على 24°","Sleep mode: lights off, door locked, AC at 24°"));
  }else if(name==="away"){
    Object.assign(S.light,{living:0,kitchen:0,bedroom:0,hall:0});S.tv=false;S.ac=false;S.curtain.living=0;S.curtain.bed=0;S.doorOpen=false;S.locked=true;S.valveOpen=false;S.waterRun=false;
    person.visible=false;walkToken++;drawPanel();emit(null,"");notify(TR("خرجت من البيت: كله طفى، والباب مقفول، والمحبس مقفول","Away: everything off, door locked, water shut"));
  }else if(name==="home"){
    S.ac=true;S.light.living=1;S.light.kitchen=1;S.curtain.living=1;drawPanel();emit(null,"");notify(TR("قرّبت من البيت: التكييف اشتغل والنور ولّع","Almost home: AC on, lights on"));
    await wait(1200);const tk=++walkToken;S.motion=1;personEnter(tk);
  }
}
function setDay(on){A.dayT=on?1:0;drawPanel();}

/* ============ picking ============ */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let downAt=null;
function visibleChain(o){while(o){if(!o.visible)return false;o=o.parent;}return true;}
function pick(e){
  const r=R.domElement.getBoundingClientRect();ndc.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(ndc,camera);
  for(const h of ray.intersectObject(root,true)){if(!visibleChain(h.object))continue;if(h.object.material===mat.glass||h.object.isSprite)continue;return h.object.userData.pid||null;}
  return null;
}
R.domElement.addEventListener("pointerdown",e=>{downAt=[e.clientX,e.clientY];});
R.domElement.addEventListener("pointerup",e=>{if(!downAt)return;const d=Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1]);downAt=null;if(d>6)return;const id=pick(e);if(id)activate(id,false);});
R.domElement.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse"||downAt)return;R.domElement.style.cursor=pick(e)?"pointer":"grab";});

/* ============ loop ============ */
const GROUND_N=new THREE.Color("#030C1F"),GROUND_D=new THREE.Color("#1d2f52");
const clock=new THREE.Clock();const tmp=new THREE.Vector3();
const lerp=(a,b,k)=>a+(b-a)*k;
function setRoom(f,lights,max,bulbs,shades,gl){lights.forEach((l,i)=>l.intensity=f*max[i]);bulbs.forEach(b=>b.material.emissiveIntensity=f*3);shades.forEach(s=>{if(s.material.emissive)s.material.emissiveIntensity=f*.45;});gl.forEach(g=>g.material.opacity=f*(0.85-0.5*A.day));}
function frame(){
  if(!running)return;
  requestAnimationFrame(frame);
  const raw=clock.getDelta();if(!visible)return;
  const dt=Math.min(raw,0.05),t=clock.elapsedTime,k=1-Math.pow(0.0025,dt);
  if(fly.t<1){fly.t=Math.min(1,fly.t+Math.min(raw,0.25)/fly.dur);const e=ease(fly.t);camera.position.lerpVectors(fly.fp,fly.tp,e);controls.target.lerpVectors(fly.ft,fly.tt,e);}
  controls.update();
  A.day=lerp(A.day,A.dayT,1-Math.pow(0.05,dt));const d=A.day;
  sun.intensity=1.5*d;hemi.intensity=0.06+0.3*d;R.toneMappingExposure=1.05-0.12*d;
  ground.material.color.copy(GROUND_N).lerp(GROUND_D,d);
  allMats.forEach(m=>m.envMapIntensity=0.08+0.5*d);
  for(const r of ["living","kitchen","bedroom","hall"])A.light[r]=lerp(A.light[r],S.light[r],k);
  setRoom(A.light.living,[livL1,livL2],[2.2,1.3],[pendBulb,flBulb],[pendShade,flShade],glows.living);
  setRoom(A.light.kitchen,[kitL],[2.4],kBulbs,[],glows.kitchen);
  setRoom(A.light.bedroom,[bedL1,bedL2],[1.2,1.2],bedBulbs,bedLamps,glows.bedroom);
  setRoom(A.light.hall,[hallL],[1.8],[scBulb],[scShade],glows.hall);
  A.curL=lerp(A.curL,S.curtain.living,1-Math.pow(0.15,dt));A.curB=lerp(A.curB,S.curtain.bed,1-Math.pow(0.15,dt));
  curLiving.set(A.curL);curBed.set(A.curB);
  A.door=lerp(A.door,S.doorOpen?1.25:0,1-Math.pow(0.08,dt));doorPivot.rotation.y=A.door;
  lockLedMat.emissive.set(S.locked?"#D9372B":"#3BC283");
  tvMat.emissiveIntensity=lerp(tvMat.emissiveIntensity,S.tv?1:0,k);tvLight.intensity=tvMat.emissiveIntensity*0.7;tvGlow.material.opacity=tvMat.emissiveIntensity*0.35;
  socketLed.material.emissiveIntensity=S.tv?1.5:0;
  A.flap=lerp(A.flap,S.ac?0.9:0,k);flap.rotation.x=A.flap;acLed.material.emissiveIntensity=S.ac?2:0;acGlow.material.opacity=S.ac?.8:0;
  acParticles.pts.visible=A.flap>0.3;
  if(acParticles.pts.visible){const{pos,life,n}=acParticles;for(let i=0;i<n;i++){life[i]+=dt*0.45;if(life[i]>1)life[i]-=1;const L=life[i];
    pos[i*3]=((i*37)%90/90-.5)*0.8+Math.sin(t+i)*0.03;pos[i*3+1]=2.18-L*1.1;pos[i*3+2]=-3.65+L*1.9;}
    acParticles.pts.geometry.attributes.position.needsUpdate=true;acParticles.pts.material.opacity=0.5*Math.min(1,(A.flap-.3)*3);}
  if(S.echo>0){S.echo-=dt;if(S.echo<=0){S.echo=0;emit(null,"");}}
  echoRingMat.emissiveIntensity=S.echo>0?2+Math.sin(t*10)*1.2:0;echoGlow.material.opacity=S.echo>0?.7+Math.sin(t*10)*.3:0;
  if(S.hub>0){S.hub-=dt;if(S.hub<=0){S.hub=0;emit(null,"");}}
  netLines.forEach(l=>{l.visible=S.hub>0;l.material.dashOffset-=dt*0.6;});
  hubLed.material.emissiveIntensity=S.hub>0?1.5+Math.sin(t*12):0.8;
  gasAlarm.intensity=S.gas?(1.6+Math.sin(t*9)*1.4):0;gasLedMat.emissive.set(S.gas?(Math.sin(t*12)>0?"#FF2A1F":"#330000"):"#3BC283");gasGlow.material.opacity=S.gas?(.6+Math.sin(t*9)*.4):0;
  A.valve=lerp(A.valve,S.valveOpen?0:Math.PI/2,k);valveHandle.rotation.z=A.valve;
  valveLedMat.emissive.set(S.valveOpen?"#3BC283":"#D9372B");
  water.visible=S.valveOpen&&S.waterRun;water.scale.x=water.scale.z=1+Math.sin(t*30)*0.08;
  if(person.visible&&walk.path.length){const tgt=walk.path[0];tmp.copy(tgt).sub(person.position);tmp.y=0;const dist=tmp.length();
    if(dist<0.05){walk.path.shift();if(!walk.path.length&&walk.done){const r=walk.done;walk.done=null;r();}}
    else{tmp.normalize();person.position.addScaledVector(tmp,Math.min(dist,walk.speed*Math.min(raw,0.1)));person.rotation.y=Math.atan2(tmp.x,tmp.z);person.position.y=Math.abs(Math.sin(t*9))*0.04;}}
  const inHall=person.visible&&person.position.x>-6.1&&person.position.z>1.5;
  if(inHall&&!S.light.hall){S.light.hall=1;S.motion=1;drawPanel();emit(null,"");}
  if(S.light.hall&&!inHall){S.motion=Math.max(0,(S.motion||1)-dt*0.25);if(S.motion<=0.01){S.motion=0;S.light.hall=0;drawPanel();emit(null,"");}}
  motionLedMat.emissiveIntensity=inHall?(Math.sin(t*14)>0?2:0):0;
  if(rippleT<1){rippleT=Math.min(1,rippleT+dt/1.1);ripple.scale.setScalar(0.4+rippleT*2.4);ripple.material.opacity=(1-rippleT)*0.9;}
  for(const id in walls){const w=walls[id];tmp.copy(camera.position).sub(w.center);const cut=tmp.dot(w.outward)>0;
    if(cut!==w.isCut){w.isCut=cut;w.full.visible=!cut;w.cut.visible=cut;w.attached.forEach(o=>o.visible=!cut);}}
  for(const p of D){tmp.copy(p.v).project(camera);
    const hidden=tmp.z>1||(p.wall&&walls[p.wall].isCut);
    if(hidden){p.el.style.visibility="hidden";continue;}
    p.el.style.visibility="visible";p.el.style.transform=`translate(${(tmp.x*.5+.5)*W}px,${(-tmp.y*.5+.5)*Hh}px)`;
    p.el.classList.toggle("alert",p.id==="gas"&&S.gas);}
  R.render(scene,camera);
}
function resize(){if(!host)return;const r=host.getBoundingClientRect();W=Math.max(1,r.width);Hh=Math.max(1,r.height);
  R.setSize(W,Hh,false);camera.aspect=W/Hh;camera.updateProjectionMatrix();}
const ro=new ResizeObserver(()=>{resize();});
const io=new IntersectionObserver(es=>{visible=es[0].isIntersecting;});
camera.position.set(14,18,22);controls.target.set(0,0.3,0);
drawTV();drawPanel();
(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{drawTV();drawPanel();});

window.TechiHome={
  mount(el){
    if(host===el)return;
    if(host){ro.unobserve(host);io.unobserve(host);}
    host=el;el.appendChild(R.domElement);el.appendChild(pinsEl);ro.observe(el);io.observe(el);resize();
    camera.position.set(14,18,22);controls.target.set(0,0.3,0);homeView(2.2);
    if(!running){running=true;clock.getDelta();requestAnimationFrame(frame);}
  },
  unmount(){if(host){ro.unobserve(host);io.unobserve(host);}host=null;running=false;},
  activate,runScene,setDay,home:()=>homeView(),
  on(f){listeners.push(f);return()=>{listeners=listeners.filter(x=>x!==f);};},
  get devices(){return D.map(p=>({id:p.id,room:L(p.room),name:L(p.name),n:p.n}));},
  setLang(l){LANG=l==="en"?"en":"ar";D.forEach(p=>{p.el.setAttribute("aria-label",L(p.name));p.el.querySelector("span").textContent=L(p.name);});drawPanel();},
  state:S
};
})();
