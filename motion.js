// motion.js — extra movement for the portfolio (replaces the old motion.js)
(function () {
  'use strict';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- EDIT THESE ----------
  const FLIP_TARGET = '.hero__hex-wrap .hex';      // the hexagon that should flip
  const TILT_CARDS  = '.service-card, .lang-card'; // small cards that lean toward the mouse
  const BACK_NAME  = 'Talha Habib';
  const BACK_ROLE  = 'MERN & Laravel Developer';
  const BACK_PLACE = 'Chitral, Pakistan';

  // ---------- 1. Flip: the WHOLE hexagon flips (clip-path stays on the faces, never on the rotating part) ----------
  const hex = document.querySelector(FLIP_TARGET);
  if (hex) {
    const flip = document.createElement('div');
    flip.className = 'flip';
    if (hex.classList.contains('hex--drift')) {       // float the wrapper, not the clipped hex
      hex.classList.remove('hex--drift');
      flip.classList.add('hex--drift');
    }
    const inner = document.createElement('div');
    inner.className = 'flip-inner';
    const back = document.createElement('div');
    back.className = 'flip-back hex';
    back.innerHTML =
      '<div class="hex__inner"><span class="flip-orb"></span><h3>' + BACK_NAME + '</h3><p>' +
      BACK_ROLE + '</p><p>' + BACK_PLACE + '</p></div>';

    hex.replaceWith(flip);
    flip.appendChild(inner);
    hex.classList.add('flip-front');
    inner.append(hex, back);

    flip.tabIndex = 0;
    flip.setAttribute('role', 'button');
    flip.setAttribute('aria-label', 'Flip photo card');
    const set = on => { flip.classList.toggle('is-flipped', on); flip.setAttribute('aria-pressed', on); };
    if (canHover) {                                    // desktop: hover flips
      flip.addEventListener('pointerenter', () => set(true));
      flip.addEventListener('pointerleave', () => set(false));
    } else {                                           // phones/tablets: tap flips
      flip.addEventListener('click', () => set(!flip.classList.contains('is-flipped')));
    }
    flip.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(!flip.classList.contains('is-flipped')); }
    });
  }

  // ---------- 2. Tilt: smooth, one update per frame, no fighting with the reveal transition ----------
  if (!calm && canHover) {
    document.querySelectorAll(TILT_CARDS).forEach(el => {
      if (el.offsetWidth > 480) return;
      el.classList.add('tilt');
      let raf = 0, px = 0, py = 0;
      el.addEventListener('pointerenter', () => { el.style.transition = 'transform .15s ease-out'; });
      el.addEventListener('pointermove', e => {
        px = e.clientX; py = e.clientY;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = el.getBoundingClientRect();
          const x = (px - r.left) / r.width - 0.5, y = (py - r.top) / r.height - 0.5;
          el.style.transform = 'perspective(700px) rotateX(' + (-y * 10).toFixed(2) + 'deg) rotateY(' +
            (x * 10).toFixed(2) + 'deg) translateY(-4px)';
        });
      });
      el.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf); raf = 0;
        el.style.transition = 'transform .5s cubic-bezier(.2,.8,.3,1)';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 520);
      });
    });
  }

  // ---------- 3. Floating icons (paused while off-screen so they cost nothing) ----------
  const icons = [];
  document.querySelectorAll('i[class*="devicon"], i[class*="bx"]').forEach((icon, n) => {
    if (icon.closest('a, button, nav')) return;
    icon.classList.add('float-icon');
    icon.style.animationDelay = (n % 6) * 0.4 + 's';
    icons.push(icon);
  });
  if (!calm && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      e.target.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
    }), { rootMargin: '80px' });
    icons.forEach(i => io.observe(i));
  }

  // ---------- 4. Scroll progress bar (one update per frame) ----------
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
      ticking = false;
    });
  }, { passive: true });

  // ---------- 5. Mouse sparkles (shooting stars now live inside galaxy.js) ----------
  if (!calm && canHover) {
    let last = 0, live = 0;
    addEventListener('pointermove', e => {
      const now = performance.now();
      if (now - last < 60 || live > 14) return;
      last = now; live++;
      const sp = document.createElement('div');
      sp.className = 'spark';
      sp.style.left = e.clientX + 'px';
      sp.style.top = e.clientY + 'px';
      sp.style.setProperty('--dx', (Math.random() - 0.5) * 40 + 'px');
      sp.style.setProperty('--dy', Math.random() * 40 + 10 + 'px');
      document.body.appendChild(sp);
      sp.addEventListener('animationend', () => { sp.remove(); live--; });
    });
  }

  // ---------- 6. Depth drift: panels float at different depths instead of sliding as flat cards ----------
  if (!calm) {
    const panels = Array.from(document.querySelectorAll('.panel'));
    let queued = false;
    const update = () => {
      queued = false;
      const c = innerHeight / 2, rs = panels.map(p => p.getBoundingClientRect());   // read all first
      panels.forEach((p, i) => {                                                      // then write
        const r = rs[i];
        if (r.bottom < -300 || r.top > innerHeight + 300) return;
        const d = Math.max(-1.5, Math.min(1.5, ((r.top + r.height / 2) - c) / innerHeight));
        p.style.scale = (1 - Math.min(1, Math.abs(d)) * 0.04).toFixed(4);
        p.style.translate = '0 ' + (-d * 26 * (1 + (i % 3) * 0.4)).toFixed(1) + 'px';
      });
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    queue();
  }
})();