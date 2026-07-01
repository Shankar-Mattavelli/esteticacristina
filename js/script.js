/**
 * Estetica Cristina — script.js
 *
 * Moduli:
 * · Hero entrance  — GSAP timeline sul primo slide
 * · Hero slider    — crossfade verticale (equivalente AnimatePresence mode="wait")
 *                    exit: opacity→0, y→-10px | enter: y=+12px→0, opacity→1
 *                    easing: cubic-bezier(0.16, 1, 0.3, 1) — soft spring
 * · Gold shimmer   — trigger random su .text-gold (gradiente radiale via @property)
 * · Reveals        — ScrollTrigger batch
 * · Parallax       — immagini editoriali
 * · Count-up       — GSAP
 * · Mobile nav
 * · Header scroll
 * · Active nav
 * · Back to top
 */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════════════════════════════════════
   * GSAP init
   * ══════════════════════════════════════════════ */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    if (!prefersReducedMotion) {
      initHero();
      initHeroSlider();
      initReveals();
      initParallax();
    } else {
      showAllImmediately();
      initHeroSliderFallback();
    }

    initCounters();
  } else {
    showAllImmediately();
    initHeroSliderFallback();
    initCountersFallback();
  }

  /* Desincronizza ogni elemento gold nel ciclo da 8s */
  if (!prefersReducedMotion) {
    document.querySelectorAll('.text-gold').forEach(el => {
      el.style.animationDelay = (-Math.random() * 8).toFixed(2) + 's';
    });
  }

  /* ──────────────────────────────────────────────
   * Fallback: mostra tutto immediatamente
   * (reduced-motion o GSAP non caricato)
   * ────────────────────────────────────────────── */
  function showAllImmediately() {
    document.querySelectorAll('.reveal, .hero__divider, .hero__subtitle, .hero__scroll')
      .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    document.querySelectorAll('.hero__slide').forEach(s => {
      s.style.opacity = s.classList.contains('is-active') ? '1' : '0';
    });
  }

  /* ══════════════════════════════════════════════
   * HERO — entrance animation (solo primo slide)
   * ══════════════════════════════════════════════ */
  function initHero() {
    const heroImg    = document.querySelector('.hero__media img');
    const firstSlide = document.querySelector('.hero__slide.is-active');
    const eyebrow    = firstSlide?.querySelector('.hero__eyebrow');
    const lines      = firstSlide ? [...firstSlide.querySelectorAll('.hero__line')] : [];
    const divider    = document.querySelector('.hero__divider');
    const subtitle   = document.querySelector('.hero__subtitle');
    const heroScroll = document.querySelector('.hero__scroll');

    /* Imposta stato iniziale esplicito via GSAP
       (evita conflitti con CSS opacity:0 sugli slide) */
    if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 18 });
    lines.forEach(l => gsap.set(l, { opacity: 0, y: 40 }));

    /* Foto di sfondo: fade-in + lento zoom loop */
    if (heroImg) {
      gsap.fromTo(heroImg,
        { opacity: 0, scale: 1 },
        { opacity: 1, scale: 1, duration: 2.2, ease: 'power2.out' }
      );
      gsap.to(heroImg, {
        scale: 1.04, y: '-1.5%',
        duration: 34, ease: 'sine.inOut',
        repeat: -1, yoyo: true, delay: 2,
      });
    }

    /* Timeline di entrata */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    /* Primo slide: opacity gestita qui, non dal slider */
    if (firstSlide) tl.to(firstSlide, { opacity: 1, duration: 0.6 }, 0);

    if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.85 }, 0.5);

    lines.forEach((line, i) => {
      tl.to(line, { opacity: 1, y: 0, duration: 1.0 }, 0.75 + i * 0.2);
    });

    if (divider) {
      tl.fromTo(divider,
        { opacity: 0, scaleX: 0 },
        { opacity: 1, scaleX: 1, duration: 0.7, transformOrigin: 'center center' },
        1.2
      );
    }

    if (subtitle) tl.fromTo(subtitle, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.75 }, 1.38);
    if (heroScroll) tl.fromTo(heroScroll, { opacity: 0 }, { opacity: 1, duration: 0.55 }, 1.65);
  }

  /* ══════════════════════════════════════════════
   * HERO SLIDER — crossfade verticale GSAP
   *
   * Equivalente di AnimatePresence mode="wait":
   *   EXIT  → opacity:0, y:-10px  (0.48s)
   *   ENTER ← opacity:0, y:+12px → opacity:1, y:0  (1.05s)
   *
   * Easing: cubic-bezier(0.16, 1, 0.3, 1)
   *   fast start, morbida decelerazione finale (soft spring)
   * ══════════════════════════════════════════════ */
  function initHeroSlider() {
    const slides = document.querySelectorAll('.hero__slide');
    if (slides.length <= 1) return;

    const EASE           = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const VISIBLE_MS     = 4200;  /* ogni frase visibile 4.2s dopo l'entrata */
    const INITIAL_DELAY  = 3800;  /* attesa iniziale: completa le animazioni di entrata */
    let current          = 0;
    let isAnimating      = false;

    function cycleSlide() {
      if (isAnimating) return;
      isAnimating = true;

      const nextIdx  = (current + 1) % slides.length;
      const leaving  = slides[current];
      const entering = slides[nextIdx];

      /* ── EXIT: slide verso l'alto ── */
      gsap.to(leaving, {
        opacity: 0,
        y: -10,
        duration: 0.48,
        ease: EASE,
        onComplete: () => {
          leaving.classList.remove('is-active');
          leaving.setAttribute('aria-hidden', 'true');
          /* Reset posizione per il ciclo successivo (mantieni opacity:0) */
          gsap.set(leaving, { y: 0 });

          /* ── ENTER: slide dal basso ── */
          entering.classList.add('is-active');
          entering.setAttribute('aria-hidden', 'false');

          gsap.fromTo(entering,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 1.05,
              ease: EASE,
              onComplete: () => {
                current = nextIdx;
                isAnimating = false;
                /* Prossima transizione dopo VISIBLE_MS dal completamento dell'entrata */
                setTimeout(cycleSlide, VISIBLE_MS);
              },
            }
          );
        },
      });
    }

    /* Prima transizione dopo il delay iniziale */
    setTimeout(cycleSlide, INITIAL_DELAY);
  }

  /* Fallback senza GSAP o con reduced motion — toggle istantaneo */
  function initHeroSliderFallback() {
    const slides = document.querySelectorAll('.hero__slide');
    if (slides.length <= 1) return;
    let current = 0;
    setInterval(() => {
      slides[current].style.opacity = '0';
      slides[current].classList.remove('is-active');
      slides[current].setAttribute('aria-hidden', 'true');
      current = (current + 1) % slides.length;
      slides[current].style.opacity = '1';
      slides[current].classList.add('is-active');
      slides[current].setAttribute('aria-hidden', 'false');
    }, 4200);
  }

  /* Randomizza il punto di partenza di ogni .text-gold nel ciclo:
     delay negativo = l'animazione inizia a metà corsa → ogni parola
     si muove in modo indipendente, effetto naturale e non sincronizzato. */
  if (!prefersReducedMotion) {
    document.querySelectorAll('.text-gold').forEach(el => {
      el.style.animationDelay = -(Math.random() * 10).toFixed(2) + 's';
    });
  }

  /* ══════════════════════════════════════════════
   * REVEALS — ScrollTrigger batch
   * ══════════════════════════════════════════════ */
  function initReveals() {
    ScrollTrigger.batch('.reveal', {
      onEnter: batch => gsap.to(batch, {
        opacity: 1, y: 0,
        duration: 0.9, ease: 'power2.out', stagger: 0.1,
      }),
      start: 'top 87%',
      once: true,
    });
  }

  /* ══════════════════════════════════════════════
   * PARALLAX — immagini editoriali e benessere
   * ══════════════════════════════════════════════ */
  function initParallax() {
    document.querySelectorAll('.editorial__media img, .benessere__media img').forEach(img => {
      const section = img.closest('.editorial, .benessere');
      if (!section) return;
      gsap.fromTo(img,
        { yPercent: -6 },
        {
          yPercent: 6, ease: 'none',
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

  /* ══════════════════════════════════════════════
   * COUNT-UP
   * ══════════════════════════════════════════════ */
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
        trigger: el, start: 'top 82%', once: true,
        onEnter: () => gsap.to(obj, {
          val: target, duration: 1.8, ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString('it-IT') + suffix;
          },
        }),
      });
    });
  }

  function initCountersFallback() {
    document.querySelectorAll('[data-count-to]').forEach(el => {
      el.textContent = parseInt(el.dataset.countTo, 10).toLocaleString('it-IT') + (el.dataset.suffix || '');
    });
  }

  /* ══════════════════════════════════════════════
   * MOBILE NAV
   * ══════════════════════════════════════════════ */
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

  /* ══════════════════════════════════════════════
   * HEADER SCROLL
   * ══════════════════════════════════════════════ */
  const header = document.getElementById('site-header');
  function handleHeaderScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  handleHeaderScroll();
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  /* ══════════════════════════════════════════════
   * ACCORDION FAQ
   * ══════════════════════════════════════════════ */
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

  /* ══════════════════════════════════════════════
   * ACTIVE NAV LINK on scroll
   * ══════════════════════════════════════════════ */
  const navLinks = document.querySelectorAll('.main-nav__link');
  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = document.querySelector(`.main-nav__link[href="#${entry.target.id}"]`);
        if (link && entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ══════════════════════════════════════════════
   * BACK TO TOP
   * ══════════════════════════════════════════════ */
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
