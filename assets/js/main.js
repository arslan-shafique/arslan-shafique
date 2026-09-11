/* =========================================================
   Arslan Shafique — portfolio behaviour
   No dependencies. Everything degrades gracefully.
   ========================================================= */
(function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Theme — persisted, falls back to OS preference
     --------------------------------------------------------- */
  var root = document.documentElement;
  var themeBtn = $('#themeToggle');

  function readStoredTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }
  function storeTheme(v) {
    try { localStorage.setItem('theme', v); } catch (e) { /* private mode */ }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeBtn) {
      themeBtn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
  }

  var stored = readStoredTheme();
  if (stored === 'light' || stored === 'dark') {
    applyTheme(stored);
  } else {
    applyTheme(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      storeTheme(next);
    });
  }

  /* ---------------------------------------------------------
     Nav — stuck state, mobile menu, scroll spy
     --------------------------------------------------------- */
  var nav = $('#nav');
  var burger = $('#burger');
  var navLinks = $('#navLinks');

  function onScroll() {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function closeMenu() {
    if (!burger || !navLinks) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    navLinks.classList.remove('is-open');
    if (nav) nav.classList.remove('is-menu-open');
  }

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      navLinks.classList.toggle('is-open', !open);
      if (nav) nav.classList.toggle('is-menu-open', !open);
    });

    $$('a', navLinks).forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // scroll spy
  var sections = $$('main section[id]');
  var linkFor = {};
  $$('#navLinks a[href^="#"]').forEach(function (a) {
    linkFor[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          $$('#navLinks a').forEach(function (a) { a.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------- */
  var revealables = $$('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // stagger siblings slightly so grids cascade instead of popping
        setTimeout(function () { el.classList.add('is-in'); }, Math.min(i * 70, 280));
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------------------------------------------------------
     Hero typewriter
     --------------------------------------------------------- */
  var typer = $('#typer');
  var phrases = [
    'AI Engineer',
    'LLM & RAG Developer',
    'AIoT Systems Builder',
    'Python & FastAPI Backend'
  ];

  if (typer) {
    if (reduceMotion) {
      typer.textContent = phrases[0];
    } else {
      var pi = 0, ci = 0, deleting = false;

      (function tick() {
        var word = phrases[pi];
        ci += deleting ? -1 : 1;
        typer.textContent = word.slice(0, ci);

        var delay = deleting ? 45 : 85;

        if (!deleting && ci === word.length) {
          deleting = true;
          delay = 1800;
        } else if (deleting && ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          delay = 320;
        }

        setTimeout(tick, delay);
      })();
    }
  }

  /* ---------------------------------------------------------
     Project filters
     --------------------------------------------------------- */
  var filters = $$('.filter');
  var cards = $$('#pgrid .pcardx');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var want = btn.dataset.filter;

      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });

      cards.forEach(function (card) {
        var cats = (card.dataset.cat || '').split(/\s+/);
        var show = want === 'all' || cats.indexOf(want) !== -1;
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ---------------------------------------------------------
     Lightbox for freelance gallery
     --------------------------------------------------------- */
  var lb = $('#lb');
  var lbImg = $('#lbImg');
  var lbCap = $('#lbCap');
  var lbClose = $('#lbClose');
  var lastFocused = null;

  function openLb(fig) {
    if (!lb) return;
    var img = $('img', fig);
    var title = $('.gal__t', fig);
    var sub = $('.gal__s', fig);

    lastFocused = document.activeElement;
    lbImg.src = fig.dataset.src || img.src;
    lbImg.alt = img ? img.alt : '';
    lbCap.textContent = [title && title.textContent, sub && sub.textContent]
      .filter(Boolean).join(' — ');

    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  }

  function closeLb() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  $$('.gal__item').forEach(function (fig) {
    fig.addEventListener('click', function () { openLb(fig); });
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLb(fig);
      }
    });
  });

  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLb();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLb();
  });

  /* ---------------------------------------------------------
     Contact form → mailto (no backend on a static host)
     --------------------------------------------------------- */
  var form = $('#cform');
  var formErr = $('#cformErr');

  function showErr(msg) {
    if (!formErr) return;
    formErr.textContent = msg;
    formErr.hidden = !msg;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = $('#f-name').value.trim();
      var email = $('#f-email').value.trim();
      var message = $('#f-message').value.trim();

      if (!name || !email || !message) {
        showErr('Please fill in your name, email and a message.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showErr('That email address does not look right.');
        return;
      }

      showErr('');

      var subject = 'Portfolio enquiry from ' + name;
      var body = message + '\n\n—\n' + name + '\n' + email;

      window.location.href =
        'mailto:arslan.shafique253@gmail.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  }

  /* ---------------------------------------------------------
     Footer year
     --------------------------------------------------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
