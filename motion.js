// motion.js - extra movement for the portfolio (works together with motion.css)

const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- EDIT THESE to match your own HTML ----------
const PROFILE_IMG = 'img[src*="t1"]';   // your hero picture (t1.png)
const TILT_CARDS = '[class*="card"], [class*="box"]';  // use your real class names for best results
const BACK_NAME = 'Talha Habib';
const BACK_ROLE = 'MERN & Laravel Developer';
const BACK_PLACE = 'Chitral, Pakistan';

// ---------- 1. Flip card: wraps your picture, adds a galaxy back side ----------
const img = document.querySelector(PROFILE_IMG);
if (img) {
  const flip = document.createElement('div');
  flip.className = 'flip';
  flip.innerHTML = `
    <div class="flip-inner">
      <div class="flip-front"></div>
      <div class="flip-back">
        <span class="orb"></span>
        <h3>${BACK_NAME}</h3>
        <p>${BACK_ROLE}</p>
        <p>${BACK_PLACE}</p>
      </div>
    </div>`;
  img.replaceWith(flip);                                  // put the flip card where the picture was
  flip.querySelector('.flip-front').appendChild(img);     // move the picture inside the front side
  const back = flip.querySelector('.flip-back');
  back.style.borderRadius = getComputedStyle(img).borderRadius;  // back side gets the same round shape
  flip.addEventListener('click', () => flip.classList.toggle('is-flipped'));  // tap to flip on phones
}

// ---------- 2. Tilt: cards lean towards your mouse ----------
document.querySelectorAll(TILT_CARDS).forEach(el => {
  if (el.offsetWidth > 480 || el.closest('.flip')) return;   // skip big panels, tilt only small cards
  el.classList.add('tilt');
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) translateY(-4px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

// ---------- 3. Floating icons: each one bobs at a different time ----------
document.querySelectorAll('i[class*="devicon"], i[class*="bx"]').forEach((icon, n) => {
  if (icon.closest('a, button, nav')) return;                // leave nav and social icons alone
  icon.classList.add('float-icon');
  icon.style.animationDelay = (n % 6) * 0.4 + 's';
});

// ---------- 4. Scroll progress bar ----------
const bar = document.createElement('div');
bar.className = 'scroll-progress';
document.body.appendChild(bar);
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}, { passive: true });

// ---------- 5. Decorations (skipped if the visitor wants less motion) ----------
if (!calm) {
  // Shooting stars: three streaks, each jumps to a new spot after every pass
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('div');
    s.className = 'shooting-star';
    const place = () => {
      s.style.top = Math.random() * innerHeight * 0.6 + 'px';
      s.style.left = Math.random() * innerWidth * 0.6 + 'px';
    };
    place();
    s.style.animationDelay = i * 2.7 + 's';
    s.style.animationDuration = 7 + i * 2 + 's';
    s.addEventListener('animationiteration', place);
    document.body.appendChild(s);
  }

  // Sparkles: small glowing dots follow the mouse and fade away
  let last = 0;
  addEventListener('mousemove', e => {
    const now = performance.now();
    if (now - last < 45) return;                            // limit how many we make
    last = now;
    const sp = document.createElement('div');
    sp.className = 'spark';
    sp.style.left = e.clientX + 'px';
    sp.style.top = e.clientY + 'px';
    sp.style.setProperty('--dx', (Math.random() - 0.5) * 40 + 'px');
    sp.style.setProperty('--dy', Math.random() * 40 + 10 + 'px');
    document.body.appendChild(sp);
    sp.addEventListener('animationend', () => sp.remove());
  });
}