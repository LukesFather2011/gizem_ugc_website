/* =========================================================
   Gizem Squires — UGC Portfolio
   script.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  initMobileNav();
  initScrollReveal();
  initVideoPlaceholders();
  initContactForm();
});

/* ---------- footer year ---------- */
function setYear(){
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- mobile nav toggle ---------- */
function initMobileNav(){
  const toggle = document.getElementById("navToggle");
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("mainNav");
  if (!toggle || !header || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    });
  });
}

/* ---------- scroll reveal ---------- */
function initScrollReveal(){
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || !("IntersectionObserver" in window)){
    targets.forEach(t => t.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

  targets.forEach((t, i) => {
    t.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
    observer.observe(t);
  });
}

/* ---------- video placeholders ----------
   Each portfolio card and hero phone has a play button. If a real
   video file exists at the given src, clicking plays/pauses it in
   place. If no file has been dropped into /assets yet, the button
   simply shows the gradient placeholder — no console errors, no
   broken UI. Swap in real .mp4 files under /assets with the same
   filenames referenced in index.html and playback will work as-is.
------------------------------------------------- */
function initVideoPlaceholders(){
  const activePlayers = []; // { video, btn } for every real, playable video

  document.querySelectorAll(".play-btn").forEach(btn => {
    const window_ = btn.closest("[data-video-window]");
    const video = window_ ? window_.querySelector(".video-el") : null;

    if (!video){
      // hero decorative phones with no real <video> element
      btn.addEventListener("click", () => {
        btn.classList.toggle("is-playing");
      });
      return;
    }

    // hide the fallback gradient once the video is confirmed playable —
    // the poster attribute already shows on its own before that happens,
    // so there's no need to hide the <video> element itself
    video.addEventListener("loadeddata", () => {
      const fallback = window_.querySelector(".video-fallback");
      if (fallback) fallback.style.opacity = "0";
    });

    video.addEventListener("error", () => {
      // no file at this path yet — keep the gradient fallback visible
      video.style.display = "none";
    });

    const pauseAndReset = (v, b) => {
      v.pause();
      b.classList.remove("is-playing");
      const label = b.getAttribute("aria-label");
      if (label && label.startsWith("Pause")) {
        b.setAttribute("aria-label", label.replace("Pause", "Play"));
      }
    };

    btn.addEventListener("click", () => {
      if (video.style.display === "none") return; // no source available

      if (video.paused){
        // stop every other playing clip first so audio never overlaps
        activePlayers.forEach(({ video: v, btn: b }) => {
          if (v !== video && !v.paused) pauseAndReset(v, b);
        });

        video.muted = false; // safe to unmute — this play() is triggered by a real click
        video.play();
        btn.classList.add("is-playing");
        btn.setAttribute("aria-label", btn.getAttribute("aria-label").replace("Play", "Pause"));
      } else {
        pauseAndReset(video, btn);
      }
    });

    activePlayers.push({ video, btn });

    // attempt to load metadata so the error/loadeddata handlers fire
    video.load();
  });
}

/* ---------- contact form ---------- */
function initContactForm(){
  const form = document.getElementById("contactForm");
  if (!form) return;

  const status = document.getElementById("formStatus");

  const validators = {
    name: value => value.trim().length > 0 || "Please enter your name.",
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Please enter a valid email.",
    message: value => value.trim().length > 0 || "Tell me a little about the project."
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    Object.keys(validators).forEach(fieldName => {
      const input = form.elements[fieldName];
      const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
      const field = input.closest(".field");
      const result = validators[fieldName](input.value);

      if (result !== true){
        isValid = false;
        field.classList.add("has-error");
        if (errorEl) errorEl.textContent = result;
      } else {
        field.classList.remove("has-error");
        if (errorEl) errorEl.textContent = "";
      }
    });

    if (!isValid){
      status.textContent = "Please fix the highlighted fields.";
      status.classList.remove("success");
      return;
    }

    // No backend is wired up yet — this simulates a successful send so
    // the flow can be reviewed end to end. Replace with a real fetch()
    // call to your form endpoint (Formspree, Netlify Forms, etc.) when
    // one is ready.
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    setTimeout(() => {
      status.textContent = "Thanks! Your message is on its way — I'll reply within a couple of days.";
      status.classList.add("success");
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
      form.reset();
    }, 700);
  });

  // clear individual field errors as the user fixes them
  Object.keys(validators).forEach(fieldName => {
    const input = form.elements[fieldName];
    if (!input) return;
    input.addEventListener("input", () => {
      const result = validators[fieldName](input.value);
      const field = input.closest(".field");
      const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
      if (result === true){
        field.classList.remove("has-error");
        if (errorEl) errorEl.textContent = "";
      }
    });
  });
}
