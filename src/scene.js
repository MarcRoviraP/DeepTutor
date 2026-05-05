import * as THREE from 'three';
import { GLTFLoader }    from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const wrap    = document.getElementById('scene-wrap');
const canvas  = document.getElementById('c');
const loadTxt = document.getElementById('load-txt');

const scene    = new THREE.Scene();
const clock    = new THREE.Clock();
const camera   = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.01, 100);
camera.position.set(0, 1.55, 2.6);
camera.lookAt(0, 1.4, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(wrap.clientWidth, wrap.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.4, 0);
controls.minDistance = 1;
controls.maxDistance = 6;

scene.add(new THREE.AmbientLight(0x9977ff, 0.7));
const dirL = new THREE.DirectionalLight(0xffffff, 1.4);
dirL.position.set(2, 4, 3); dirL.castShadow = true; scene.add(dirL);
const fillL = new THREE.DirectionalLight(0xc084fc, 0.5);
fillL.position.set(-2, 2, -1); scene.add(fillL);
const rimL = new THREE.PointLight(0x6e5aff, 2, 8);
rimL.position.set(0, 2.5, -2); scene.add(rimL);

let avatarGroup = null;
let hablando    = false;
let tHabla      = 0;
let mixer       = null;
let idleAction  = null;
let talkAction  = null;

function crearAvatar() {
  const g = new THREE.Group();
  g.userData.baseY = 0;
  const mC = new THREE.MeshPhongMaterial({ color:0x2a1a5e, emissive:0x110830, shininess:80, specular:0x6e5aff });
  const mF = new THREE.MeshPhongMaterial({ color:0x3a2a7e, emissive:0x190a4a, shininess:120 });
  const mO = new THREE.MeshPhongMaterial({ color:0xb48cff, emissive:0x6e5aff, shininess:200 });
  const mB = new THREE.MeshPhongMaterial({ color:0x6e5aff, emissive:0x3a1090 });
  const mR = new THREE.MeshPhongMaterial({ color:0x6e5aff, emissive:0x4a2acc, transparent:true, opacity:.65 });

  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,.65,12), mC);
  cuerpo.position.set(0,.9,0); g.add(cuerpo);
  [-.32,.32].forEach(x => { const h=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),mC); h.position.set(x,1.15,0); g.add(h); });

  const cuello = new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.16,10), mF);
  cuello.position.set(0,1.32,0); g.add(cuello);

  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(.26,16,16), mF);
  cabeza.position.set(0,1.66,0); g.add(cabeza); g.userData.cabeza = cabeza;

  [-.09,.09].forEach(x => { const o=new THREE.Mesh(new THREE.SphereGeometry(.04,8,8),mO); o.position.set(x,1.69,.23); g.add(o); });

  const boca = new THREE.Mesh(new THREE.TorusGeometry(.065,.012,8,16,Math.PI), mB);
  boca.position.set(0,1.56,.24); boca.rotation.z=Math.PI; g.add(boca); g.userData.boca = boca;

  for(let i=0;i<3;i++){
    const r=new THREE.Mesh(new THREE.TorusGeometry(.18,.007,6,24),mR.clone());
    r.position.set(0,.78+i*.2,0); r.rotation.x=Math.PI/2; g.add(r); g.userData['r'+i]=r;
  }

  const pGeo = new THREE.BufferGeometry();
  const pos=[]; for(let i=0;i<60;i++) pos.push((Math.random()-.5)*1.4,.5+Math.random()*1.6,(Math.random()-.5)*1.4);
  pGeo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  const pts=new THREE.Points(pGeo,new THREE.PointsMaterial({color:0xb48cff,size:.018,transparent:true,opacity:.55}));
  g.add(pts); g.userData.pts=pts;

  const suelo=new THREE.Mesh(new THREE.CircleGeometry(.9,32),new THREE.MeshPhongMaterial({color:0x6e5aff,emissive:0x3a1080,transparent:true,opacity:.15,side:THREE.DoubleSide}));
  suelo.rotation.x=-Math.PI/2; suelo.position.y=.54; scene.add(suelo);

  scene.add(g); avatarGroup=g;
}

const GLB_URL = 'sketchbot.glb';
function cargarGLB() {
  if (!GLB_URL) return;
  new GLTFLoader().load(GLB_URL, gltf => {
    scene.remove(avatarGroup);
    const m = gltf.scene;

    const box    = new THREE.Box3().setFromObject(m);
    const size   = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const sc     = 1.2 / size.y;
    m.userData.initialSc = sc;
    m.position.sub(center);

    const defScale = parseFloat(document.getElementById('sl-scale').value);
    const defY     = parseFloat(document.getElementById('sl-y').value);
    const defX     = parseFloat(document.getElementById('sl-x').value);
    const defZ     = parseFloat(document.getElementById('sl-z').value);

    m.userData.baseScale = sc * defScale;
    m.scale.setScalar(m.userData.baseScale);
    m.userData.baseY = defY;
    m.userData.baseX = defX;
    m.userData.baseZ = defZ;
    m.position.set(defX, defY, defZ);

    scene.add(m);
    avatarGroup = m;

    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(m);
      idleAction = mixer.clipAction(gltf.animations[0]); // 'Base'
      idleAction.play();
      if (gltf.animations.length > 1) {
        talkAction = mixer.clipAction(gltf.animations[1]); // 'Computation'
      }
    }

    setTimeout(() => {
      const ld = document.getElementById('loading');
      if (ld) { ld.style.opacity = '0'; setTimeout(() => ld.remove(), 500); }
    }, 200);

  }, xhr => {
    const pct = xhr.total > 0 ? Math.round(xhr.loaded / xhr.total * 100) : Math.round(xhr.loaded / 1024) + ' KB';
    loadTxt.textContent = `GLB cargando… ${pct}${xhr.total > 0 ? '%' : ''}`;
  }, err => {
    console.error('GLB Error:', err);
    loadTxt.textContent = '❌ Error cargando GLB. Revisá la consola.';
    setTimeout(() => {
      const ld = document.getElementById('loading');
      if (ld) { ld.style.opacity = '0'; setTimeout(() => ld.remove(), 500); }
    }, 4000);
  });
}

crearAvatar();
cargarGLB();

if (!GLB_URL) {
  setTimeout(() => {
    const ld = document.getElementById('loading');
    if (ld) { ld.style.opacity = '0'; setTimeout(() => ld.remove(), 500); }
  }, 500);
}

window.addEventListener('resize', () => {
  camera.aspect = wrap.clientWidth / wrap.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
});

(function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta(), t = clock.getElapsedTime();
  controls.update();
  if (mixer) mixer.update(dt);

  if (avatarGroup) {
    const baseY = avatarGroup.userData.baseY ?? 0;
    avatarGroup.rotation.y = Math.sin(t * 0.8) * 0.25;
    avatarGroup.position.y = baseY + Math.sin(t * 1.5) * 0.06;

    if (hablando) {
      tHabla += dt;
      if (talkAction && idleAction) {
        if (!talkAction.isRunning()) { talkAction.play(); idleAction.stop(); }
      }
      if (avatarGroup.userData.cabeza) { avatarGroup.userData.cabeza.rotation.x=Math.sin(tHabla*9)*.05; avatarGroup.userData.cabeza.rotation.z=Math.sin(tHabla*5.5)*.03; }
      if (avatarGroup.userData.boca)   { avatarGroup.userData.boca.scale.y=1+Math.abs(Math.sin(tHabla*13))*.7; }
      if (!talkAction && avatarGroup.userData.baseScale) {
        avatarGroup.rotation.z = Math.sin(tHabla * 15) * 0.08;
        avatarGroup.scale.y = avatarGroup.userData.baseScale * (1 + Math.abs(Math.sin(tHabla * 15)) * 0.15);
        avatarGroup.scale.x = avatarGroup.userData.baseScale * (1 - Math.abs(Math.sin(tHabla * 15)) * 0.05);
        avatarGroup.scale.z = avatarGroup.userData.baseScale * (1 - Math.abs(Math.sin(tHabla * 15)) * 0.05);
      }
      for (let i=0;i<3;i++) { const r=avatarGroup.userData['r'+i]; if(r){r.material.opacity=.3+Math.abs(Math.sin(tHabla*5+i))*.6; r.scale.setScalar(1+Math.sin(tHabla*4+i*1.2)*.09);} }
    } else {
      if (talkAction && idleAction) {
        if (talkAction.isRunning()) { talkAction.stop(); idleAction.play(); }
      }
      if (avatarGroup.userData.cabeza) { avatarGroup.userData.cabeza.rotation.x*=.88; avatarGroup.userData.cabeza.rotation.z*=.88; }
      if (avatarGroup.userData.boca)   { avatarGroup.userData.boca.scale.y+=(1-avatarGroup.userData.boca.scale.y)*.12; }
      if (!talkAction && avatarGroup.userData.baseScale) {
        avatarGroup.rotation.z *= 0.88;
        avatarGroup.scale.y += (avatarGroup.userData.baseScale - avatarGroup.scale.y) * 0.2;
        avatarGroup.scale.x += (avatarGroup.userData.baseScale - avatarGroup.scale.x) * 0.2;
        avatarGroup.scale.z += (avatarGroup.userData.baseScale - avatarGroup.scale.z) * 0.2;
      }
      for (let i=0;i<3;i++) { const r=avatarGroup.userData['r'+i]; if(r){r.material.opacity+=(.5-r.material.opacity)*.05; r.scale.setScalar(1);} }
    }
    if (avatarGroup.userData.pts) avatarGroup.userData.pts.rotation.y = t * .18;
  }
  if (hablando) { document.querySelectorAll('.bar').forEach((b,i) => { b.style.height=(3+Math.abs(Math.sin(t*(4+i*1.4)+i))*27)+'px'; }); }
  renderer.render(scene, camera);
})();

// ─── API pública ──────────────────────────────────────────────────────
export function setHablando(v) {
  hablando = v;
  if (!v) tHabla = 0;
}
export function setAvatarScale(mult) {
  if (avatarGroup?.userData?.initialSc) {
    const s = avatarGroup.userData.initialSc * mult;
    avatarGroup.userData.baseScale = s;
    avatarGroup.scale.setScalar(s);
  }
}
export function setAvatarY(y) { if (avatarGroup) avatarGroup.userData.baseY = y; }
export function setAvatarX(x) { if (avatarGroup) { avatarGroup.userData.baseX = x; avatarGroup.position.x = x; } }
export function setAvatarZ(z) { if (avatarGroup) { avatarGroup.userData.baseZ = z; avatarGroup.position.z = z; } }
