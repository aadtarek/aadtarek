/* Techi background: the logo's network mark, unfolded into a living Zigbee mesh globe.
   Exposes window.TechiBG = { g (THREE.Group), morph, lux, dim, size() } — the app animates these with GSAP. */
import * as THREE from "three";
export function createBG(cv){
let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:"low-power"});}catch(e){return null;}
R.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));R.setClearColor(0x000000,0);
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(32,1,.1,100);cam.position.set(0,0,11);
const g=new THREE.Group();scene.add(g);
const inner=new THREE.Group();g.add(inner);
const RAD=2.7;

/* --- the logo mark (same geometry as the brand mark) --- */
const LN=[[185,25,22],[252,73,11],[357,113,11],[292,158,16],[180,158,23],[25,192,24],[102,245,21],[200,252,34],[345,245,11],[430,192,18],[517,265,17],[285,288,11],[430,326,18],[160,353,16],[322,352,18],[52,381,16],[202,407,16],[452,415,34],[272,505,34],[320,18,6],[325,76,11],[408,54,8],[446,106,10],[536,169,13]];
const LE=[[0,1],[0,4],[0,5],[1,4],[1,3],[4,3],[4,5],[4,6],[4,8],[3,7],[3,2],[2,9],[2,8],[9,8],[9,12],[8,11],[8,14],[8,12],[6,7],[6,13],[6,15],[5,15],[7,11],[7,13],[13,11],[11,16],[11,18],[11,14],[13,15],[15,16],[15,18],[16,18],[14,18],[14,12],[12,10],[12,17],[17,18]];
const S=4.9/540;
const nodes=[];
LN.forEach(([x,y,r])=>{const fx=(x-280)*S,fy=-(y-270)*S;const d2=fx*fx+fy*fy;const z=Math.sqrt(Math.max(0.05,RAD*RAD-d2));
  const sp=new THREE.Vector3(fx,fy,z).normalize().multiplyScalar(RAD);
  nodes.push({flat:new THREE.Vector3(fx,fy,0),sph:sp,size:6+r*.55,logo:true});});
/* --- the rest of the mesh: a fibonacci sphere --- */
const N=170;
for(let i=0;i<N;i++){const y=1-(i/(N-1))*2,r=Math.sqrt(1-y*y),th=i*2.399963;const v=new THREE.Vector3(Math.cos(th)*r,y,Math.sin(th)*r).multiplyScalar(RAD);
  if(v.z>RAD*.55&&Math.abs(v.x)<RAD*.75&&Math.abs(v.y)<RAD*.8)continue; // keep the logo face clean
  nodes.push({flat:v.clone().multiplyScalar(.25),sph:v,size:Math.random()<.12?9:4+Math.random()*3,logo:false});}
const edges=LE.map(([a,b])=>[a,b,1]);
const firstMesh=LN.length;
for(let i=firstMesh;i<nodes.length;i++){const d=[];for(let j=0;j<nodes.length;j++){if(j===i)continue;d.push([nodes[i].sph.distanceToSquared(nodes[j].sph),j]);}
  d.sort((a,b)=>a[0]-b[0]);for(let k=0;k<3;k++){const j=d[k][1];if(!edges.some(e=>(e[0]===i&&e[1]===j)||(e[0]===j&&e[1]===i)))edges.push([i,j,0]);}}
const pos=nodes.map(n=>n.flat.clone());

/* --- points --- */
const dot=(()=>{const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d");const r=x.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,"rgba(255,255,255,1)");r.addColorStop(.35,"rgba(255,255,255,1)");r.addColorStop(.5,"rgba(255,255,255,.35)");r.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=r;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
const pGeo=new THREE.BufferGeometry();const pArr=new Float32Array(nodes.length*3),sArr=new Float32Array(nodes.length),aArr=new Float32Array(nodes.length);
nodes.forEach((n,i)=>{sArr[i]=n.size;aArr[i]=n.logo?1:0;});
pGeo.setAttribute("position",new THREE.BufferAttribute(pArr,3));pGeo.setAttribute("size",new THREE.BufferAttribute(sArr,1));pGeo.setAttribute("alpha",new THREE.BufferAttribute(aArr,1));
const U={uTex:{value:dot},uPx:{value:1},uCol:{value:new THREE.Color("#DCE8FF")},uWarm:{value:new THREE.Color("#FFD49A")},uLux:{value:0},uDim:{value:1}};
const pMat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`attribute float size;attribute float alpha;varying float vA;varying float vD;uniform float uPx;
    void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;vD=clamp((-mv.z-7.)/7.,0.,1.);vA=alpha;gl_PointSize=size*uPx*(10./-mv.z);}`,
  fragmentShader:`uniform sampler2D uTex;uniform vec3 uCol;uniform vec3 uWarm;uniform float uLux;uniform float uDim;varying float vA;varying float vD;
    void main(){vec4 t=texture2D(uTex,gl_PointCoord);vec3 c=mix(uCol,uWarm,uLux*.8);gl_FragColor=vec4(c,t.a*vA*(1.-vD*.75)*uDim);}`});
const points=new THREE.Points(pGeo,pMat);inner.add(points);

/* --- lines --- */
function lineSet(filter){const list=edges.filter(filter);const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(new Float32Array(list.length*6),3));
  const mat=new THREE.LineBasicMaterial({color:0x9CC0FF,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});const l=new THREE.LineSegments(geo,mat);inner.add(l);return{list,geo,mat,l};}
const logoL=lineSet(e=>e[2]===1), meshL=lineSet(e=>e[2]===0);
function writeLines(set){const a=set.geo.attributes.position.array;set.list.forEach(([i,j],k)=>{const p=pos[i],q=pos[j];a.set([p.x,p.y,p.z,q.x,q.y,q.z],k*6);});set.geo.attributes.position.needsUpdate=true;}

/* --- pulses: packets travelling along the mesh --- */
const PN=60;const puGeo=new THREE.BufferGeometry();const puArr=new Float32Array(PN*3),puS=new Float32Array(PN).fill(7),puA=new Float32Array(PN);
puGeo.setAttribute("position",new THREE.BufferAttribute(puArr,3));puGeo.setAttribute("size",new THREE.BufferAttribute(puS,1));puGeo.setAttribute("alpha",new THREE.BufferAttribute(puA,1));
const PU={...U,uCol:{value:new THREE.Color("#FFFFFF")}};
const puMat=new THREE.ShaderMaterial({uniforms:PU,vertexShader:pMat.vertexShader,fragmentShader:pMat.fragmentShader,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
inner.add(new THREE.Points(puGeo,puMat));
const pulses=Array.from({length:PN},()=>({e:edges[(Math.random()*edges.length)|0],t:Math.random(),sp:.3+Math.random()*.7}));

/* --- api --- */
const api={g,morph:0,lux:0,dim:1,spin:1,mx:0,my:0,
  size(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();U.uPx.value=R.getPixelRatio()*(Math.min(w,h)/900+.4);PU.uPx.value=U.uPx.value;},
  halfWidth(){return Math.tan(THREE.MathUtils.degToRad(cam.fov/2))*cam.position.z*cam.aspect;}};
addEventListener("resize",api.size);api.size();
addEventListener("pointermove",e=>{api.mx=e.clientX/innerWidth-.5;api.my=e.clientY/innerHeight-.5;},{passive:true});
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
let last=performance.now(),lastM=-1,rot=0,tiltX=0,tiltY=0;
function frame(now){
  requestAnimationFrame(frame);if(document.hidden)return;
  const dt=Math.min(.05,(now-last)/1000);last=now;
  const m=api.morph;
  if(m!==lastM){const e=m<.5?4*m*m*m:1-Math.pow(-2*m+2,3)/2;
    nodes.forEach((n,i)=>{pos[i].lerpVectors(n.flat,n.sph,e);pArr[i*3]=pos[i].x;pArr[i*3+1]=pos[i].y;pArr[i*3+2]=pos[i].z;if(!n.logo)aArr[i]=Math.min(1,e*1.2)*.9;});
    pGeo.attributes.position.needsUpdate=true;pGeo.attributes.alpha.needsUpdate=true;writeLines(logoL);writeLines(meshL);lastM=m;}
  logoL.mat.opacity=(.55-.25*m)*api.dim;meshL.mat.opacity=.22*m*api.dim;
  U.uLux.value=api.lux;U.uDim.value=api.dim;PU.uLux.value=api.lux;PU.uDim.value=api.dim;
  if(!reduce)rot+=dt*.07*api.spin*m;
  tiltX+=(api.my*.25-tiltX)*.04;tiltY+=(api.mx*.35-tiltY)*.04;
  inner.rotation.set(tiltX,rot+tiltY,0);
  // packets
  for(let k=0;k<PN;k++){const p=pulses[k];p.t+=dt*p.sp*(.6+api.lux);if(p.t>1){p.t=0;p.e=edges[(Math.random()*edges.length)|0];p.sp=.3+Math.random()*.7;}
    const a=pos[p.e[0]],b=pos[p.e[1]];puArr[k*3]=a.x+(b.x-a.x)*p.t;puArr[k*3+1]=a.y+(b.y-a.y)*p.t;puArr[k*3+2]=a.z+(b.z-a.z)*p.t;
    puA[k]=Math.sin(p.t*Math.PI)*(p.e[2]?1:m)*.9;}
  puGeo.attributes.position.needsUpdate=true;puGeo.attributes.alpha.needsUpdate=true;
  R.render(scene,cam);
}
requestAnimationFrame(frame);
return api;
}
