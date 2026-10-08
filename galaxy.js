// galaxy.js - a 3D galaxy background for your portfolio
// Needs Three.js (load it BEFORE this file, see the <script> tags in the steps).

// ---------- 1. Basic setup: canvas, scene, camera, renderer ----------
const canvas = document.createElement('canvas');
canvas.id = 'galaxy';
document.body.prepend(canvas);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 2000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const isPhone = innerWidth < 700;                 // fewer stars on phones = smoother
// If the visitor turned on "reduce motion" in their device, we move gently instead of stopping.
const speed = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.3 : 1;

// ---------- 2. Stars: tiny dots scattered all around you ----------
function makeStars(count, size) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 500;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size, sizeAttenuation: true, transparent: true, opacity: 0.9 });
  return new THREE.Points(geo, mat);
}
const starsFar = makeStars(isPhone ? 800 : 2000, 0.6);
const starsNear = makeStars(isPhone ? 200 : 500, 1.2);
scene.add(starsFar, starsNear);

// ---------- 3. Spiral galaxy: thousands of glowing points in curved arms ----------
function makeGalaxy() {
  const count = isPhone ? 5000 : 12000, arms = 4, radius = 90;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const inside = new THREE.Color('#ffb36b');      // warm centre
  const outside = new THREE.Color('#5b6bff');     // blue edges
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 1.5) * radius;       // more points near the centre
    const angle = (i % arms) / arms * Math.PI * 2 + r * 0.08; // the "r * 0.08" bends the arms
    const scatter = () => (Math.random() - 0.5) * (2 + r * 0.12);
    pos[i * 3] = Math.cos(angle) * r + scatter();
    pos[i * 3 + 1] = scatter() * 0.4;                       // thin like a disc
    pos[i * 3 + 2] = Math.sin(angle) * r + scatter();
    const c = inside.clone().lerp(outside, r / radius);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.4, sizeAttenuation: true, vertexColors: true,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  });
  return new THREE.Points(geo, mat);
}
const galaxy = makeGalaxy();
galaxy.position.set(0, -15, -130);
galaxy.rotation.x = 0.9;                           // tilt it so we see the spiral
scene.add(galaxy);

// ---------- 4. Jupiter: a sphere wrapped in a drawn texture ----------
function jupiterTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  const bands = ['#d8b48a', '#a8754d', '#e9d3b4', '#b5875e', '#f0e0c8', '#9a6a45', '#dcc0a0'];
  for (let y = 0; y < 512; ) {                      // stripes of random colour and height
    const h = 20 + Math.random() * 50;
    g.fillStyle = bands[Math.floor(Math.random() * bands.length)];
    g.fillRect(0, y, 1024, h);
    y += h;
  }
  for (let i = 0; i < 400; i++) {                   // thin wavy lines make it look like clouds
    g.strokeStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
    g.beginPath();
    const yy = Math.random() * 512;
    g.moveTo(0, yy);
    for (let x = 0; x <= 1024; x += 32) g.lineTo(x, yy + Math.sin(x * 0.02 + i) * 4);
    g.stroke();
  }
  g.fillStyle = 'rgba(180,70,40,0.85)';             // the Great Red Spot
  g.beginPath(); g.ellipse(700, 330, 60, 30, 0, 0, Math.PI * 2); g.fill();
  return new THREE.CanvasTexture(c);
}
const jupiter = new THREE.Mesh(
  new THREE.SphereGeometry(6, 64, 64),
  new THREE.MeshStandardMaterial({ map: jupiterTexture(), roughness: 1 })
);
jupiter.position.set(16, 4, -5);
scene.add(jupiter);

// ---------- 5. A second planet with a ring (like Saturn) ----------
const ringPlanet = new THREE.Group();
const ball = new THREE.Mesh(
  new THREE.SphereGeometry(2.5, 48, 48),
  new THREE.MeshStandardMaterial({ color: 0x6a8cff, roughness: 0.8 })
);
const ring = new THREE.Mesh(
  new THREE.RingGeometry(3.6, 5.4, 64),
  new THREE.MeshBasicMaterial({ color: 0xbfd0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
);
ring.rotation.x = Math.PI / 2.3;
ringPlanet.add(ball, ring);
ringPlanet.position.set(-22, -12, -15);
scene.add(ringPlanet);

// ---------- 6. Lights (without light, planets look flat) ----------
scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(-20, 10, 20);
scene.add(sun);

// ---------- 7. Move with the mouse and the scroll ----------
let mx = 0, my = 0;
addEventListener('mousemove', e => {
  mx = (e.clientX / innerWidth - 0.5) * 2;
  my = (e.clientY / innerHeight - 0.5) * 2;
});

// ---------- 8. The animation loop: runs every frame ----------
const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime() * speed;
  jupiter.rotation.y += 0.006 * speed;                 // spin
  jupiter.position.y = 4 + Math.sin(t * 0.6) * 0.8;    // float up and down
  ringPlanet.rotation.y += 0.01 * speed;
  ringPlanet.position.y = -12 + Math.cos(t * 0.5) * 1;
  ring.rotation.z += 0.004 * speed;
  galaxy.rotation.y += 0.0015 * speed;                 // galaxy turns slowly
  starsFar.rotation.y += 0.0003 * speed;
  starsNear.rotation.y += 0.0006 * speed;
  camera.position.x += (mx * 3 - camera.position.x) * 0.03;           // smooth follow
  camera.position.y += (-my * 2 - scrollY * 0.01 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ---------- 9. Keep it correct when the window size changes ----------
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});