
(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ambient starfield ---------- */
  var bgFx = document.getElementById('bg-fx');
  if (bgFx && !prefersReducedMotion) {
    var STAR_COUNT = window.innerWidth < 640 ? 55 : 110;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < STAR_COUNT; i++) {
      var star = document.createElement('span');
      star.className = 'fx-star';
      var size = (Math.random() * 2 + 1).toFixed(2);
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.top = (Math.random() * 100).toFixed(2) + '%';
      star.style.left = (Math.random() * 100).toFixed(2) + '%';
      star.style.setProperty('--min-o', (Math.random() * 0.25 + 0.1).toFixed(2));
      star.style.setProperty('--max-o', (Math.random() * 0.5 + 0.6).toFixed(2));
      star.style.animationDuration = (Math.random() * 3 + 2).toFixed(2) + 's';
      star.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
      frag.appendChild(star);
    }
    bgFx.appendChild(frag);

    function spawnShootingStar() {
      var s = document.createElement('span');
      s.className = 'fx-shooting-star';
      var angle = -15 - Math.random() * 20;
      var duration = (1.1 + Math.random() * 0.8).toFixed(2);

      s.style.top = (Math.random() * 50).toFixed(2) + '%';
      s.style.left = (Math.random() * 60).toFixed(2) + '%';
      s.style.setProperty('--angle', angle + 'deg');
      s.style.setProperty('--dx', (260 + Math.random() * 220).toFixed(0) + 'px');
      s.style.setProperty('--dy', (120 + Math.random() * 140).toFixed(0) + 'px');
      s.style.animationDuration = duration + 's';

      bgFx.appendChild(s);
      window.setTimeout(function () { s.remove(); }, duration * 1000 + 200);
    }

    (function scheduleShootingStar() {
      var delay = 3500 + Math.random() * 5000;
      window.setTimeout(function () {
        spawnShootingStar();
        scheduleShootingStar();
      }, delay);
    })();
  }

  /* ---------- Hero intro (staggered fade-in) ---------- */
  document.querySelectorAll('[data-intro-item]').forEach(function (el, i) {
    window.setTimeout(function () { el.classList.add('is-visible'); }, 120 * i + 80);
  });

  /* ---------- Scroll reveal ---------- */
  var revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealItems.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.innerHTML = isOpen ? "<i class='bx bx-x'></i>" : "<i class='bx bx-menu'></i>";
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.innerHTML = "<i class='bx bx-menu'></i>";
      });
    });
  }

  /* ---------- Project card cursor spotlight ---------- */
  if (!prefersReducedMotion) {
    document.querySelectorAll('.project-tile').forEach(function (tile) {
      tile.addEventListener('pointermove', function (e) {
        var rect = tile.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        tile.style.setProperty('--mx', x + '%');
        tile.style.setProperty('--my', y + '%');
      });
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var navAnchors = document.querySelectorAll('.nav__links a');
  var sections = [];
  navAnchors.forEach(function (a) {
    var id = a.getAttribute('href').replace('#', '');
    var section = document.getElementById(id);
    if (section) sections.push({ link: a, section: section });
  });

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.find(function (s) { return s.section === entry.target; });
        if (!match || !entry.isIntersecting) return;
        navAnchors.forEach(function (a) { a.classList.remove('is-active'); });
        match.link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { navObserver.observe(s.section); });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('cf-status');
  var submitBtn = document.getElementById('cf-submit');

  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var action = form.getAttribute('action') || '';

      if (!action || action.indexOf('YOUR_FORM_ID') !== -1) {
        status.textContent = 'Add your Formspree form ID in the form action to enable sending.';
        status.className = 'cf-status cf-status--err';
        return;
      }

      status.textContent = 'Sending...';
      status.className = 'cf-status';
      if (submitBtn) submitBtn.disabled = true;

      fetch(action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (response) {
          if (response.ok) {
            status.textContent = 'Thanks — your message is on its way.';
            status.className = 'cf-status cf-status--ok';
            form.reset();
          } else {
            status.textContent = 'Something went wrong — please try again.';
            status.className = 'cf-status cf-status--err';
          }
        })
        .catch(function () {
          status.textContent = 'Network error — please try again.';
          status.className = 'cf-status cf-status--err';
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  /* ---------- Portfolio chat helper ---------- */
  var chatPanel = document.getElementById('portfolioChatPanel');
  var chatToggle = document.getElementById('portfolioChatToggle');
  var chatClose = document.getElementById('portfolioChatClose');
  var chatForm = document.getElementById('portfolioChatForm');
  var chatInput = document.getElementById('portfolioChatInput');
  var chatMessages = document.getElementById('portfolioChatMessages');

  if (chatPanel && chatToggle && chatClose && chatForm && chatInput && chatMessages) {
    function setChatOpen(isOpen) {
      chatPanel.hidden = !isOpen;
      chatToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      chatToggle.setAttribute('aria-label', isOpen ? 'Close portfolio assistant' : 'Open portfolio assistant');
      chatToggle.innerHTML = isOpen
        ? "<i class='bx bx-x' aria-hidden='true'></i><span>Close</span>"
        : "<i class='bx bx-message-rounded-dots' aria-hidden='true'></i><span>Ask me</span>";
      if (isOpen) chatInput.focus();
    }

    function addChatMessage(message, isUser) {
      var bubble = document.createElement('div');
      bubble.className = 'portfolio-chat__message portfolio-chat__message--' + (isUser ? 'user' : 'assistant');
      bubble.textContent = message;
      chatMessages.appendChild(bubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getPortfolioReply(message) {
      var text = message.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

      if (/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(text)) {
        return "Hi there! I can tell you about Talha's background, skills, projects, or how to contact him.";
      }
      if (/\b(skill|technology|technologies|stack|language|framework|tools|react|laravel|mern|node|javascript|php|python|database)\b/.test(text)) {
        return 'Talha works with React, Node.js, Express, Laravel, PHP, JavaScript, Python, C++, Tailwind CSS, and MySQL. He also builds AI-powered features with Gemini.';
      }
      if (/\b(project|work|portfolio|built|student ai|assistant platform|education website|lms|internship)\b/.test(text)) {
        return 'Some featured work: Student AI Assistant Platform (AI study tools with Laravel + React), an Online Education Website (a Laravel + React learning platform), and full-stack internship work at HindukushSoft. Explore the Projects section for links.';
      }
      if (/\b(contact|email|hire|reach|message|whatsapp|linkedin)\b/.test(text)) {
        return 'You can reach Talha through the Contact section, connect on LinkedIn, or message him on WhatsApp using the links on this page.';
      }
      if (/\b(cv|resume|curriculum vitae)\b/.test(text)) {
        return 'You can download Talha’s CV using the “Download CV” button near the top of the page or in the footer.';
      }
      if (/\b(location|where|based|chitral|pakistan)\b/.test(text)) {
        return 'Talha is based in Chitral, Pakistan.';
      }
      if (/\b(who|about|yourself|talha|background|study|student|education|experience|intern)\b/.test(text)) {
        return 'Talha Habib is a Computer Science student and full-stack developer based in Chitral, Pakistan. He works with the MERN stack and Laravel, and previously interned at HindukushSoft Technologies.';
      }
      if (/\b(help|what can you|what do you|can you)\b/.test(text)) {
        return 'Ask me about Talha’s background, skills and tech stack, projects, location, CV, or contact details.';
      }

      return 'I’m a portfolio helper, so I can answer questions about Talha’s background, skills, projects, location, CV, and contact details. Try asking about one of those!';
    }

    function submitChatMessage(message) {
      var question = message.trim();
      if (!question) return;
      addChatMessage(question, true);
      addChatMessage(getPortfolioReply(question), false);
      chatInput.value = '';
      chatInput.focus();
    }

    chatToggle.addEventListener('click', function () {
      setChatOpen(chatPanel.hidden);
    });
    chatClose.addEventListener('click', function () {
      setChatOpen(false);
      chatToggle.focus();
    });
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      submitChatMessage(chatInput.value);
    });
    chatPanel.querySelectorAll('[data-chat-prompt]').forEach(function (button) {
      button.addEventListener('click', function () {
        submitChatMessage(button.getAttribute('data-chat-prompt') || '');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !chatPanel.hidden) {
        setChatOpen(false);
        chatToggle.focus();
      }
    });
  }
})();
