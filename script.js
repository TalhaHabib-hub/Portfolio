
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
      var rawText = message.toLowerCase();
      var text = message.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

      if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(text)) {
        return "Hi there! I can tell you about Talha's background, skills, projects, or how to contact him.";
      }

      if (/\b(student ai|assistant platform)\b/.test(text)) {
        return 'The Student AI Assistant Platform is a Laravel + React study tool. It can generate quizzes from notes, extract paper tests, and provide graded feedback using Gemini. Repository: github.com/TalhaHabib-hub/student_ai_platform';
      }
      if (/\b(online education|education website|lms)\b/.test(text)) {
        return 'The Online Education Website is a role-based Laravel + React learning management system with courses, quizzes, payments, reviews, and an admin dashboard. Repository: github.com/TalhaHabib-hub/OnlineEducationWebsite';
      }
      if (/\b(hindukush|intern\w*|capstone|cca)\b/.test(text)) {
        return 'Talha previously interned at HindukushSoft Technologies. His portfolio describes daily tasks and a capstone project, CCA, a full-stack Laravel + React learning platform. Repository: github.com/TalhaHabib-hub/WebDevelopment-at-HindukushSoft';
      }
      if (/\b(learning fullstack mern|mern practice|redux)\b/.test(text)) {
        return 'The Learning FullStack MERN repository contains front-end and MERN practice projects, including HTML/CSS/JavaScript builds, React, and Redux exercises. Repository: github.com/TalhaHabib-hub/Learning-FullStack-MERN';
      }
      if (/\b(python learning|object oriented|file i o|oop)\b/.test(text)) {
        return 'The Python Learning repository is a topic-by-topic walkthrough covering Python syntax, data structures, file I/O, and object-oriented programming. Repository: github.com/TalhaHabib-hub/Python-Learning';
      }
      if (/\b(c\+\+ learning|cplusplus learning|college coursework)\b/.test(rawText) ||
          (/c\+\+|cplusplus|c plus plus/.test(rawText) && /\b(project|repository|coursework|exercises)\b/.test(text))) {
        return 'His C++ Learning repository contains college coursework and exercises. Repository: github.com/TalhaHabib-hub/C-plus-plus';
      }
      if (/\b(python|python learning)\b/.test(text) && /\b(project|repository|coursework|exercises)\b/.test(text)) {
        return 'The Python Learning repository is a topic-by-topic walkthrough covering Python syntax, data structures, file I/O, and object-oriented programming. Repository: github.com/TalhaHabib-hub/Python-Learning';
      }

      var technologies = [
        {
          pattern: /c\+\+|cplusplus|c plus plus/,
          name: 'C++',
          evidence: 'His portfolio lists C++ among his languages and links a C++ Learning repository containing college coursework and exercises.'
        },
        {
          pattern: /\bpython\b/,
          name: 'Python',
          evidence: 'His portfolio lists Python among his languages and links a Python Learning repository covering syntax, data structures, file I/O, and object-oriented programming.'
        },
        {
          pattern: /\b(javascript|js)\b/,
          name: 'JavaScript',
          evidence: 'JavaScript is listed among his languages, and his projects include front-end practice, React, Redux, Node.js, and Express.'
        },
        {
          pattern: /\b(typescript|ts)\b/,
          name: 'TypeScript',
          evidence: 'TypeScript appears in the live language breakdown of his public GitHub repositories.'
        },
        {
          pattern: /\b(php|laravel)\b/,
          name: 'PHP and Laravel',
          evidence: 'His portfolio highlights Laravel and PHP, with Laravel + React projects including a learning platform and internship capstone.'
        },
        {
          pattern: /\b(react|mern|node|express|mongodb|redux)\b/,
          name: 'the MERN stack',
          evidence: 'His portfolio highlights MERN development and React, Node.js, Express, and MongoDB, including practice projects and full-stack applications.'
        },
        {
          pattern: /\b(html|html5|css|css3|tailwind)\b/,
          name: 'frontend development',
          evidence: 'His portfolio lists HTML, CSS, and Tailwind CSS and describes building responsive React/MERN interfaces.'
        },
        {
          pattern: /\b(mysql|sql|database)\b/,
          name: 'databases',
          evidence: 'MySQL is listed among his tools, and his backend work includes databases and REST APIs.'
        },
        {
          pattern: /\b(gemini|artificial intelligence|ai)\b/,
          name: 'AI integration',
          evidence: 'He is building toward a career in AI and has used Gemini for study tools such as quiz generation, paper-test extraction, and graded feedback.'
        }
      ];
      var technology = technologies.find(function (item) { return item.pattern.test(rawText); });
      if (technology) {
        return technology.evidence + ' The portfolio shows related coursework or projects, but doesn’t claim a formal proficiency level.';
      }

      if (/\b(all about|all (the )?(information|details)|everything about|tell me about|about me|who is|about talha|about yourself|background|bio|biography)\b/.test(text)) {
        return 'Talha Habib is a Computer Science student and full-stack developer based in Chitral, Pakistan. He works across MERN and Laravel, previously interned at HindukushSoft Technologies building CRUD apps and REST APIs, and is working toward a career in AI. His portfolio features an AI study assistant, a learning management system, internship work, and repositories for learning MERN, Python, and C++. He describes himself as consistent, a fast learner, detail-oriented, self-taught, growth-minded, and a hands-on builder.';
      }
      if (/\b(name|who are you|what do you know|everything|tell me everything)\b/.test(text)) {
        return 'His name is Talha Habib. He is a Computer Science student and full-stack developer based in Chitral, Pakistan. He works with MERN and Laravel, has internship experience at HindukushSoft Technologies, and is building toward a career in AI.';
      }
      if (/\b(skills?|technolog(y|ies)|tech stack|programming languages?|frameworks?|tools)\b/.test(text)) {
        return 'Talha’s portfolio lists HTML, CSS, JavaScript, PHP, Python, and C++; React, Node.js, Express, Laravel, and Tailwind CSS; and VS Code, Git, GitHub, MySQL, XAMPP, and the Gemini API. MongoDB is also named as part of his MERN stack.';
      }
      if (/\b(projects?|work|portfolio|built|repositories|repos)\b/.test(text)) {
        return 'Featured projects: Student AI Assistant Platform (Laravel + React study tools using Gemini); Online Education Website (a role-based LMS with courses, quizzes, payments, reviews, and admin dashboard); HindukushSoft internship work (including the CCA capstone); Learning FullStack MERN (HTML/CSS/JS, React, Redux practice); Python Learning; and C++ Learning coursework. Visit github.com/TalhaHabib-hub for repositories.';
      }
      if (/\b(frontend|front end|website interface|ui)\b/.test(text)) {
        return 'Talha’s portfolio describes his frontend work as building fast, responsive React and MERN interfaces. His tools include HTML, CSS, JavaScript, React, and Tailwind CSS.';
      }
      if (/\b(backend|back end|api|server|database)\b/.test(text)) {
        return 'Talha’s portfolio highlights Laravel and Node.js backend work, including authentication, databases, CRUD applications, and clean REST APIs.';
      }
      if (/\b(service|offer|provide|hire|freelance)\b/.test(text)) {
        return 'The services listed on Talha’s portfolio are frontend development (responsive React/MERN interfaces), backend development (Laravel and Node APIs, auth, databases, REST endpoints), and AI integration (Gemini-powered quizzes, chat, and content tools).';
      }
      if (/\b(trait|strength|quality|personality|fast learner|detail oriented|self taught|consistent|growth minded)\b/.test(text)) {
        return 'Talha’s portfolio describes him as consistent, a fast learner, detail-oriented, self-taught, growth-minded, and a hands-on builder.';
      }
      if (/\b(good at|proficien|expert|experience with|know|use|learn)\b/.test(text)) {
        return 'I can share what Talha’s portfolio documents, but it doesn’t give formal skill ratings. It lists his technologies and links to coursework, practice projects, and applications. Ask about a specific technology or project for details.';
      }
      if (/\b(contact|email|reach|message|whatsapp|linkedin|facebook)\b/.test(text)) {
        return 'You can use the Contact form on this page, message Talha on WhatsApp at wa.me/923480157976, connect on LinkedIn at linkedin.com/in/talha-habib-411405410/, or find him on GitHub as TalhaHabib-hub and Facebook as talha.habib.844453.';
      }
      if (/\b(cv|resume|curriculum vitae)\b/.test(text)) {
        return 'You can download Talha’s CV using the “Download CV” button near the top of the page or in the footer.';
      }
      if (/\b(location|where|based|chitral|pakistan)\b/.test(text)) {
        return 'Talha is based in Chitral, Pakistan.';
      }
      if (/\b(student|education|study|college|university|degree)\b/.test(text)) {
        return 'The portfolio identifies Talha as a Computer Science student. It doesn’t specify his institution or degree details.';
      }
      if (/\b(career|future|goal|aspiration)\b/.test(text)) {
        return 'Talha’s portfolio says he is building toward a career in AI, while working as a full-stack developer across MERN and Laravel.';
      }
      if (/\b(github|followers|stars|repositories|activity|stats)\b/.test(text)) {
        var repoCount = document.getElementById('ghRepos');
        var starCount = document.getElementById('ghStars');
        var followerCount = document.getElementById('ghFollow');
        var repos = repoCount ? repoCount.textContent.trim() : '';
        var stars = starCount ? starCount.textContent.trim() : '';
        var followers = followerCount ? followerCount.textContent.trim() : '';
        if (repos && repos !== '—' && stars && stars !== '—' && followers && followers !== '—') {
          return 'Talha’s live GitHub stats currently show ' + repos + ' repositories, ' + stars + ' stars, and ' + followers + ' followers. See the GitHub Activity section or visit github.com/TalhaHabib-hub.';
        }
        return 'Talha’s portfolio loads repository, stars, language, and follower information live from github.com/TalhaHabib-hub. Visit the GitHub Activity section to see the latest stats.';
      }
      if (/\b(help|what can you|what do you|can you)\b/.test(text)) {
        return 'Ask me about Talha’s background, education, internship, skills, services, a specific technology or project, GitHub activity, location, CV, or contact links.';
      }

      return 'I can answer questions about the information published on Talha’s portfolio: his background, education, internship, skills, projects, services, GitHub activity, location, CV, and contact links. Try asking about one of those, or name a technology or project.';
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
