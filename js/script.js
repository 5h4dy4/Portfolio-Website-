/**
 * ============================================================
 * MALIK MASOOD – PORTFOLIO | script.js
 * Clean, modern, native JavaScript – 9 interactive features
 * ============================================================
 */

"use strict";

/* ============================================================
   UTILITY: DOM Selector Helpers
   ============================================================ */
const qs  = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

/* ============================================================
   FEATURE 1: WEBSITE PRELOADER
   Listen for the global window "load" event. When triggered,
   transition #preloader to hidden.
   ============================================================ */
(function initPreloader() {
  const preloader = qs("#preloader");
  if (!preloader) return;

  window.addEventListener("load", () => {
    // Brief pause so animation can be appreciated
    setTimeout(() => {
      preloader.classList.add("hidden");
      // Remove from DOM after transition completes
      preloader.addEventListener("transitionend", () => {
        preloader.style.display = "none";
      }, { once: true });
    }, 600);
  });
})();

/* ============================================================
   FEATURE 2: MOBILE NAVBAR TOGGLE
   Select .menu-btn and .navbar. Attach a click event listener
   that invokes classList.toggle("active") on the nav menu.
   ============================================================ */
(function initMobileNav() {
  const menuBtn = qs(".menu-btn");
  const navbar  = qs(".navbar");
  if (!menuBtn || !navbar) return;

  menuBtn.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("active");
    menuBtn.classList.toggle("open", isOpen);
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  // Close nav when a link is clicked (mobile UX)
  qsa(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      navbar.classList.remove("active");
      menuBtn.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });

  // Close nav when clicking outside
  document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target) && !menuBtn.contains(e.target)) {
      navbar.classList.remove("active");
      menuBtn.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });
})();

/* ============================================================
   FEATURE 4: AUTO TYPING SCRIPT
   ============================================================ */
(function initTypingEffect() {
  const typingEl = qs(".typing-text");
  if (!typingEl) return;

  // Respect reduced-motion: just show first string
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typingEl.textContent = "I am a Software Engineer";
    return;
  }

  const strings     = [
    "I am a Software Engineer",
    "I Build Python Applications",
    "I Create Automated Systems",
    "I Design IoT Solutions",
    "I Produce Creative Content",
    "I Solve Complex Problems"
  ];

  let stringIndex = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  let isPaused    = false;

  const TYPING_SPEED   = 100;
  const DELETING_SPEED = 50;
  const PAUSE_AFTER    = 2000;
  const PAUSE_BEFORE   = 400;

  function type() {
    if (isPaused) return;

    const currentString = strings[stringIndex];

    if (!isDeleting) {
      // Typing forward: rebuild the full substring up to charIndex+1
      typingEl.textContent = currentString.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentString.length) {
        // Reached full string – pause then start deleting
        isPaused = true;
        setTimeout(() => {
          isPaused = false;
          isDeleting = true;
          type();
        }, PAUSE_AFTER);
        return;
      }
    } else {
      // Deleting backward
      typingEl.textContent = currentString.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        // Finished deleting – move to next string
        isDeleting = false;
        stringIndex = (stringIndex + 1) % strings.length;
        isPaused = true;
        setTimeout(() => {
          isPaused = false;
          type();
        }, PAUSE_BEFORE);
        return;
      }
    }

    setTimeout(type, isDeleting ? DELETING_SPEED : TYPING_SPEED);
  }

  // Kick off after a short delay so hero is visible first
  setTimeout(type, 800);
})();

/* ============================================================
   FEATURE 5: DYNAMIC SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
(function initScrollReveal() {
  const revealEls = qsa(".reveal");
  if (!revealEls.length) return;

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("active"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -100px 0px", threshold: 0.05 });

  revealEls.forEach(el => io.observe(el));
})();

/* ============================================================
   FEATURE 5b: PROGRESS BAR ANIMATION (IntersectionObserver)
   ============================================================ */
(function initProgressBars() {
  const progressFills = qsa(".progress-fill");
  const skillsSection = qs("#skills");
  if (!progressFills.length || !skillsSection) return;

  const fill = () => progressFills.forEach(f => {
    f.style.width = (f.getAttribute("data-width") || "0") + "%";
  });

  if (!("IntersectionObserver" in window)) { fill(); return; }

  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      fill();
      io.disconnect();
    }
  }, { rootMargin: "0px 0px -100px 0px" });
  io.observe(skillsSection);
})();

/* ============================================================
   FEATURE 6: NAVBAR HIGHLIGHTING ENGINE (IntersectionObserver + rAF)
   ============================================================ */
(function initNavHighlight() {
  const navLinks = qsa(".nav-link");
  const sections = qsa("section[id]");
  const header   = qs("#header");
  if (!navLinks.length || !sections.length) return;

  // Header scrolled state — throttle via rAF
  let scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      if (header) header.classList.toggle("scrolled", window.scrollY > 50);
      scrollTicking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Section -> link highlight via IntersectionObserver
  if (!("IntersectionObserver" in window)) return;

  const setActive = (id) => navLinks.forEach(link => {
    link.classList.toggle("active-link", link.getAttribute("href") === `#${id}`);
  });

  const navHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--navbar-height") || "70"
  );

  const io = new IntersectionObserver((entries) => {
    // Pick the entry closest to the top that is intersecting
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) setActive(visible[0].target.id);
  }, {
    rootMargin: `-${navHeight + 20}px 0px -55% 0px`,
    threshold: 0
  });

  sections.forEach(s => io.observe(s));
})();

/* ============================================================
   FEATURE 7: CATEGORY PORTFOLIO FILTERING
   Uses .is-hidden + data-position so visible cards keep their
   alternating left/right layout regardless of filter state.
   ============================================================ */
(function initProjectFilter() {
  const filterBtns  = qsa(".filter-btn");
  const projectCards = qsa(".project-card");
  if (!filterBtns.length || !projectCards.length) return;

  function applyAlternating() {
    let visibleIndex = 0;
    projectCards.forEach(card => {
      if (card.classList.contains("is-hidden")) {
        card.removeAttribute("data-position");
        return;
      }
      card.setAttribute("data-position", visibleIndex % 2 === 0 ? "odd" : "even");
      visibleIndex++;
    });
  }

  // Initial pass — every card visible
  applyAlternating();

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => {
        b.classList.remove("active-filter");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active-filter");
      btn.setAttribute("aria-pressed", "true");

      const filter = btn.getAttribute("data-filter");

      projectCards.forEach(card => {
        const matches = filter === "all" || card.classList.contains(filter);
        card.classList.toggle("is-hidden", !matches);
        if (matches) card.classList.add("active");
      });

      applyAlternating();
    });
  });
})();

/* ============================================================
   FEATURE 8: CONTACT FORM INPUT VALIDATION
   Attach a "submit" intercept listener to the form element.
   Query Name, Email, and Message fields. If any param is blank,
   display a browser alert("Please fill all fields") and halt
   via e.preventDefault(). Also run inline field validation.
   ============================================================ */
(function initFormValidation() {
  const form       = qs("#contact-form");
  const nameField  = qs("#name");
  const emailField = qs("#email");
  const msgField   = qs("#message");
  const submitBtn  = qs("#submit-btn");
  const successMsg = qs("#form-success");

  if (!form) return;

  /* ---- Inline real-time field validation ---- */
  function validateField(field, errorId, validatorFn) {
    const errorEl = qs(`#${errorId}`);
    const message = validatorFn(field.value.trim());

    if (message) {
      field.classList.add("error");
      field.classList.remove("success");
      if (errorEl) errorEl.textContent = message;
      return false;
    } else {
      field.classList.remove("error");
      field.classList.add("success");
      if (errorEl) errorEl.textContent = "";
      return true;
    }
  }

  const validators = {
    name: (v) => {
      if (!v)          return "Name is required.";
      if (v.length < 2)return "Name must be at least 2 characters.";
      return null;
    },
    email: (v) => {
      if (!v) return "Email is required.";
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(v)) return "Please enter a valid email address.";
      return null;
    },
    message: (v) => {
      if (!v)           return "Message is required.";
      if (v.length < 10)return "Message must be at least 10 characters.";
      return null;
    }
  };

  // Attach blur listeners for real-time inline feedback
  if (nameField)  nameField.addEventListener("blur",  () => validateField(nameField,  "name-error",    validators.name));
  if (emailField) emailField.addEventListener("blur", () => validateField(emailField, "email-error",   validators.email));
  if (msgField)   msgField.addEventListener("blur",   () => validateField(msgField,   "message-error", validators.message));

  /* ---- Form submit handler ---- */
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Always intercept first

    const nameVal  = nameField  ? nameField.value.trim()  : "";
    const emailVal = emailField ? emailField.value.trim() : "";
    const msgVal   = msgField   ? msgField.value.trim()   : "";

    /* Run full validation suite (inline errors instead of alert) */
    const nameOk  = validateField(nameField,  "name-error",    validators.name);
    const emailOk = validateField(emailField, "email-error",   validators.email);
    const msgOk   = validateField(msgField,   "message-error", validators.message);

    if (!nameOk || !emailOk || !msgOk) {
      // Focus first invalid field for keyboard users
      const firstInvalid = [nameField, emailField, msgField].find(f => f && f.classList.contains("error"));
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    /* Simulate async form submission */
    const btnText    = qs(".btn-text",    submitBtn);
    const btnLoading = qs(".btn-loading", submitBtn);

    if (btnText)    btnText.style.display    = "none";
    if (btnLoading) btnLoading.style.display = "inline-flex";
    submitBtn.disabled = true;

    setTimeout(() => {
      // Reset loading state
      if (btnText)    btnText.style.display    = "inline-flex";
      if (btnLoading) btnLoading.style.display = "none";
      submitBtn.disabled = false;

      // Show success message
      if (successMsg) successMsg.style.display = "flex";

      // Clear form
      form.reset();
      [nameField, emailField, msgField].forEach(f => {
        if (f) { f.classList.remove("success", "error"); }
      });

      // Hide success message after 5s
      setTimeout(() => {
        if (successMsg) successMsg.style.display = "none";
      }, 5000);
    }, 1800);
  });
})();

/* ============================================================
   FEATURE 9: SCROLL-TO-TOP NAVIGATION TRIGGER (rAF throttled)
   ============================================================ */
(function initScrollToTop() {
  const topBtn = qs("#topBtn");
  if (!topBtn) return;

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      topBtn.style.display = window.scrollY > 300 ? "block" : "none";
      ticking = false;
    });
  }, { passive: true });

  topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ============================================================
   BONUS FEATURE: TIMELINE TAB SWITCHER
   Switch between Experience and Education panels.
   ============================================================ */
(function initTimelineTabs() {
  const tabs   = qsa(".timeline-tab");
  const panels = qsa(".timeline-panel");
  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");

      tabs.forEach(t  => t.classList.remove("active-tab"));
      panels.forEach(p => p.classList.remove("active-panel"));

      tab.classList.add("active-tab");

      const targetPanel = qs(`#${target}-panel`);
      if (targetPanel) {
        targetPanel.classList.add("active-panel");
        // Re-trigger reveal animations for newly visible items
        setTimeout(() => {
          qsa(".reveal", targetPanel).forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 50) {
              el.classList.add("active");
            }
          });
        }, 50);
      }
    });
  });
})();

/* ============================================================
   BONUS FEATURE: DYNAMIC FOOTER YEAR
   Keep copyright year always current.
   ============================================================ */
(function initFooterYear() {
  const yearEl = qs("#footer-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();

/* ============================================================
   BONUS FEATURE: SMOOTH SECTION ENTRY ANIMATIONS
   Stagger reveal delays for grouped child elements.
   ============================================================ */
(function initStaggeredReveal() {
  const staggerParents = qsa(".projects-grid, .certs-grid, .tools-grid");

  staggerParents.forEach(parent => {
    const children = [...parent.children];
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
    });
  });
})();

/* (Removed legacy MutationObserver — filter logic now handles
   reveal directly via classList.add("active") on each visible card.) */

/* ============================================================
   BONUS FEATURE: HEADER LOGO EASTER EGG
   Triple-click the logo to trigger a rainbow shimmer effect.
   ============================================================ */
(function initLogoEasterEgg() {
  const logo = qs(".logo");
  if (!logo) return;

  let clickCount = 0;
  let clickTimer;

  logo.addEventListener("click", () => {
    clickCount++;
    clearTimeout(clickTimer);

    clickTimer = setTimeout(() => {
      if (clickCount >= 3) {
        logo.style.animation = "gradientShift 0.5s ease 3";
        logo.style.background = "linear-gradient(135deg, #00adb5, #e94560, #f5a623, #00adb5)";
        logo.style.webkitBackgroundClip = "text";
        logo.style.webkitTextFillColor = "transparent";
        logo.style.backgroundClip = "text";
        logo.style.backgroundSize = "200% 200%";
        setTimeout(() => {
          logo.style.animation = "";
          logo.style.background = "";
          logo.style.webkitBackgroundClip = "";
          logo.style.webkitTextFillColor = "";
          logo.style.backgroundClip = "";
          logo.style.backgroundSize = "";
        }, 1500);
      }
      clickCount = 0;
    }, 400);
  });
})();

/* ============================================================
   FEATURE 10: THEME TOGGLE (LIGHT/DARK MODE)
   Icon shows the theme you'll switch TO (sun in dark, moon in light).
   ============================================================ */
(function initThemeToggle() {
  const themeToggle = qs("#theme-toggle");
  if (!themeToggle) return;

  const icon = qs("i", themeToggle);
  const mql  = window.matchMedia("(prefers-color-scheme: light)");

  function applyTheme(isLight) {
    document.body.classList.toggle("light-mode", isLight);
    if (icon) {
      icon.classList.toggle("fa-moon", isLight);  // light mode → click to go dark (moon)
      icon.classList.toggle("fa-sun",  !isLight); // dark mode  → click to go light (sun)
    }
    themeToggle.setAttribute(
      "aria-label",
      isLight ? "Switch to dark mode" : "Switch to light mode"
    );
  }

  // Initial state
  const stored = localStorage.getItem("theme");
  applyTheme(stored ? stored === "light" : mql.matches);

  themeToggle.addEventListener("click", () => {
    const next = !document.body.classList.contains("light-mode");
    applyTheme(next);
    localStorage.setItem("theme", next ? "light" : "dark");
  });

  // React to system preference changes if user hasn't chosen
  mql.addEventListener && mql.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) applyTheme(e.matches);
  });
})();

