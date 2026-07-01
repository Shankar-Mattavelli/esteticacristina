/**
 * Estetica Cristina — script.js
 * GSAP + ScrollTrigger · Hero slider · Gold shimmer
 * accordion · nav mobile · active nav · back-to-top.
 */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
   * Hero slider — 3 frasi in crossfade ogni ~5s
   * Indipendente da GSAP, gira sempre
   * ───────────────────────────────────────────── */
  (function initHeroSlider() {
    const slides = document.querySelectorAll('.hero__slide');
    if (slides.length <= 1) return;

    let current = 0;
    const INTERVAL = 5000; // ms tra uno slide e l'altro

    setInterval(() => {
      slides[current].classList.remove('is-active');
      slides[current].setAttribute('aria-hidden', 'true');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
      slides[current].setAttribute('aria-hidden', 'false');
    }, INTERVAL);
  })();

  /* ─────────────────────────────────────────────
   * GSAP init
   * ───────────────────────────────────────────── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    if (!prefersReducedMotion) {
      initHero();
      initReveals();
      initParallax();
    } else {
      showAllImmediately();
    }
    initCounters();
  } else {
    showAllImmediately();
    initCountersFallback();
  }

  function showAllImmediately() {
    document.querySelectorAll(
      '.reveal, .hero__divider, .hero__subtitle, .hero__scroll'
    ).forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    /* Tutti gli slide visibili subito */
    document.querySelectorAll('.hero__slide').forEach(s => {
      s.style.opacity = s.classList.contains('is-active') ? '1' : '0';
    });
  }

  /* ─────────────────────────────────────────────
   * Hero: entrance animation scoped al primo slide
   * ───────────────────────────────────────────── */
  function initHero() {
    const heroImg    = document.querySelector('.hero__media img');
    const firstSlide = document.querySelector('.hero__slide.is-active');
    const eyebrow    = firstSlide?.querySelector('.hero__eyebrow');
    const lines      = firstSlide ? [...firstSlide.querySelectorAll('.hero__line')] : [];
    const divider    = document.querySelector('.hero__divider');
    const subtitle   = document.querySelector('.hero__subtitle');
    const heroScroll = document.querySelector('.hero__scroll');

    /* Stato iniziale esplicito via GSAP (sovrascrive CSS per il primo slide) */
    if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 18 });
    lines.forEach(l => gsap.set(l, { opacity: 0, y: 44 }));

    if (heroImg) {
      gsap.fromTo(heroImg,
        { opacity: 0, scale: 1 },
        { opacity: 1, scale: 1, duration: 2.2, ease: 'power2.out' }
      );
      gsap.to(heroImg, {
        scale: 1.04,
        y: '-1.5%',
        duration: 34,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 2,
      });
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (eyebrow) {
      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.9 }, 0.5);
    }

    lines.forEach((line, i) => {
      tl.to(line, { opacity: 1, y: 0, duration: 1.1 }, 0.78 + i * 0.22);
    });

    if (divider) {
      tl.fromTo(divider,
        { opacity: 0, scaleX: 0 },
        { opacity: 1, scaleX: 1, duration: 0.75, transformOrigin: 'center center' },
        1.25
      );
    }

    if (subtitle) {
      tl.fromTo(subtitle,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8 },
        1.42
      );
    }

    if (heroScroll) {
      tl.fromTo(heroScroll,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        1.72
      );
    }
  }

  /* ─────────────────────────────────────────────
   * ScrollTrigger batch reveals
   * ───────────────────────────────────────────── */
  function initReveals() {
    ScrollTrigger.batch('.reveal', {
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.1,
      }),
      start: 'top 87%',
      once: true,
    });
  }

  /* ─────────────────────────────────────────────
   * Subtle parallax on editorial + benessere
   * ───────────────────────────────────────────── */
  function initParallax() {
    document.querySelectorAll(
      '.editorial__media img, .benessere__media img'
    ).forEach(img => {
      const section = img.closest('.editorial, .benessere');
      if (!section) return;
      gsap.fromTo(img,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    });
  }

  /* ─────────────────────────────────────────────
   * Count-up — GSAP version
   * ───────────────────────────────────────────── */
  function initCounters() {
    document.querySelectorAll('[data-count-to]').forEach(el => {
      const target = parseInt(el.dataset.countTo, 10);
      const suffix = el.dataset.suffix || '';
      const obj    = { val: 0 };

      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString('it-IT') + suffix;
        return;
      }

      ScrollTrigger.create({
        trigger: el,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.val).toLocaleString('it-IT') + suffix;
            },
          });
        },
      });
    });
  }

  function initCountersFallback() {
    document.querySelectorAll('[data-count-to]').forEach(el => {
      const target = parseInt(el.dataset.countTo, 10);
      const suffix = el.dataset.suffix || '';
      el.textContent = target.toLocaleString('it-IT') + suffix;
    });
  }

  /* ─────────────────────────────────────────────
   * Mobile navigation
   * ───────────────────────────────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    mobileNav.dataset.state = 'closed';
    document.body.classList.remove('nav-open');
  }
  function openMobileNav() {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute('aria-expanded', 'true');
    mobileNav.dataset.state = 'open';
    document.body.classList.add('nav-open');
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      navToggle.getAttribute('aria-expanded') === 'true' ? closeMobileNav() : openMobileNav();
    });
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileNav));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileNav.dataset.state === 'open') {
        closeMobileNav();
        navToggle.focus();
      }
    });
  }

  /* ─────────────────────────────────────────────
   * Header scroll class
   * ───────────────────────────────────────────── */
  const header = document.getElementById('site-header');
  function handleHeaderScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  handleHeaderScroll();
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  /* ─────────────────────────────────────────────
   * Accordion FAQ
   * ───────────────────────────────────────────── */
  const accordion = document.getElementById('faq-accordion');
  if (accordion) {
    accordion.querySelectorAll('.accordion__trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        accordion.querySelectorAll('.accordion__trigger').forEach(t =>
          t.setAttribute('aria-expanded', 'false')
        );
        trigger.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }

  /* ─────────────────────────────────────────────
   * Active nav link on scroll
   * ───────────────────────────────────────────── */
  const navLinks = document.querySelectorAll('.main-nav__link');
  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id   = entry.target.id;
        const link = document.querySelector(`.main-nav__link[href="#${id}"]`);
        if (link && entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach(s => io.observe(s));
  }

  /* ─────────────────────────────────────────────
   * Back to top
   * ───────────────────────────────────────────── */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 700);
    }, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }
})();
