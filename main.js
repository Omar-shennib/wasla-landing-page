(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA = 'https://wa.me/218930777510';

  // Always open at the top: no restored scroll, no leftover #section in the URL.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  scrollTo(0, 0);

  // In-page links scroll smoothly without writing #section into the URL.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id === 'top' ? document.body : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (id === 'top') scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  // WhatsApp links carry a prefilled message per service.
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = WA + '?text=' + encodeURIComponent(a.dataset.wa);
  });

  // Language toggle with a quick crossfade.
  document.getElementById('langToggle').addEventListener('click', function () {
    document.body.classList.add('lang-fade');
    setTimeout(function () {
      var l = root.lang === 'ar' ? 'en' : 'ar';
      root.lang = l;
      root.dir = l === 'ar' ? 'rtl' : 'ltr';
      document.title = l === 'ar' ? 'وصلة للحلول التقنية' : 'Wasla Tech Solutions';
      try { localStorage.setItem('wasla-lang', l); } catch (e) {}
      document.body.classList.remove('lang-fade');
    }, reduce ? 0 : 220);
  });

  // Nav state, scroll progress, floating call button.
  var nav = document.querySelector('.nav');
  var bar = document.querySelector('.progress');
  var call = document.querySelector('.float-call');
  var contact = document.getElementById('contact');
  function onScroll() {
    var y = scrollY, max = root.scrollHeight - innerHeight;
    nav.classList.toggle('is-scrolled', y > 8);
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    call.classList.toggle('is-shown', y > innerHeight * 0.8 && contact.getBoundingClientRect().top > innerHeight * 0.7);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });

  // Active nav link.
  var links = document.querySelectorAll('.nav-links a');
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });

  // Count-up numbers.
  function countUp(el) {
    var to = +el.dataset.count;
    if (reduce) { el.textContent = to.toLocaleString('en-US'); return; }
    var t0 = performance.now(), dur = 1400;
    (function tick(t) {
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  // Chart bar stagger.
  document.querySelectorAll('.chart i').forEach(function (b, k) { b.style.setProperty('--i', k); });

  // Hero stage: scenes, tabs and headline word stay in sync.
  var stage = document.querySelector('.stage');
  var scenes = stage.querySelectorAll('.scene');
  var tabs = stage.querySelectorAll('[data-go]');
  var words = document.querySelectorAll('.rot-w');
  var DUR = 5500, cur = 0, timer;

  function go(n) {
    if (n === cur) return;
    words[cur].classList.remove('is-on');
    words[cur].classList.add('is-out');
    (function (w) { setTimeout(function () { w.classList.remove('is-out'); }, 700); })(words[cur]);
    scenes[cur].classList.remove('is-on');
    scenes[cur].classList.add('is-out');
    (function (s) { setTimeout(function () { if (!s.classList.contains('is-on')) s.classList.remove('is-out'); }, 650); })(scenes[cur]);
    tabs[cur].classList.remove('is-on');
    cur = n;
    words[cur].classList.add('is-on');
    scenes[cur].classList.remove('is-out');
    scenes[cur].classList.add('is-on');
    tabs[cur].classList.add('is-on');
    scenes[cur].querySelectorAll('[data-count]').forEach(countUp);
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (!reduce) timer = setTimeout(function () { go((cur + 1) % scenes.length); }, DUR);
  }
  tabs.forEach(function (t) {
    t.style.setProperty('--dur', DUR / 1000 + 's');
    t.addEventListener('click', function () { go(+t.dataset.go); });
  });
  schedule();

  // ERP case study: stacked screens, the chosen one shuffles to the front.
  var deck = document.querySelector('.deck');
  if (deck) {
    var cards = deck.querySelectorAll('.deck-card');
    var dtabs = document.querySelectorAll('[data-card]');
    var front = 0, deckTimer, hovering = false;
    function layout(n, animate) {
      var prev = front;
      front = n;
      cards.forEach(function (c, i) {
        c.style.setProperty('--k', (i - front + cards.length) % cards.length);
        c.classList.toggle('is-front', i === front);
      });
      dtabs.forEach(function (t, i) { t.classList.toggle('is-on', i === front); });
      if (animate && prev !== front && !reduce) {
        var out = cards[prev];
        out.classList.remove('is-leaving');
        void out.offsetWidth;
        out.classList.add('is-leaving');
      }
      clearTimeout(deckTimer);
      if (!reduce) deckTimer = setTimeout(function () { if (!hovering) layout((front + 1) % cards.length, true); else layout(front); }, 4500);
    }
    cards.forEach(function (c, i) { c.addEventListener('click', function () { layout(i, true); }); });
    dtabs.forEach(function (t, i) { t.addEventListener('click', function () { layout(i, true); }); });
    deck.addEventListener('pointerenter', function () { hovering = true; });
    deck.addEventListener('pointerleave', function () { hovering = false; });
    layout(0);
  }

  // Light up ERP tiles one after another.
  var tiles = document.querySelectorAll('.tiles > span:not(.core)');
  var lit = 0;
  if (tiles.length && !reduce) setInterval(function () {
    tiles.forEach(function (t, k) { t.classList.toggle('lit', k === lit); });
    lit = (lit + 1) % tiles.length;
  }, 900);

  // Pointer effects: spotlight on cards, tilt on screenshots.
  if (!reduce && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', e.clientX - r.left + 'px');
        el.style.setProperty('--my', e.clientY - r.top + 'px');
      });
    });
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
        el.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  // Ripple on button press.
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.btn, .pill');
    if (!b || reduce) return;
    var r = b.getBoundingClientRect(), s = document.createElement('span');
    s.className = 'ripple';
    s.style.left = e.clientX - r.left + 'px';
    s.style.top = e.clientY - r.top + 'px';
    b.appendChild(s);
    s.addEventListener('animationend', function () { s.remove(); });
  });

  // Real QR code that opens a WhatsApp chat with Wasla.
  if (window.qrcode) {
    var q = qrcode(0, 'M');
    q.addData(WA);
    q.make();
    var n = q.getModuleCount(), d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
    var svg = '<svg viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges"><path d="' + d + '" fill="#111"/></svg>';
    document.querySelectorAll('.qr-code').forEach(function (el) { el.innerHTML = svg; });
  }
})();
