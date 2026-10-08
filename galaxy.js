/* galaxy.js — immersive galaxy backdrop for Talha's portfolio (Three.js r128)
   - spiral galaxy + 3 star layers + nebulae, all parallaxed against scroll
   - physically-styled Saturn: procedural bands, Cassini/Encke gaps,
     ring shadow on planet, planet shadow on rings, limb darkening, atmosphere
   - foreground dust motes (drawn ABOVE the content) so the page feels INSIDE space  */
(function () {
  'use strict';
  if (!window.THREE) return;
  var T = THREE;
  var mobile = Math.min(innerWidth, innerHeight) < 700;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || mobile;

  /* ---- tweak here ---- */
  var SATURN = { fx: mobile ? 0.80 : 0.82, fy: mobile ? 0.14 : 0.80, size: mobile ? 0.085 : 0.115, parallax: 0.30 };
  var SUN = new T.Vector3(-0.85, 0.38, 0.35).normalize();

  var host = document.getElementById('bg-fx') || document.body;
  Array.prototype.forEach.call(host.querySelectorAll('.fx-aurora'), function (e) { e.style.display = 'none'; });

  var renderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    host.style.background = 'radial-gradient(ellipse at 70% 20%,#1b1440 0,#07061a 55%,#02020a 100%)';
    return;
  }
  var PR = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);   // 2x costs 4x the pixels; 1.75 still looks sharp
  renderer.setPixelRatio(PR);
  renderer.setClearColor(0x03030c, 1);
  var cv = renderer.domElement;
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0;transition:opacity 1.6s ease';
  host.appendChild(cv);

  var FOV = 50, tanH = Math.tan(T.MathUtils.degToRad(FOV / 2));
  var scene = new T.Scene();
  var cam = new T.PerspectiveCamera(FOV, 1, 0.1, 1200);

  /* ---------- noise helpers (periodic in x so textures tile seamlessly) ---------- */
  function hash(x, y) {
    var h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function vnoise(x, y, px) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var x0 = ((xi % px) + px) % px, x1 = (x0 + 1) % px;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = hash(x0, yi), b = hash(x1, yi), c = hash(x0, yi + 1), d = hash(x1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, px, oct) {
    var s = 0, amp = 0.5, f = 1, tot = 0;
    for (var i = 0; i < oct; i++) { s += amp * vnoise(x * f, y * f, px * f); tot += amp; amp *= 0.5; f *= 2; }
    return s / tot;
  }
  function smooth(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  /* ---------- Saturn textures ---------- */
  function saturnTexture() {
    var W = 768, H = 384, c = document.createElement('canvas'); c.width = W; c.height = H;   // smaller = page loads faster
    var g = c.getContext('2d'), img = g.createImageData(W, H), d = img.data;
    var pal = [[0, [88, 82, 76]], [0.08, [126, 114, 98]], [0.18, [170, 150, 114]], [0.30, [216, 192, 144]],
      [0.40, [228, 206, 156]], [0.47, [196, 166, 118]], [0.52, [234, 214, 168]], [0.60, [224, 200, 148]],
      [0.70, [198, 172, 126]], [0.80, [172, 148, 112]], [0.90, [128, 114, 96]], [1, [92, 86, 78]]];
    function band(t) {
      for (var i = 1; i < pal.length; i++) if (t <= pal[i][0]) {
        var a = pal[i - 1], b = pal[i], k = (t - a[0]) / (b[0] - a[0]);
        return [a[1][0] + (b[1][0] - a[1][0]) * k, a[1][1] + (b[1][1] - a[1][1]) * k, a[1][2] + (b[1][2] - a[1][2]) * k];
      }
      return pal[pal.length - 1][1];
    }
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var u = x / W, v = y / H;
        var v2 = v + (fbm(u * 8, v * 6, 8, 4) - 0.5) * 0.035;
        var col = band(Math.min(1, Math.max(0, v2)));
        var streak = fbm(u * 6, v2 * 70, 6, 3), fine = fbm(u * 24, v2 * 150, 24, 2);
        var k = (0.86 + 0.28 * streak) * (0.92 + 0.16 * fine);
        var i = (y * W + x) * 4;
        d[i] = col[0] * k; d[i + 1] = col[1] * k; d[i + 2] = col[2] * k; d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    var t = new T.CanvasTexture(c); t.wrapS = T.RepeatWrapping; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  var R_IN = 1.24, R_OUT = 2.35; // in Saturn radii (C-ring start .. F-ring)
  function ringTexture() {
    var W = 2048, H = 4, c = document.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d'), img = g.createImageData(W, H), d = img.data;
    for (var x = 0; x < W; x++) {
      var r = R_IN + (x / (W - 1)) * (R_OUT - R_IN), a, col;
      var C = smooth(1.24, 1.30, r) * (1 - smooth(1.50, 1.53, r));
      var B = smooth(1.52, 1.58, r) * (1 - smooth(1.93, 1.96, r));
      var A = smooth(2.02, 2.05, r) * (1 - smooth(2.26, 2.28, r));
      var F = smooth(2.325, 2.332, r) * (1 - smooth(2.338, 2.345, r));
      var encke = smooth(2.205, 2.212, r) * (1 - smooth(2.222, 2.229, r));
      a = 0.14 * C + (0.78 + 0.18 * Math.sin(r * 38) * Math.sin(r * 11)) * B + 0.58 * A * (1 - 0.92 * encke) + 0.35 * F;
      a *= 0.62 + 0.76 * fbm((x / W) * 420, 0.5, 420, 3);
      a = Math.min(0.98, Math.max(0, a));
      var cc = [150, 136, 116], bb = [236, 218, 180], aa = [206, 188, 154];
      var wC = C, wB = B, wA = A + F, s = wC + wB + wA + 1e-4;
      col = [0, 1, 2].map(function (k) { return (cc[k] * wC + bb[k] * wB + aa[k] * wA) / s; });
      var tone = 0.9 + 0.2 * fbm((x / W) * 150, 3.3, 150, 2);
      for (var y = 0; y < H; y++) {
        var i = (y * W + x) * 4;
        d[i] = col[0] * tone; d[i + 1] = col[1] * tone; d[i + 2] = col[2] * tone; d[i + 3] = a * 255;
      }
    }
    g.putImageData(img, 0, 0);
    var t = new T.CanvasTexture(c); t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.wrapS = t.wrapT = T.ClampToEdgeWrapping;
    return t;
  }

  /* ---------- Saturn ---------- */
  var saturn = new T.Group(); scene.add(saturn);
  var U = {
    map: { value: null }, ringMap: { value: null }, sunDir: { value: SUN },
    center: { value: new T.Vector3() }, ringN: { value: new T.Vector3(0, 1, 0) },
    R: { value: 1 }, rIn: { value: R_IN }, rOut: { value: R_OUT }, uTime: { value: 0 }
  };
  var vertCommon = 'varying vec2 vUv;varying vec3 vN;varying vec3 vW;' +
    'void main(){vUv=uv;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';

  var planetMat = new T.ShaderMaterial({
    uniforms: U, vertexShader: vertCommon,
    fragmentShader: [
      'uniform sampler2D map,ringMap;uniform vec3 sunDir,center,ringN;uniform float R,rIn,rOut,uTime;',
      'varying vec2 vUv;varying vec3 vN;varying vec3 vW;',
      'void main(){',
      ' vec3 N=normalize(vN);vec3 V=normalize(cameraPosition-vW);',
      ' vec3 alb=texture2D(map,vec2(vUv.x+uTime*0.02,vUv.y)).rgb;',
      ' float ndl=dot(N,sunDir);',
      ' float diff=pow(clamp((ndl+0.06)/1.06,0.,1.),0.9);',
      ' float mu=clamp(dot(N,V),0.,1.);',
      ' float limb=0.32+0.68*pow(mu,0.45);',
      ' float sh=1.;vec3 P=vW-center;float den=dot(ringN,sunDir);',
      ' if(abs(den)>1e-4){float t=-dot(ringN,P)/den;if(t>0.){vec3 H=P+sunDir*t;float rr=length(H);',
      '  if(rr>rIn&&rr<rOut){float a=texture2D(ringMap,vec2((rr-rIn)/(rOut-rIn),.5)).a;sh=1.-a*0.92;}}}',
      ' vec3 col=alb*diff*sh*limb*1.3+alb*0.012;',
      ' float rim=pow(1.-mu,3.)*clamp(ndl+0.3,0.,1.);',
      ' col+=vec3(1.,.82,.55)*rim*0.26;',
      ' gl_FragColor=vec4(col,1.);}'
    ].join('\n')
  });
  var planet = new T.Mesh(new T.SphereGeometry(1, 96, 64), planetMat); saturn.add(planet);

  var halo = new T.Mesh(new T.SphereGeometry(1.07, 48, 32), new T.ShaderMaterial({
    transparent: true, depthWrite: false, side: T.BackSide, blending: T.AdditiveBlending,
    uniforms: { sunDir: U.sunDir },
    vertexShader: 'varying vec3 vN;varying vec3 vW;void main(){vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader: 'uniform vec3 sunDir;varying vec3 vN;varying vec3 vW;void main(){vec3 V=normalize(cameraPosition-vW);float f=pow(clamp(dot(-vN,V),0.,1.),3.5);float l=clamp(dot(-vN,sunDir)*0.5+0.6,0.,1.);gl_FragColor=vec4(vec3(1.,.8,.5)*f*l*0.55,f*l);}'
  }));
  saturn.add(halo);

  var ringGeo = new T.RingGeometry(R_IN, R_OUT, 256, 1);
  (function () {
    var p = ringGeo.attributes.position, uv = ringGeo.attributes.uv, v = new T.Vector3();
    for (var i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); uv.setXY(i, (v.length() - R_IN) / (R_OUT - R_IN), 0.5); }
  })();
  var ringMat = new T.ShaderMaterial({
    uniforms: U, vertexShader: vertCommon, transparent: true, depthWrite: false, side: T.DoubleSide,
    fragmentShader: [
      'uniform sampler2D ringMap;uniform vec3 sunDir,center,ringN;uniform float R;',
      'varying vec2 vUv;varying vec3 vN;varying vec3 vW;',
      'void main(){',
      ' vec4 t=texture2D(ringMap,vec2(vUv.x,.5));',
      ' vec3 P=vW-center;float b=dot(P,sunDir);float c=dot(P,P)-R*R;float disc=b*b-c;',
      ' float lit=1.;if(b<0.&&disc>0.)lit=1.-smoothstep(0.,0.10,disc/(R*R));',
      ' lit=mix(0.05,1.,lit);',
      ' float base=0.5+0.5*abs(dot(ringN,sunDir));',
      ' vec3 col=t.rgb*(base*lit*1.15+0.04);',
      ' gl_FragColor=vec4(col,t.a*0.97);}'
    ].join('\n')
  });
  var ring = new T.Mesh(ringGeo, ringMat); ring.rotation.x = -Math.PI / 2; saturn.add(ring);
  saturn.rotation.set(0.42, 0, -0.38);

  /* ---------- point-sprite shader (stars + galaxy) ---------- */
  function pointsMat(atten, opacity) {
    return new T.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false, blending: T.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPR: { value: PR }, uAtten: { value: atten }, uScale: { value: 420 }, uOp: { value: opacity } },
      vertexShader: 'attribute float aSize;attribute vec3 aColor;attribute float aPhase;uniform float uTime,uPR,uAtten,uScale;varying vec3 vC;varying float vT;' +
        'void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float s=aSize*uPR;if(uAtten>.5)s*=uScale/-mv.z;gl_PointSize=s;vC=aColor;vT=0.8+0.2*sin(uTime*(0.5+aPhase*1.7)+aPhase*60.);}',
      fragmentShader: 'uniform float uOp;varying vec3 vC;varying float vT;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=exp(-d*d*20.)+0.4*exp(-d*d*170.);gl_FragColor=vec4(vC*a*vT,a*vT*uOp);}'
    });
  }
  function makePoints(n, build, mat) {
    var pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n), ph = new Float32Array(n), o = {};
    for (var i = 0; i < n; i++) { build(i, o); pos.set(o.p, i * 3); col.set(o.c, i * 3); size[i] = o.s; ph[i] = Math.random(); }
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aColor', new T.BufferAttribute(col, 3));
    g.setAttribute('aSize', new T.BufferAttribute(size, 1)); g.setAttribute('aPhase', new T.BufferAttribute(ph, 1));
    var p = new T.Points(g, mat); p.frustumCulled = false; return p;
  }

  var layers = []; // {obj, z, f, by, bx}
  function addLayer(obj, z, f, bx, by) { obj.position.set(bx || 0, by || 0, z); scene.add(obj); layers.push({ obj: obj, z: z, f: f, bx: bx || 0, by: by || 0 }); return obj; }

  // star layers (blackbody-ish palette)
  var starCols = [[0.68, 0.78, 1], [0.85, 0.9, 1], [1, 1, 1], [1, 0.95, 0.82], [1, 0.82, 0.62], [1, 0.66, 0.5]];
  var starW = [0.12, 0.2, 0.3, 0.2, 0.12, 0.06];
  function pickStar() { var r = Math.random(), a = 0; for (var i = 0; i < starW.length; i++) { a += starW[i]; if (r < a) return starCols[i]; } return starCols[2]; }
  function starLayer(n, radius, sizeBase, opacity, f) {
    var m = pointsMat(0, opacity);
    var pts = makePoints(n, function (i, o) {
      var u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      o.p = [radius * s * Math.cos(th), radius * u * 1.6, radius * s * Math.sin(th) - radius * 0.3];
      var c = pickStar(), b = 0.45 + Math.random() * 0.55; o.c = [c[0] * b, c[1] * b, c[2] * b];
      o.s = sizeBase * (0.7 + Math.pow(Math.random(), 7) * 3.2);
    }, m);
    pts.userData.mat = m; return pts;
  }
  var mats = [], thinnable = []; // thinnable: {obj, n} so the governor can draw fewer points on a slow GPU
  [[mobile ? 1400 : 3200, 500, 2.0, 0.9, 0.02], [mobile ? 500 : 1100, 380, 2.8, 1.0, 0.05], [mobile ? 120 : 260, 260, 4.4, 1.0, 0.09]].forEach(function (L) {
    var s = starLayer(L[0], L[1], L[2], L[3]); mats.push(s.userData.mat); addLayer(s, -40, L[4], 0, 0);
    thinnable.push({ obj: s, n: L[0] });
  });

  // spiral galaxy disc
  (function () {
    var m = pointsMat(1, 0.55); mats.push(m);
    var N = mobile ? 15000 : 36000, ARMS = 4, RAD = 95;
    var gal = makePoints(N, function (i, o) {
      var bulge = i < N * 0.18, r, ang, x, y, z;
      if (bulge) { r = Math.pow(Math.random(), 2.2) * 16; ang = Math.random() * 6.283; x = Math.cos(ang) * r; z = Math.sin(ang) * r; y = (Math.random() - 0.5) * r * 0.5; }
      else {
        r = Math.pow(Math.random(), 1.6) * RAD; var arm = (i % ARMS) / ARMS * 6.283, spin = r * 0.075;
        var off = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.38 * r;
        var off2 = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.38 * r;
        x = Math.cos(arm + spin) * r + off; z = Math.sin(arm + spin) * r + off2; y = (Math.random() - 0.5) * 0.06 * r;
      }
      o.p = [x, y, z];
      var t = Math.min(1, Math.sqrt(x * x + z * z) / RAD), core = [1, 0.8, 0.52], mid = [0.72, 0.62, 0.95], edge = [0.38, 0.55, 1], c;
      if (t < 0.35) { var k = t / 0.35; c = [core[0] + (mid[0] - core[0]) * k, core[1] + (mid[1] - core[1]) * k, core[2] + (mid[2] - core[2]) * k]; }
      else { var k2 = (t - 0.35) / 0.65; c = [mid[0] + (edge[0] - mid[0]) * k2, mid[1] + (edge[1] - mid[1]) * k2, mid[2] + (edge[2] - mid[2]) * k2]; }
      if (!bulge && Math.random() < 0.05) c = [1, 0.45, 0.7];
      var b = bulge ? 0.9 : 0.35 + Math.random() * 0.5; o.c = [c[0] * b, c[1] * b, c[2] * b];
      o.s = bulge ? 1.6 + Math.random() * 1.8 : 1.0 + Math.random() * 2.4;
    }, m);
    var holder = new T.Group(); holder.add(gal); gal.rotation.x = 0; holder.rotation.set(-1.12, 0.1, 0.5);
    holder.userData.spin = gal; addLayer(holder, -170, 0.10, 38, 22); window.__galaxyDisc = gal;
    thinnable.push({ obj: gal, n: N });
  })();

  // nebulae
  function nebulaTexture(tint, seed) {
    var S = 192, c = document.createElement('canvas'); c.width = c.height = S;
    var g = c.getContext('2d'), img = g.createImageData(S, S), d = img.data;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var u = x / S, v = y / S, dx = u - 0.5, dy = v - 0.5, rr = Math.sqrt(dx * dx + dy * dy) * 2;
      var n = fbm(u * 4 + seed, v * 4 + seed, 1000, 5), n2 = fbm(u * 9 + seed * 3, v * 9, 1000, 3);
      var a = Math.max(0, (n - 0.38) * 2.4) * Math.pow(Math.max(0, 1 - rr), 1.6), i = (y * S + x) * 4, br = 0.55 + 0.7 * n2;
      d[i] = tint[0] * br; d[i + 1] = tint[1] * br; d[i + 2] = tint[2] * br; d[i + 3] = Math.min(255, a * 255);
    }
    g.putImageData(img, 0, 0); var t = new T.CanvasTexture(c); return t;
  }
  [[[150, 70, 230], 1.3, -150, -60, 40, 230, 0.55], [[60, 120, 255], 7.1, -190, 90, -10, 280, 0.5],
   [[255, 110, 150], 3.7, -210, -120, -120, 260, 0.38], [[90, 200, 230], 11.2, -160, 70, -150, 200, 0.35]].forEach(function (n) {
    var sp = new T.Sprite(new T.SpriteMaterial({ map: nebulaTexture(n[0], n[1]), transparent: true, depthWrite: false, depthTest: false, blending: T.AdditiveBlending, opacity: n[6] }));
    sp.scale.set(n[5], n[5], 1); addLayer(sp, n[2], 0.12 + Math.random() * 0.1, n[3], n[4]);
  });

  /* ---------- foreground dust (above content, makes the page feel inside the scene) ---------- */
  var dc = document.createElement('canvas'), dx = dc.getContext('2d');
  dc.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:2;pointer-events:none';
  document.body.appendChild(dc);
  var shoot = null, nextShoot = 3, fAcc = 0, fN = 0;
  var motes = []; for (var m = 0; m < (mobile ? 22 : 48); m++) motes.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.5, a: 0.07 + Math.random() * 0.22, f: 1.2 + Math.random() * 1.4, v: 2 + Math.random() * 6, ph: Math.random() * 6.28 });

  /* ---------- sizing, scroll, mouse ---------- */
  var sy = 0, tsy = 0, mx = 0, my = 0, tmx = 0, tmy = 0, W = 1, H = 1;
  var SATURN_Z = -30;
  function layoutSaturn() {
    var halfH = tanH * Math.abs(SATURN_Z), S = SATURN.size * 2 * halfH;
    saturn.scale.setScalar(S); U.R.value = S; U.rIn.value = R_IN * S; U.rOut.value = R_OUT * S;
  }
  var started = false;
  function resize() {
    W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
    dc.width = W; dc.height = H; layoutSaturn();
    if (started && mobile) frame();
  }
  addEventListener('resize', resize);
  if (!mobile) {
    addEventListener('scroll', function () { tsy = window.scrollY || 0; }, { passive: true });
    addEventListener('pointermove', function (e) { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });
  }

  /* ---------- performance governor ----------
     Watches real frame times. If the computer can't keep ~37fps it steps down, one stage per 60 frames:
       1) render at 1x pixel ratio   2) draw fewer galaxy/star points   3) "lite" mode: 30fps + CSS extras off
     A fast machine never leaves stage 0, so it keeps full quality. */
  var gov = window.__galaxyGov = { stage: 0, n: 0, slow: 0, born: performance.now(), last: performance.now(), skip: false, tick: false };
  document.addEventListener('visibilitychange', function () {
    gov.last = performance.now();
    if (mobile && started && !document.hidden) frame();
  });   // a hidden tab is not a slow tab
  function thin(f) { thinnable.forEach(function (o) { o.obj.geometry.setDrawRange(0, Math.floor(o.n * f)); }); }
  function degrade() {
    gov.stage++;
    if (gov.stage === 1) {
      if (PR > 1) { PR = 1; renderer.setPixelRatio(1); mats.forEach(function (m) { m.uniforms.uPR.value = 1; }); resize(); }
      else thin(0.6);
    } else if (gov.stage === 2) thin(0.4);
    else { thin(0.3); gov.skip = true; document.documentElement.classList.add('lite'); }
  }
  function govern(raw) {
    if (gov.stage >= 3 || performance.now() - gov.born < 2500) return;   // finished, or still loading
    gov.n++; if (raw > 27) gov.slow++;
    if (gov.n < 60) return;
    var bad = gov.slow / gov.n > 0.5; gov.n = gov.slow = 0;
    if (bad) degrade();
  }

  /* scroll "warp": the galaxy spins faster while you scroll fast, and when you click (motion.js calls __galaxyKick) */
  var warp = 0, warpT = 0, kick = 0;
  window.__galaxyKick = function () { kick = 1; };

  var clock = new T.Clock(), tmpQ = new T.Quaternion(), tmpV = new T.Vector3(), tmpN = new T.Vector3();
  function frame() {
    if (!mobile) requestAnimationFrame(frame);
    if (document.hidden) return;
    var nowMs = performance.now(); govern(nowMs - gov.last); gov.last = nowMs;
    if (gov.skip && (gov.tick = !gov.tick)) return;             // lite mode: draw every second frame
    var dt = Math.min(clock.getDelta(), 0.05), t = reduce ? 0 : clock.elapsedTime;
    sy += (tsy - sy) * 0.085; mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
    if (!reduce) { warp += (Math.max(Math.min(1, Math.abs(tsy - sy) / 500), kick) - warp) * 0.08; kick *= 0.95; warpT += dt * warp * 2.5; }
    cam.rotation.set(-my * 0.025 + Math.sin(t * 0.10) * 0.012, -mx * 0.04 + Math.sin(t * 0.07) * 0.02, Math.sin(t * 0.05) * 0.01);

    layers.forEach(function (L) {
      var wp = 2 * tanH * Math.abs(L.z) / H;
      L.obj.position.y = L.by + sy * L.f * wp; L.obj.position.x = L.bx - mx * L.f * 6;
    });
    if (!reduce && window.__galaxyDisc) window.__galaxyDisc.rotation.y += dt * (0.02 + warp * 0.45);
    mats.forEach(function (m) { m.uniforms.uTime.value = t; });

    // Saturn: pinned to a screen anchor, drifts up slower than the page
    var halfH = tanH * Math.abs(SATURN_Z), wp2 = 2 * halfH / H;
    saturn.position.set((SATURN.fx * 2 - 1) * halfH * cam.aspect - mx * 0.8,
      (1 - SATURN.fy * 2) * halfH + sy * SATURN.parallax * wp2 + Math.sin(t * 0.25) * 0.12, SATURN_Z);
    saturn.rotation.set(0.42 + Math.sin(t * 0.12) * 0.03, Math.sin(t * 0.07) * 0.15, -0.38 + Math.sin(t * 0.09) * 0.03);
    saturn.updateMatrixWorld(true);
    U.center.value.copy(saturn.position);
    ring.getWorldQuaternion(tmpQ); U.ringN.value.copy(tmpN.set(0, 0, 1).applyQuaternion(tmpQ)).normalize();
    U.uTime.value = t + warpT;

    renderer.render(scene, cam);

    dx.clearRect(0, 0, W, H);
    if (!reduce) {
      if (!shoot && t > nextShoot) { var sa = 0.2 + Math.random() * 0.5; shoot = { x: Math.random() * W * 0.8, y: Math.random() * H * 0.45, k: 0, vx: Math.cos(sa) * W * 0.35, vy: Math.sin(sa) * W * 0.35 }; }
      if (shoot) {
        shoot.k += dt / 0.8;
        var hx = shoot.x + shoot.vx * shoot.k, hy = shoot.y + shoot.vy * shoot.k, tx = hx - shoot.vx * 0.35, ty = hy - shoot.vy * 0.35;
        var gr = dx.createLinearGradient(tx, ty, hx, hy);
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,' + (0.9 * Math.sin(Math.min(1, shoot.k) * 3.14159)) + ')');
        dx.strokeStyle = gr; dx.lineWidth = 1.6; dx.beginPath(); dx.moveTo(tx, ty); dx.lineTo(hx, hy); dx.stroke();
        if (shoot.k >= 1) { shoot = null; nextShoot = t + 6 + Math.random() * 9; }
      }
    }
    for (var i = 0; i < motes.length; i++) {
      var p = motes[i], yy = (((p.y * H - sy * p.f - t * p.v) % H) + H) % H, xx = p.x * W + Math.sin(t * 0.3 + p.ph) * 14 - mx * 30 * p.f;
      dx.fillStyle = 'rgba(205,215,255,' + p.a + ')'; dx.beginPath(); dx.arc(xx, yy, p.r, 0, 6.283); dx.fill();
    }
  }

  function start() {
    var tex = saturnTexture(), rt = ringTexture();
    U.map.value = tex; U.ringMap.value = rt; gov.born = performance.now();
    started = true;
    resize(); frame(); requestAnimationFrame(function () { cv.style.opacity = 1; });
  }
  // let the page paint first, THEN build the planet textures (they take a moment on a slower CPU)
  function startSoon() { requestAnimationFrame(function () { setTimeout(start, 30); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startSoon); else startSoon();
})();