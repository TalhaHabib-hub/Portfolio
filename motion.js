// motion.js — movement & sparkle for the galaxy portfolio (replaces the old motion.js)
// Every effect is throttled to one update per frame, pauses when off-screen / idle, and
// switches itself off if galaxy.js reports a slow computer (class "lite" on <html>).
(function () {
  'use strict';
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;
  var isLite = function () { return root.classList.contains('lite'); };

  // ---------- EDIT THESE ----------
  var FLIP_TARGET = '.hero__hex-wrap .hex';                      // the portrait face that becomes the cube
  var TILT_CARDS = '.service-card, .lang-card';                   // cards that lean toward the mouse
  var SPOT_CARDS = '.service-card, .lang-card';                   // cards with a cursor spotlight
  var MAGNETIC = '.btn-pill, .social-row a';                      // things that lean toward the mouse
  var TITLES = '.panel-title, .panel--about h2';                  // headings whose words rise in
  var HEX_FACES = [
    {
      className: 'cube-face--about',
      icon: 'bx-user',
      eyebrow: 'EDUCATION',
      title: 'CS Student',
      text: 'Full-stack developer building toward a career in AI.'
    },
    {
      className: 'cube-face--stack',
      icon: 'bx-code-alt',
      eyebrow: 'TECH STACK',
      title: 'MERN + Laravel',
      text: 'React, Node.js, Express, MongoDB and Laravel.'
    },
    {
      className: 'cube-face--experience',
      icon: 'bx-briefcase',
      eyebrow: 'EXPERIENCE',
      title: 'HindukushSoft',
      text: 'Internship experience building CRUD apps and REST APIs.'
    },
    {
      className: 'cube-face--ai',
      icon: 'bx-bulb',
      eyebrow: 'AI PROJECTS',
      title: 'AI for learning',
      text: 'Gemini-powered study tools, quizzes and feedback.'
    },
    {
      className: 'cube-face--home',
      icon: 'bx-map',
      eyebrow: 'PROUDLY BASED IN',
      title: 'Chitral, Pakistan',
      text: 'Turning ideas into useful products, end to end.'
    }
  ];
  var TYPE_ROLES = ['Full-Stack Developer', 'MERN Developer', 'Laravel Developer', 'Future AI Engineer']; // [] = no typing
  var COLORS = ['#ffffff'];

  // ---------- 1. Rotating six-face cube ----------
  var hex = document.querySelector(FLIP_TARGET);
  if (hex) {
    var cube = document.createElement('div');
    cube.className = 'profile-cube';
    var carousel = document.createElement('div');
    carousel.className = 'cube-carousel';

    hex.replaceWith(cube);
    cube.setAttribute('role', 'group');
    cube.setAttribute('aria-roledescription', 'rotating cube');
    cube.setAttribute('aria-label', 'Talha Habib: full-stack developer, computer science student, MERN and Laravel, AI projects, HindukushSoft internship, Chitral Pakistan.');
    cube.appendChild(carousel);

    var welcome = document.createElement('div');
    welcome.className = 'cube-label';
    hex.classList.remove('hex--drift');
    hex.classList.add('carousel-face', 'cube-face--portrait');
    hex.classList.remove('hex');
    hex.style.setProperty('--face-index', 0);
    hex.setAttribute('aria-label', 'Talha Habib, Full-Stack Developer.');
    var photoContent = hex.querySelector('.hex__inner');
    if (photoContent) {
      photoContent.style.clipPath = 'none';
      photoContent.style.webkitClipPath = 'none';
      photoContent.appendChild(welcome);
    }
    welcome.innerHTML = '<h2>Talha Habib</h2><p>Full-Stack Developer</p>';
    carousel.appendChild(hex);

    HEX_FACES.forEach(function (faceData) {
      var face = document.createElement('div');
      face.className = 'carousel-face ' + faceData.className;
      face.setAttribute('aria-label', faceData.eyebrow + ': ' + faceData.title + '. ' + faceData.text);

      var content = document.createElement('div');
      content.className = 'cube-face__content';
      var icon = document.createElement('i');
      icon.className = 'bx ' + faceData.icon;
      icon.setAttribute('aria-hidden', 'true');
      var eyebrow = document.createElement('p');
      eyebrow.className = 'cube-face__eyebrow';
      eyebrow.textContent = faceData.eyebrow;
      var title = document.createElement('h2');
      title.textContent = faceData.title;
      var text = document.createElement('p');
      text.className = 'cube-face__text';
      text.textContent = faceData.text;

      content.append(icon, eyebrow, title, text);
      face.appendChild(content);
      carousel.appendChild(face);
    });

    // little tilted orbit ring with a moon, behind the photo
    var wrap = cube.parentElement;
    if (wrap && !calm) {
      var orbit = document.createElement('div');
      orbit.className = 'orbit';
      orbit.setAttribute('aria-hidden', 'true');
      orbit.innerHTML = '<i></i>';
      wrap.insertBefore(orbit, cube);
    }
  }

  // ---------- 2. Cycle through developer roles ----------
  var roleEl = document.querySelector('.hero__role span');
  if (roleEl && !calm && TYPE_ROLES.length > 1) {
    var original = roleEl.textContent.trim();
    var roles = TYPE_ROLES.slice();
    if (roles.indexOf(original) < 0) roles.unshift(original);
    roleEl.parentElement.setAttribute('aria-label', original);
    roleEl.textContent = original;
    var caret = document.createElement('span');
    caret.className = 'caret'; caret.setAttribute('aria-hidden', 'true');
    roleEl.after(caret);
    var ri = 0, ci = original.length, deleting = false;
    var typer = function () {
      var word = roles[ri], wait = deleting ? 38 : 85;
      if (document.hidden) { setTimeout(typer, 600); return; }
      if (!deleting && ci === word.length) { deleting = true; wait = 1900; }
      else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; wait = 350; }
      else { ci += deleting ? -1 : 1; roleEl.textContent = word.slice(0, ci); }
      setTimeout(typer, wait);
    };
    setTimeout(typer, 2600);
  }

  // ---------- 3. Titles: split into words so they rise in one by one ----------
  if (!calm) {
    document.querySelectorAll(TITLES).forEach(function (h) {
      var n = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var parts = c.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
            parts.forEach(function (p) {
              if (!p) return;
              if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
              var w = document.createElement('span');
              w.className = 'w'; w.style.setProperty('--i', n++); w.textContent = p;
              frag.appendChild(w);
            });
            c.replaceWith(frag);
          } else if (c.nodeType === 1) walk(c);
        });
      })(h);
      h.classList.add('split');
    });
  }

  // ---------- 4. Tilt: smooth lean toward the mouse, one update per frame ----------
  if (!calm && canHover) {
    document.querySelectorAll(TILT_CARDS).forEach(function (el) {
      if (el.offsetWidth > 480) return;
      el.classList.add('tilt');
      var raf = 0, px = 0, py = 0;
      el.addEventListener('pointerenter', function () { el.style.transition = 'transform .15s ease-out'; });
      el.addEventListener('pointermove', function (e) {
        px = e.clientX; py = e.clientY;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = el.getBoundingClientRect();
          var x = (px - r.left) / r.width - 0.5, y = (py - r.top) / r.height - 0.5;
          el.style.transform = 'perspective(700px) rotateX(' + (-y * 12).toFixed(2) + 'deg) rotateY(' +
            (x * 12).toFixed(2) + 'deg) translateY(-4px)';
        });
      });
      el.addEventListener('pointerleave', function () {
        cancelAnimationFrame(raf); raf = 0;
        el.style.transition = 'transform .5s cubic-bezier(.2,.8,.3,1)';
        el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; }, 520);
      });
    });
  }

  // ---------- 5. Spotlight: light + glowing border follow the cursor inside cards ----------
  if (!calm && canHover) {
    var spotRaf = 0, spotEv = null;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest(SPOT_CARDS);
      if (!card) return;
      spotEv = { card: card, x: e.clientX, y: e.clientY };
      if (spotRaf) return;
      spotRaf = requestAnimationFrame(function () {
        spotRaf = 0;
        var r = spotEv.card.getBoundingClientRect();
        spotEv.card.style.setProperty('--sx', (spotEv.x - r.left).toFixed(0) + 'px');
        spotEv.card.style.setProperty('--sy', (spotEv.y - r.top).toFixed(0) + 'px');
      });
    }, { passive: true });
  }

  // ---------- 6. Magnetic buttons: they lean toward the pointer ----------
  if (!calm && canHover) {
    document.querySelectorAll(MAGNETIC).forEach(function (el) {
      el.classList.add('magnetic');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.translate = (x * 10).toFixed(1) + 'px ' + (y * 8).toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = ''; });
    });
  }

  // ---------- 7. Floating icons (paused while off-screen so they cost nothing) ----------
  var icons = [];
  document.querySelectorAll('i[class*="devicon"], i[class*="bx"]').forEach(function (icon, n) {
    if (icon.closest('a, button, nav')) return;
    icon.classList.add('float-icon');
    icon.style.animationDelay = (n % 6) * 0.4 + 's';
    icons.push(icon);
  });
  if (!calm && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.style.animationPlayState = e.isIntersecting ? 'running' : 'paused'; });
    }, { rootMargin: '80px' });
    icons.forEach(function (i) { io.observe(i); });
  }

  // ---------- 8. Scroll progress bar (one update per frame) ----------
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
      ticking = false;
    });
  }, { passive: true });

  // ---------- 9. Cursor light + sparkle trail + click bursts ----------
  if (canHover) {
    var glow = document.createElement('div');
    glow.className = 'cursor-glow'; glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    var cv = document.createElement('canvas');
    cv.className = 'fx-canvas'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var g = cv.getContext('2d');
    var CW = 0, CH = 0;
    var sizeCanvas = function () { CW = cv.width = innerWidth; CH = cv.height = innerHeight; };
    sizeCanvas(); addEventListener('resize', sizeCanvas);

    var parts = [], rings = [], running = false, lastT = 0;
    var MAX = 160;

    var draw = function (t) {
      var dt = Math.min(0.05, (t - lastT) / 1000 || 0.016); lastT = t;
      g.clearRect(0, 0, CW, CH);
      g.globalCompositeOperation = 'lighter';
      var i, p;
      for (i = parts.length - 1; i >= 0; i--) {
        p = parts[i]; p.life -= dt;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        p.vy += p.g * dt; p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
        var k = p.life / p.max;
        g.fillStyle = p.c;
        g.globalAlpha = k * 0.28;
        g.shadowColor = p.c;
        g.shadowBlur = p.r * 5;
        g.beginPath();
        for (var point = 0; point < 8; point++) {
          var angle = point * Math.PI / 4 - Math.PI / 2;
          var radius = (point % 2 ? 0.38 : 1) * p.r * 3 * k + 1;
          var sx = p.x + Math.cos(angle) * radius;
          var sy = p.y + Math.sin(angle) * radius;
          if (point === 0) g.moveTo(sx, sy); else g.lineTo(sx, sy);
        }
        g.closePath();
        g.fill();
        g.globalAlpha = k;
        g.beginPath();
        for (var corePoint = 0; corePoint < 8; corePoint++) {
          var coreAngle = corePoint * Math.PI / 4 - Math.PI / 2;
          var coreRadius = (corePoint % 2 ? 0.38 : 1) * (p.r * k + .4);
          var coreX = p.x + Math.cos(coreAngle) * coreRadius;
          var coreY = p.y + Math.sin(coreAngle) * coreRadius;
          if (corePoint === 0) g.moveTo(coreX, coreY); else g.lineTo(coreX, coreY);
        }
        g.closePath();
        g.fill();
        g.shadowBlur = 0;
      }
      for (i = rings.length - 1; i >= 0; i--) {
        var r = rings[i]; r.life -= dt;
        if (r.life <= 0) { rings.splice(i, 1); continue; }
        var q = 1 - r.life / r.max;
        g.globalAlpha = (1 - q) * 0.7; g.strokeStyle = r.c; g.lineWidth = 2.2 * (1 - q) + .5;
        g.beginPath(); g.arc(r.x, r.y, 8 + q * 70, 0, 6.283); g.stroke();
      }
      g.globalAlpha = 1;
      if (parts.length || rings.length) requestAnimationFrame(draw);
      else { running = false; g.clearRect(0, 0, CW, CH); }
    };
    var kick = function () { if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(draw); } };
    var pick = function () { return COLORS[(Math.random() * COLORS.length) | 0]; };

    var lastSpark = 0;
    addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var now = performance.now();
      var lite = isLite();
      if (now - lastSpark > (lite ? 90 : 45) && parts.length < (lite ? 35 : MAX)) {
        lastSpark = now;
        parts.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * 40, vy: (Math.random() - .2) * 30, g: 60,
          r: 1.4 + Math.random() * 2, life: .7, max: .7, c: pick() });
        kick();
      }
    }, { passive: true });

    addEventListener('pointerdown', function (e) {          // click = small supernova
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var n = isLite() ? 10 : 26;
      rings.push({ x: e.clientX, y: e.clientY, life: .6, max: .6, c: '#2fe6dd' });
      for (var i = 0; i < n && parts.length < MAX + 40; i++) {
        var a = Math.random() * 6.283, s = 80 + Math.random() * 200;
        parts.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 90,
          r: 1.6 + Math.random() * 2.4, life: .9 + Math.random() * .5, max: 1.3, c: pick() });
      }
      kick();
      if (window.__galaxyKick) window.__galaxyKick();       // the galaxy behind spins up for a moment
    }, { passive: true });

    // soft light that follows the pointer with a little lag
    var gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, glowRun = false;
    var glowTick = function () {
      gx += (tx - gx) * 0.14; gy += (ty - gy) * 0.14;
      glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
      if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) requestAnimationFrame(glowTick); else glowRun = false;
    };
    addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY; glow.classList.add('on');
      if (!glowRun) { glowRun = true; requestAnimationFrame(glowTick); }
    }, { passive: true });
    root.addEventListener('mouseleave', function () { glow.classList.remove('on'); });
  }

  // ---------- 10. Depth drift: panels float at different depths instead of sliding as flat cards ----------
  if (!calm) {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
    var queued = false;
    var update = function () {
      queued = false;
      var c = innerHeight / 2, rs = panels.map(function (p) { return p.getBoundingClientRect(); });   // read all first
      panels.forEach(function (p, i) {                                                                // then write
        var r = rs[i];
        if (r.bottom < -300 || r.top > innerHeight + 300) return;
        var d = Math.max(-1.5, Math.min(1.5, ((r.top + r.height / 2) - c) / innerHeight));
        p.style.scale = (1 - Math.min(1, Math.abs(d)) * 0.04).toFixed(4);
        p.style.translate = '0 ' + (-d * 26 * (1 + (i % 3) * 0.4)).toFixed(1) + 'px';
      });
    };
    var queue = function () { if (!queued) { queued = true; requestAnimationFrame(update); } };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    queue();
  }
})();