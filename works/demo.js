/* Общий скрипт демо-сайтов: меню, появление блоков, форма без отправки данных */
(function () {
  var d = document, root = d.documentElement;
  root.classList.add('js');

  // Мобильное меню
  var burger = d.querySelector('[data-burger]'), menu = d.querySelector('[data-menu]');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = root.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { root.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Шапка при скролле
  var head = d.querySelector('[data-head]');
  function onScroll() { if (head) head.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Появление
  var items = d.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  // Форма-демо: ничего не отправляет, показывает результат
  d.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      f.querySelectorAll('[required]').forEach(function (i) {
        var bad = !i.value.trim() || (i.type === 'tel' && i.value.replace(/\D/g, '').length < 10);
        i.classList.toggle('bad', bad); if (bad) ok = false;
      });
      if (!ok) return;
      f.classList.add('sent');
    });
    f.querySelectorAll('input,select,textarea').forEach(function (i) {
      i.addEventListener('input', function () { i.classList.remove('bad'); });
    });
  });

  var y = d.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
