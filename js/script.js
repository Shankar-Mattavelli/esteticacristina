/**
 * Estetica Cristina — script.js
 * Comportamenti: menu mobile, scroll reveal, contatore statistiche,
 * accordion FAQ, nav attiva on-scroll, back-to-top.
 */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
   * Menu mobile
   * ------------------------------------------------------------- */
  const navToggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  function closeMobileNav() {
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.dataset.state = "closed";
    document.body.classList.remove("nav-open");
  }

  function openMobileNav() {
    navToggle.setAttribute("aria-expanded", "true");
    mobileNav.dataset.state = "open";
    document.body.classList.add("nav-open");
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMobileNav() : openMobileNav();
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileNav.dataset.state === "open") {
        closeMobileNav();
        navToggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------------
   * Header: aspetto leggermente più opaco dopo lo scroll iniziale
   * ------------------------------------------------------------- */
  const header = document.getElementById("site-header");
  function handleHeaderScroll() {
    if (window.scrollY > 12) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  handleHeaderScroll();
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });

  /* ---------------------------------------------------------------
   * Scroll reveal — IntersectionObserver
   * ------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------------
   * Contatore statistiche animato
   * ------------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-count-to]");

  function animateCounter(el) {
    const target = parseInt(el.dataset.countTo, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1500;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString("it-IT") + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString("it-IT") + suffix;
    } else {
      requestAnimationFrame(tick);
    }
  }

  if (counters.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------------------------------------------------------------
   * Accordion FAQ
   * ------------------------------------------------------------- */
  const accordion = document.getElementById("faq-accordion");

  if (accordion) {
    const triggers = accordion.querySelectorAll(".accordion__trigger");

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";

        triggers.forEach((t) => t.setAttribute("aria-expanded", "false"));

        trigger.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  }

  /* ---------------------------------------------------------------
   * Nav attiva in base alla sezione visibile
   * ------------------------------------------------------------- */
  const navLinks = document.querySelectorAll(".main-nav__link");
  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("id");
          const link = document.querySelector(`.main-nav__link[href="#${id}"]`);
          if (!link) return;

          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------------------------------------------------------------
   * Back to top
   * ------------------------------------------------------------- */
  const backToTop = document.getElementById("back-to-top");

  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => {
        backToTop.classList.toggle("is-visible", window.scrollY > 700);
      },
      { passive: true }
    );

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }
})();
