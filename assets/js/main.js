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
     Portfolio chatbot — browser UI only; the API key stays server-side
     --------------------------------------------------------- */
  var chatToggle = $('#chatToggle');
  var chatPanel = $('#chatPanel');
  var chatClose = $('#chatClose');
  var chatMessages = $('#chatMessages');
  var chatSuggestions = $('#chatSuggestions');
  var chatForm = $('#chatForm');
  var chatInput = $('#chatInput');
  var chatSend = $('#chatSend');
  var chatStatus = $('#chatStatus');
  var chatHistory = [];
  var chatBusy = false;

  function setChatOpen(open) {
    if (!chatPanel || !chatToggle) return;
    chatPanel.hidden = !open;
    chatToggle.setAttribute('aria-expanded', String(open));
    chatToggle.querySelector('span').textContent = open ? 'Close AI' : 'Ask my AI';
    if (open && chatInput) window.setTimeout(function () { chatInput.focus(); }, 50);
    if (!open) chatToggle.focus();
  }

  function scrollChatToEnd() {
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendChatMessage(role, text, sources) {
    if (!chatMessages) return null;

    var item = document.createElement('div');
    item.className = 'chatmsg chatmsg--' + role;

    if (role === 'assistant') {
      var avatar = document.createElement('span');
      avatar.className = 'chatmsg__avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = 'AI';
      item.appendChild(avatar);
    }

    var bubble = document.createElement('div');
    bubble.className = 'chatmsg__bubble';
    bubble.textContent = text;

    if (role === 'assistant' && Array.isArray(sources) && sources.length) {
      var sourceList = document.createElement('div');
      sourceList.className = 'chatmsg__sources';

      sources.slice(0, 3).forEach(function (source) {
        if (!source || !/^#[a-z][a-z0-9-]*$/i.test(source.href || '')) return;
        var link = document.createElement('a');
        link.href = source.href;
        link.textContent = source.section || source.title || 'Portfolio section';
        link.addEventListener('click', function () { setChatOpen(false); });
        sourceList.appendChild(link);
      });

      if (sourceList.children.length) bubble.appendChild(sourceList);
    }

    item.appendChild(bubble);
    chatMessages.appendChild(item);
    scrollChatToEnd();
    return item;
  }

  function appendThinkingMessage() {
    if (!chatMessages) return null;
    var item = document.createElement('div');
    item.className = 'chatmsg chatmsg--assistant chatmsg--thinking';
    item.setAttribute('aria-label', 'Assistant is thinking');
    item.innerHTML = '<span class="chatmsg__avatar" aria-hidden="true">AI</span><div class="chatmsg__bubble"><i></i><i></i><i></i></div>';
    chatMessages.appendChild(item);
    scrollChatToEnd();
    return item;
  }

  function setChatBusy(busy) {
    chatBusy = busy;
    if (chatInput) chatInput.disabled = busy;
    if (chatSend) chatSend.disabled = busy;
    if (chatSuggestions) {
      $$('button', chatSuggestions).forEach(function (button) { button.disabled = busy; });
    }
    if (chatStatus) {
      chatStatus.textContent = busy
        ? 'Searching the portfolio…'
        : 'AI can make mistakes. Verify important details using the portfolio links.';
    }
  }

  async function askPortfolio(question) {
    var cleanQuestion = String(question || '').trim();
    if (!cleanQuestion || chatBusy) return;

    appendChatMessage('user', cleanQuestion);
    if (chatInput) chatInput.value = '';
    setChatBusy(true);
    var thinking = appendThinkingMessage();
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 30000);

    try {
      var response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanQuestion, history: chatHistory.slice(-6) }),
        signal: controller.signal
      });
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(payload.error || 'The assistant is unavailable right now.');

      if (thinking) thinking.remove();
      appendChatMessage('assistant', payload.answer, payload.sources);
      chatHistory.push(
        { role: 'user', content: cleanQuestion },
        { role: 'assistant', content: payload.answer }
      );
      chatHistory = chatHistory.slice(-6);
    } catch (error) {
      if (thinking) thinking.remove();
      var message = error.name === 'AbortError'
        ? 'The assistant took too long to respond. Please try again.'
        : error.message || 'The assistant is unavailable right now.';
      appendChatMessage('assistant', message);
    } finally {
      window.clearTimeout(timeout);
      setChatBusy(false);
      if (chatInput) chatInput.focus();
    }
  }

  if (chatToggle && chatPanel) {
    chatToggle.addEventListener('click', function () {
      setChatOpen(chatPanel.hidden);
    });
  }
  if (chatClose) chatClose.addEventListener('click', function () { setChatOpen(false); });
  if (chatForm) {
    chatForm.addEventListener('submit', function (event) {
      event.preventDefault();
      askPortfolio(chatInput && chatInput.value);
    });
  }
  if (chatSuggestions) {
    $$('[data-chat-question]', chatSuggestions).forEach(function (button) {
      button.addEventListener('click', function () { askPortfolio(button.dataset.chatQuestion); });
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && chatPanel && !chatPanel.hidden) setChatOpen(false);
  });

  /* ---------------------------------------------------------
     Footer year
     --------------------------------------------------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
