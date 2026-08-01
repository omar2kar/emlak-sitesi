/* ==========================================================================
   NLK EMLAK — Motion & interactions
   STEP 3 · Entrance choreography (GSAP) — matched to YOUR current class names.

   Selectors this file expects in your HTML:
     .hero-image-reveal   (wrapper that lifts up to reveal the image)
     .hero-img            (the <img> — subtle scale on entry)
     .hero-title .text-line > *   (the block inside each masked title line)
     .hero-desc  .hero-buttons
     .search-box-container  .search-box
     .section-header
     .properties-grid > .property-card
     .features-grid   > .feature-card
   If any of these names differ in your HTML, send me index.html and I'll adjust.

   Fail-safes:
     • prefers-reduced-motion → no hidden states, page fully visible, search shown.
     • GSAP missing           → strip guard class, reveal everything incl. search.
   ========================================================================== */

(function () {
  'use strict';

  var html = document.documentElement;

  // Your CSS hides .search-box-container unconditionally, so we must reveal it
  // whenever the entrance animation is NOT going to run.
  function showSearch() {
    Array.prototype.forEach.call(document.querySelectorAll('.search-box-container'), function (el) {
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
    });
  }

  // 1. Reduced motion — everything already visible; just reveal the search box.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    html.classList.remove('is-animating');
    showSearch();
    return;
  }

  // 2. GSAP required. If the CDN failed, reveal all and bail.
  if (!window.gsap) {
    html.classList.remove('is-animating');
    showSearch();
    return;
  }

  var gsap = window.gsap;
  var ST = window.ScrollTrigger || null;
  if (ST) gsap.registerPlugin(ST);
  gsap.config({ nullTargetWarn: false });

  var qa = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* -------- Hero entrance: one orchestrated timeline, played once -------- */
  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.hero-image-reveal', { yPercent: 100, y: 0 }, { yPercent: 0, y: 0, duration: 1.3, ease: 'expo.out' }, 0)
      .fromTo('.hero-img',          { scale: 1.16 },         { scale: 1,           duration: 1.6, ease: 'expo.out' }, 0)
      .fromTo('.hero-title .text-line > *', { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 1.0, stagger: 0.1, ease: 'power4.out' }, 0.35)
      .fromTo('.hero-desc',    { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, 0.85)
      .fromTo('.hero-buttons', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, 1.0)
      // search box reveals last (opacity + interactivity on the container, lift on the card)
      .to('.search-box-container', { opacity: 1, pointerEvents: 'auto', duration: 0.9 }, 1.2)
      .fromTo('.search-box', { y: 40 }, { y: 0, duration: 1.0 }, 1.2);

    return tl;
  }

  /* -------- Section-head reveals (batched) -------- */
  function initSectionReveals() {
    var els = qa('.section-header');
    if (!els.length) return;
    if (!ST) { gsap.set(els, { opacity: 1, y: 0, clearProps: 'transform' }); return; }

    ST.batch(els, {
      start: 'top 85%',
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, overwrite: true });
      }
    });
  }

  /* -------- Card staggers: property + feature cards enter one by one -------- */
  function initStaggers() {
    [['.properties-grid', '.property-card'], ['.features-grid', '.feature-card']].forEach(function (pair) {
      qa(pair[0]).forEach(function (group) {
        var items = qa(pair[1], group);
        if (!items.length) return;

        if (!ST) { gsap.set(items, { opacity: 1, y: 0, clearProps: 'transform' }); return; }

        gsap.fromTo(items,
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
            stagger: 0.12, immediateRender: false, clearProps: 'transform',
            scrollTrigger: { trigger: group, start: 'top 80%' }
          }
        );
      });
    });
  }

  /* -------- Hero scroll-out + image parallax (STEP 4) -------- */
  function initHeroScroll() {
    if (!ST) return;

    // Hero content lifts up and fades as you scroll away.
    gsap.fromTo('.hero-content',
      { yPercent: 0, opacity: 1 },
      { yPercent: -30, opacity: 0, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // The image block drifts up slower than the text — parallax.
    gsap.fromTo('.hero-image-wrapper',
      { yPercent: 0 },
      { yPercent: -8, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Subtle push-in on the photo for depth.
    gsap.fromTo('.hero-img',
      { scale: 1 },
      { scale: 1.12, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* -------- Boot -------- */
  initSectionReveals();
  initStaggers();
  initHeroScroll();

  // Wait for the display font so the masked line reveal uses final metrics,
  // but never block longer than 0.8s.
  var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  Promise.race([
    fontsReady,
    new Promise(function (resolve) { setTimeout(resolve, 800); })
  ]).then(heroIntro);

  if (ST) window.addEventListener('load', function () { ST.refresh(); });
})();