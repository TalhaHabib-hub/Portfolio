const CONFIG = {
  github: {
    username: 'TalhaHabib-hub',
  },
  // Deploying to the root domain on Vercel: use '/'
  base: '/',
  projects: {
    github: {
      display: true,
      header: 'Selected GitHub Projects',
      mode: 'automatic',
      automatic: {
        sortBy: 'updated',
        limit: 8,
        exclude: {
          forks: true,
          projects: [
            'TalhaHabib-hub/Portfolio',
            'TalhaHabib-hub/TalhaHabib-hub',
          ],
        },
      },
      manual: {
        projects: [],
      },
    },
    external: {
      header: 'More Work',
      projects: [],
    },
  },
  seo: {
    title: 'Talha Habib | Full-Stack Developer',
    description:
      'Talha Habib is a computer science student and full-stack developer from Chitral, Pakistan, building useful web products with Laravel, React, and AI.',
    imageURL: 'https://avatars.githubusercontent.com/u/286624260?v=4',
  },
  social: {
    linkedin: 'talha-habib-411405410',
    facebook: 'talha.habib.844453',
    instagram: 'aienthusiasmml',
    phone: '+923480157976',
    email: 'talhahabib842653@gmail.com',
  },
  resume: {
    fileUrl:
      'https://github.com/TalhaHabib-hub/Portfolio/blob/main/Talha-Habib-CV.pdf',
  },
  skills: [
    'JavaScript',
    'PHP',
    'Python',
    'C++',
    'React',
    'Laravel',
    'Node.js',
    'Express.js',
    'Tailwind CSS',
    'MySQL',
    'MongoDB',
    'REST APIs',
    'Google Gemini API',
    'Git',
    'GitHub',
  ],
  experiences: [
    {
      company: 'HindukushSoft Technologies',
      position: 'Full-Stack Web Developer Intern',
      from: 'July 2026',
      to: 'September 2026',
      companyLink:
        'https://github.com/TalhaHabib-hub/WebDevelopment-at-HindukushSoft',
    },
  ],
  educations: [
    {
      degree: 'Computer Science · 3rd semester',
      from: 'In progress',
      to: 'Present',
    },
  ],
  certifications: [],
  publications: [],
  blog: {
    source: '',
    username: '',
    limit: 2,
  },
  googleAnalytics: {
    id: '',
  },
  hotjar: {
    id: '',
    snippetVersion: 6,
  },
  themeConfig: {
    defaultTheme: 'forest',
    disableSwitch: false,
    respectPrefersColorScheme: false,
    displayAvatarRing: true,
    themes: ['forest', 'light', 'dark', 'business', 'lofi'],
  },
  footer: 'Talha Habib · Full-Stack Developer · Chitral, Pakistan',
  enablePWA: true,
};

export default CONFIG;
