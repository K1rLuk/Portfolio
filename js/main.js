/* Кирилл Лукьяненко — интерактив сайта. Без библиотек, с запасными вариантами для старых браузеров. */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var mq = function (q) { return w.matchMedia ? w.matchMedia(q) : { matches: false, addEventListener: function () {} }; };
  var reduce = mq('(prefers-reduced-motion: reduce)').matches;
  var canHover = mq('(hover: hover) and (pointer: fine)').matches;
  var EMAIL = 'kir.lukianenko@gmail.com';
  var TG = 'https://t.me/KirillLukianenko';

  var mem = {};
  function store(k, v) { if (v === undefined) return mem[k] || null; mem[k] = v; }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0'); }
  function onMQ(m, fn) { if (m.addEventListener) m.addEventListener('change', fn); else if (m.addListener) m.addListener(fn); }

  /* ---------- Тема ---------- */
  var meta = $('#metaTheme');
  function applyTheme(t) {
    root.classList.toggle('dark', t === 'dark');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#09090a' : '#f4f4f1');
  }
  var themeBtn = $('#themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', function (e) {
    var next = root.classList.contains('dark') ? 'light' : 'dark';
    store('theme', next);
    var r = themeBtn.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    root.style.setProperty('--tx', x + 'px'); root.style.setProperty('--ty', y + 'px');
    root.style.setProperty('--tr', Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 'px');
    if (d.startViewTransition && !reduce) d.startViewTransition(function () { applyTheme(next); });
    else applyTheme(next);
  });
  var sysDark = mq('(prefers-color-scheme: dark)');
  onMQ(sysDark, function (e) { var s = store('theme'); if (s !== 'dark' && s !== 'light') applyTheme(e.matches ? 'dark' : 'light'); });

  /* ---------- Мобильное меню ---------- */
  var burger = $('#burger'), mmenu = $('#mmenu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (burger) { burger.setAttribute('aria-expanded', open ? 'true' : 'false'); burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню'); }
    if (mmenu) mmenu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
  if (mmenu) mmenu.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  onMQ(mq('(min-width: 981px)'), function (e) { if (e.matches) setMenu(false); });

  /* ---------- Разбивка заголовков на слова ---------- */
  $$('[data-words]').forEach(function (el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var parts = ch.textContent.split(/([ \t\n\r]+)/), frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^[ \t\n\r]+$/.test(p)) { frag.appendChild(d.createTextNode(p)); return; }
            var s = d.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = p; frag.appendChild(s);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) {
          walk(ch);
        }
      });
    })(el);
  });

  /* ---------- Появление при прокрутке ---------- */
  var reveal = $$('.rv, [data-words]');
  if ('IntersectionObserver' in w && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    reveal.forEach(function (el) { io.observe(el); });
    // страховка: если что-то не сработало — показать всё
    w.addEventListener('load', function () { setTimeout(function () { $$('.rv:not(.in), [data-words]:not(.in)').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('in'); }); }, 1200); });
  } else reveal.forEach(function (el) { el.classList.add('in'); });

  /* ---------- Блик на стекле и магнитная кнопка ---------- */
  if (canHover && !reduce) {
    $$('[data-glass]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    $$('[data-magnet]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = 'translate(' + x + 'px,' + (y - 2) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Текст кнопок и ссылок меняется с размытием ---------- */
  if (canHover && !reduce) {
    $$('.btn, .nav a, .foot-row nav a').forEach(function (el) {
      if (el.children.length || !el.textContent.trim()) return;
      var t = el.textContent.trim();
      el.textContent = '';
      var r = d.createElement('span'); r.className = 'roll';
      var a1 = d.createElement('span'); a1.textContent = t;
      var a2 = d.createElement('span'); a2.textContent = t; a2.setAttribute('aria-hidden', 'true');
      r.appendChild(a1); r.appendChild(a2); el.appendChild(r);
    });
  }

  /* ---------- Шапка: подсветка раздела, скрытие при прокрутке, панель ---------- */
  var head = $('#head'), nav = $('#nav'), pill = nav ? $('.nav-pill', nav) : null;
  var links = nav ? $$('a', nav) : [];
  var dock = $('#dock'), contact = $('#contact'), hero = $('#top');
  function movePill(a) {
    if (!pill) return;
    if (!a) { pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  }
  var current = null;
  function spy() {
    var y = w.scrollY || w.pageYOffset, mid = y + innerHeight * 0.35, found = null;
    links.forEach(function (a) {
      var s = $(a.getAttribute('href'));
      if (s && s.offsetTop <= mid && s.offsetTop + s.offsetHeight > mid) found = a;
    });
    if (found !== current) {
      links.forEach(function (a) { a.classList.toggle('on', a === found); });
      current = found; movePill(found);
    }
  }
  links.forEach(function (a) { a.addEventListener('mouseenter', function () { movePill(a); }); });
  if (nav) nav.addEventListener('mouseleave', function () { movePill(current); });

  var lastY = 0, ticking = false;
  function onScroll() {
    var y = w.scrollY || w.pageYOffset;
    if (head && !root.classList.contains('menu-open')) {
      if (y > 480 && y > lastY + 6) head.classList.add('hide');
      else if (y < lastY - 6 || y < 480) head.classList.remove('hide');
    }
    lastY = y;
    if (dock && hero && contact) {
      var cr = contact.getBoundingClientRect();
      dock.classList.toggle('show', y > hero.offsetHeight * 0.6 && !(cr.top < innerHeight * 0.9 && cr.bottom > 0));
    }
    spy();
    ticking = false;
  }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; (w.requestAnimationFrame || setTimeout)(onScroll); } }, { passive: true });
  w.addEventListener('resize', function () { current = null; onScroll(); setPan(); });

  /* ---------- Работы: плавная загрузка картинок и прокрутка страницы в карточке ---------- */
  var shots = $$('[data-pan]');
  function setPan() {
    shots.forEach(function (s) {
      var img = $('img', s); if (!img) return;
      var D = img.offsetHeight - s.clientHeight;
      s.style.setProperty('--pan', (D > 0 ? -D : 0) + 'px');
    });
  }
  shots.forEach(function (s) {
    var img = $('img', s); if (!img) return;
    function ok() { img.classList.add('ok'); setPan(); }
    if (img.complete && img.naturalWidth) ok(); else { img.addEventListener('load', ok); img.addEventListener('error', function () { img.classList.add('ok'); }); }
  });
  if (!canHover && 'IntersectionObserver' in w && !reduce) {
    var pio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('go', e.isIntersecting); });
    }, { threshold: 0.4 });
    shots.forEach(function (s) { pio.observe(s); });
  }

  /* ---------- Калькулятор ---------- */
  var TYPES = {
    landing: { name: 'Лендинг', price: 6999, term: '5–10 дней' },
    corp: { name: 'Сайт компании', price: 14999, term: '2–4 недели' },
    shop: { name: 'Интернет-магазин', price: 29999, term: 'от 4 недель' }
  };
  var form = $('#calcForm'), sumEl = $('#calcSum'), termEl = $('#calcTerm'), preEl = $('#calcPre'), mailBtn = $('#calcMail'), copyBtn = $('#calcCopy'), copied = $('#copied');
  var shown = 6999, animRAF = null;
  function calcState() {
    var type = (form.querySelector('input[name="type"]:checked') || {}).value || 'landing';
    var T = TYPES[type], sum = T.price, extras = [];
    var admin = form.querySelector('input[value="admin"]'), note = form.querySelector('[data-admin-note]');
    var included = type !== 'landing';
    if (admin) {
      admin.disabled = included;
      if (included) admin.checked = false;
      if (note) note.textContent = included ? 'уже входит в этот тип сайта' : 'меняете тексты и фото сами';
    }
    $$('input[name="add"]:checked', form).forEach(function (i) { sum += +i.getAttribute('data-price'); extras.push(i.getAttribute('data-name')); });
    return { type: type, T: T, sum: sum, extras: extras };
  }
  function message(st) {
    return 'Здравствуйте, Кирилл! Посчитал(а) стоимость сайта на калькуляторе.\n\n' +
      'Тип: ' + st.T.name + '\n' +
      (st.extras.length ? 'Дополнительно: ' + st.extras.join(', ') + '\n' : '') +
      'Ориентир: от ' + fmt(st.sum).replace(/\u00A0/g, ' ') + ' ₽, срок ' + st.T.term + '\n\n' +
      'О задаче: ';
  }
  function animateTo(v) {
    cancelAnimationFrame(animRAF);
    if (reduce) { shown = v; sumEl.textContent = fmt(v); return; }
    var from = shown, t0 = null;
    if (from !== v) { sumEl.classList.remove('blink'); void sumEl.offsetWidth; sumEl.classList.add('blink'); }
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 650); k = 1 - Math.pow(1 - k, 4);
      shown = from + (v - from) * k; sumEl.textContent = fmt(shown);
      if (k < 1) animRAF = requestAnimationFrame(step); else shown = v;
    }
    animRAF = requestAnimationFrame(step);
  }
  function updateCalc() {
    if (!form) return;
    var st = calcState();
    animateTo(st.sum);
    if (termEl) termEl.textContent = st.T.term;
    if (preEl) preEl.textContent = fmt(Math.ceil(st.sum / 2 / 100) * 100) + ' ₽';
    if (mailBtn) mailBtn.setAttribute('href', 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Расчёт сайта: ' + st.T.name) + '&body=' + encodeURIComponent(message(st)));
  }
  if (form) { form.addEventListener('change', updateCalc); updateCalc(); }
  $$('[data-type]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = form && form.querySelector('input[name="type"][value="' + a.getAttribute('data-type') + '"]');
      if (r) { r.checked = true; updateCalc(); }
    });
  });
  function copyText(t, done) {
    if (navigator.clipboard && w.isSecureContext) { navigator.clipboard.writeText(t).then(done, function () { fallback(); }); }
    else fallback();
    function fallback() {
      var ta = d.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; d.body.appendChild(ta); ta.select();
      try { d.execCommand('copy'); } catch (e) {} d.body.removeChild(ta); done();
    }
  }
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var st = calcState();
    copyText(message(st), function () {
      if (copied) { copied.classList.add('on'); clearTimeout(copyBtn._t); copyBtn._t = setTimeout(function () { copied.classList.remove('on'); }, 2600); }
    });
    // окно открываем сразу по клику, иначе браузер его заблокирует
    var win = null;
    try { win = w.open(TG, '_blank'); } catch (e) {}
    if (win) { try { win.opener = null; } catch (e) {} }
    else setTimeout(function () { location.href = TG; }, 700);
  });

  function setBtnText(el, t) {
    var r = el.querySelectorAll('.roll > span');
    if (r.length) { r[0].textContent = t; r[1].textContent = t; } else el.textContent = t;
  }

  /* ---------- FAQ ---------- */
  $$('.q').forEach(function (q) {
    var b = $('button', q);
    b.addEventListener('click', function () {
      var open = !q.classList.contains('open');
      $$('.q.open').forEach(function (o) { if (o !== q) { o.classList.remove('open'); $('button', o).setAttribute('aria-expanded', 'false'); } });
      q.classList.toggle('open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- Короткая заявка → письмо ---------- */
  var bf = $('#briefForm'), brief = $('#brief'), body = '';
  if (bf) {
    bf.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#bName'), con = $('#bContact'), task = $('#bTask'), ok = true;
      [[name, function (v) { return v.trim().length > 1; }], [con, function (v) { v = v.trim(); return /@.+\./.test(v) || v.replace(/\D/g, '').length >= 10 || /^@?[A-Za-z0-9_]{4,}$/.test(v); }]].forEach(function (p) {
        var good = p[1](p[0].value); p[0].parentNode.classList.toggle('bad', !good); if (!good) ok = false;
      });
      if (!ok) { var b = $('.fld.bad input', bf); if (b) b.focus(); return; }
      body = 'Здравствуйте, Кирилл!\n\nМеня зовут: ' + name.value.trim() + '\nКак со мной связаться: ' + con.value.trim() + '\n\nЗадача: ' + (task.value.trim() || 'расскажу подробнее в ответ') + '\n';
      location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Заявка на сайт: ' + name.value.trim()) + '&body=' + encodeURIComponent(body);
      if (brief) brief.classList.add('sent');
      var cb = $('#briefCopy'); if (cb) cb.focus({ preventScroll: true });
    });
    var bc = $('#briefCopy'), bb = $('#briefBack');
    if (bc) bc.addEventListener('click', function () {
      copyText(body, function () {
        setBtnText(bc, 'Заявка скопирована');
        clearTimeout(bc._t); bc._t = setTimeout(function () { setBtnText(bc, 'Скопировать заявку'); }, 2600);
      });
    });
    if (bb) bb.addEventListener('click', function () { if (brief) brief.classList.remove('sent'); var n = $('#bName'); if (n) n.focus(); });
    $$('input,textarea', bf).forEach(function (i) { i.addEventListener('input', function () { i.parentNode.classList.remove('bad'); }); });
  }

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { current = null; spy(); setPan(); });
  w.addEventListener('load', setPan);
  onScroll();
})();
