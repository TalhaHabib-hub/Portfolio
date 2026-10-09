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

  if (themeIcon) themeIcon.textContent = isDark ? "☀" : "☾";
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
    themeToggle.title = `Switch to ${isDark ? "light" : "dark"} theme`;
  }
  if (themeColor) themeColor.content = isDark ? "#111512" : "#f7f8f6";
  if (persist) window.localStorage.setItem("portfolio-theme", theme);
}

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
