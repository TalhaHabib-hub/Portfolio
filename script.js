"use strict";

const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle?.querySelector(".theme-icon");
const themeColor = document.querySelector('meta[name="theme-color"]');
const hero = document.querySelector(".hero");
const heroSlides = [...document.querySelectorAll(".hero-landscape")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let activeHeroSlides = [];
let activeHeroSlide = 0;
let heroRotation;
let cursorWeather;
let rainLayer;

function syncHeroRotation() {
  if (document.hidden || reducedMotion.matches || activeHeroSlides.length < 2) {
    window.clearInterval(heroRotation);
    heroRotation = undefined;
    return;
  }
  if (heroRotation !== undefined) return;

  heroRotation = window.setInterval(() => {
    activeHeroSlides[activeHeroSlide].classList.remove("is-active");
    activeHeroSlide = (activeHeroSlide + 1) % activeHeroSlides.length;
    activeHeroSlides[activeHeroSlide].classList.add("is-active");
    hero?.classList.toggle("has-water-scene", activeHeroSlides[activeHeroSlide].src.includes("mountain-lake"));
  }, 7000);
}

function selectHeroSlides(theme) {
  window.clearInterval(heroRotation);
  heroRotation = undefined;
  heroSlides.forEach((slide) => slide.classList.remove("is-active"));
  activeHeroSlides = heroSlides.filter((slide) => slide.dataset.theme === theme || slide.dataset.theme === "all");
  activeHeroSlide = 0;
  activeHeroSlides[activeHeroSlide]?.classList.add("is-active");
  hero?.classList.toggle("has-water-scene", activeHeroSlides[activeHeroSlide]?.src.includes("mountain-lake") || false);
  syncHeroRotation();
}

function setTheme(theme, persist) {
  root.dataset.theme = theme;
  selectHeroSlides(theme);
  const isDark = theme === "dark";
  if (cursorWeather) cursorWeather.style.opacity = "1";

  if (themeIcon) themeIcon.textContent = isDark ? "☀" : "☾";
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
    themeToggle.title = `Switch to ${isDark ? "light" : "dark"} theme`;
  }
  if (themeColor) themeColor.content = isDark ? "#111512" : "#eee8db";
  if (persist) window.localStorage.setItem("portfolio-theme", theme);
}

let snowLayer;

function createSnowEffects() {
  if (snowLayer || rainLayer || !document.body) return;

  snowLayer = document.createElement("div");
  snowLayer.className = "snow-layer";
  snowLayer.setAttribute("aria-hidden", "true");

  for (let index = 0; index < 30; index += 1) {
    const flake = document.createElement("span");
    flake.className = "snowflake";
    const size = 4 + Math.random() * 7;
    flake.style.setProperty("--size", `${size}px`);
    flake.style.setProperty("--opacity", `${0.25 + Math.random() * 0.75}`);
    flake.style.setProperty("--duration", `${8 + Math.random() * 12}s`);
    flake.style.setProperty("--delay", `${(Math.random() * 10).toFixed(2)}s`);
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.setProperty("--drift", `${(-50 + Math.random() * 100).toFixed(0)}px`);
    snowLayer.appendChild(flake);
  }

  document.body.appendChild(snowLayer);

  rainLayer = document.createElement("div");
  rainLayer.className = "rain-layer";
  rainLayer.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 52; index += 1) {
    const drop = document.createElement("span");
    drop.className = "raindrop";
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.setProperty("--length", `${14 + Math.random() * 20}px`);
    drop.style.setProperty("--duration", `${1 + Math.random() * 1.2}s`);
    drop.style.setProperty("--delay", `${(Math.random() * 2.2).toFixed(2)}s`);
    drop.style.setProperty("--drift", `${(-45 + Math.random() * 35).toFixed(0)}px`);
    drop.style.setProperty("--opacity", `${0.35 + Math.random() * 0.45}`);
    rainLayer.appendChild(drop);
  }
  document.body.appendChild(rainLayer);

  cursorWeather = document.createElement("div");
  cursorWeather.className = "weather-cursor";
  document.body.appendChild(cursorWeather);

  window.addEventListener("pointermove", (event) => {
    const angle = root.dataset.theme === "dark" ? " rotate(11deg)" : "";
    cursorWeather.style.transform = `translate(${event.clientX}px, ${event.clientY}px)${angle}`;
  });

  window.addEventListener("pointerleave", () => {
    cursorWeather.style.opacity = "0";
  });
}

createSnowEffects();

let savedTheme;
try {
  savedTheme = window.localStorage.getItem("portfolio-theme");
} catch (error) {
  console.warn("Could not read the saved theme preference.", error);
}
const initialTheme = savedTheme === "light" || savedTheme === "dark"
  ? savedTheme
  : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
setTheme(initialTheme, false);

document.addEventListener("visibilitychange", syncHeroRotation);
reducedMotion.addEventListener("change", syncHeroRotation);

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  try {
    setTheme(nextTheme, true);
  } catch (error) {
    setTheme(nextTheme, false);
    console.warn("Could not save the theme preference.", error);
  }
});

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const contactForm = document.getElementById("contactForm");
const statusMessage = document.getElementById("cf-status");
const submitButton = document.getElementById("cf-submit");

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!statusMessage || !submitButton) return;

  statusMessage.textContent = "Sending your message…";
  statusMessage.dataset.state = "";
  submitButton.disabled = true;

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(contactForm)
    });

    if (!response.ok) throw new Error(`Form submission failed (${response.status}).`);
    statusMessage.textContent = "Thanks — your message has been sent.";
    statusMessage.dataset.state = "success";
    contactForm.reset();
  } catch (error) {
    console.error("Contact form submission failed.", error);
    statusMessage.textContent = "Your message could not be sent. Please try again or contact me on WhatsApp.";
    statusMessage.dataset.state = "error";
  } finally {
    submitButton.disabled = false;
  }
});
