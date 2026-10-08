# My Portfolio

A personal portfolio website built with HTML, Tailwind CSS, custom CSS, and JavaScript — no UI framework. Live at **[my-college-portfolio-nu.vercel.app](https://my-college-portfolio-nu.vercel.app)**.

## About

This is Talha Habib's personal portfolio, showcasing projects, skills, and live GitHub activity as a Full-Stack Developer (MERN & Laravel) based in Chitral, Pakistan.

## Features

- **Hero section** — intro, role, and quick social links (GitHub, LinkedIn, Facebook, WhatsApp)
- **About** — short bio and background
- **Live GitHub Activity** — repo count, stars, languages, and followers pulled straight from the GitHub API
- **Services** — Frontend, Backend, and AI Integration
- **Projects** — a grid of linked GitHub repos
- **Languages, Frameworks & Tools** — icon grid of the stack in use
- **Contact form** — powered by [Formspree](https://formspree.io)
- Smooth scroll-reveal animations, continuous motion effects, and a responsive two-column layout

## Tech Stack

| Category | Tools |
|---|---|
| Markup / Styling | HTML5, Tailwind CSS, custom CSS for bespoke visual effects |
| Scripting | Vanilla JavaScript |
| Icons | [Boxicons](https://boxicons.com), [Devicon](https://devicon.dev) |
| Fonts | Google Fonts (Poppins, Inter) |
| Forms | Formspree |
| Hosting | Vercel |

## Project Structure

```
Portfolio/
├── index.html                     # Main page markup
├── tailwind.input.css             # Tailwind entry point and custom keyframes
├── tailwind.css                   # Generated stylesheet served by the site
├── style.css                      # Portfolio component and layout styles
├── motion.css                     # Custom continuous motion and visual effects
├── script.js                      # Scroll-reveal, nav toggle, form handling, etc.
├── github-activity.js             # Fetches and renders live GitHub stats
├── github-activity.css            # Styles for the GitHub activity section
├── github-activity-chart-fix.css  # Layout/rendering fixes for the activity chart
├── favicon-64.png                 # Site favicon
├── t1.png                         # Hero/profile image
└── Talha-Habib-CV.pdf             # Downloadable CV/resume
```

## Running Locally

The generated Tailwind stylesheet is checked in for static hosting. Rebuild it after changing Tailwind classes or `tailwind.input.css`.

1. Clone the repo
   ```bash
   git clone https://github.com/TalhaHabib-hub/Portfolio.git
   cd Portfolio
   ```
2. Install the build dependency and generate the Tailwind stylesheet:
   ```bash
   npm install
   npm run build
   ```
3. Open `index.html` in your browser, or serve it locally:
   ```bash
   npx serve .
   ```

## Setup Notes

- The contact form already posts to a live [Formspree](https://formspree.io) endpoint configured in `index.html` — if you fork this, swap in your own Formspree form ID to make it functional for you.
- The GitHub Activity section fetches data live from the GitHub API for the `TalhaHabib-hub` account — update the username in `github-activity.js` if you fork this for your own use.

## Deployment

Deployed on [Vercel](https://vercel.com). `vercel.json` runs the Tailwind build during deployment and publishes the project root. In Vercel Project Settings, set the Root Directory to the repository root and the Production Branch to `main`. The custom galaxy, hexagon, chart, and motion effects remain in their dedicated CSS files to preserve their rendering and behavior.

## License

This project is open for reference and learning. Feel free to fork it, but please don't pass it off as your own portfolio.

## Contact

- GitHub: [@TalhaHabib-hub](https://github.com/TalhaHabib-hub)
- LinkedIn: [Talha Habib](https://www.linkedin.com/in/talha-habib-411405410/)
