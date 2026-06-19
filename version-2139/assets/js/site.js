(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function bindMenu() {
    var button = qs('.menu-button');
    var nav = qs('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.hasAttribute('hidden');
      if (open) {
        nav.removeAttribute('hidden');
      } else {
        nav.setAttribute('hidden', '');
      }
      button.setAttribute('aria-expanded', String(open));
    });
  }

  function bindHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function renderSearch(panel, keyword) {
    var list = window.SITE_MOVIES || [];
    var query = normalize(keyword);
    if (!panel || !query) {
      if (panel) {
        panel.setAttribute('hidden', '');
        panel.innerHTML = '';
      }
      return;
    }
    var results = list.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags,
        movie.summary
      ].join(' '));
      return haystack.indexOf(query) !== -1;
    }).slice(0, 12);
    if (!results.length) {
      panel.innerHTML = '<div class="search-empty">未找到匹配内容</div>';
      panel.removeAttribute('hidden');
      return;
    }
    panel.innerHTML = results.map(function (movie) {
      return [
        '<a class="search-item" href="' + movie.url + '">',
        '<img src="' + movie.poster + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '<span>',
        '<h3>' + movie.title + '</h3>',
        '<p>' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</p>',
        '<p>' + movie.summary + '</p>',
        '</span>',
        '</a>'
      ].join('');
    }).join('');
    panel.removeAttribute('hidden');
  }

  function bindGlobalSearch(inputId, panelId) {
    var input = qs('#' + inputId);
    var panel = qs('#' + panelId);
    if (!input || !panel) {
      return;
    }
    input.addEventListener('input', function () {
      renderSearch(panel, input.value);
    });
    document.addEventListener('click', function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.setAttribute('hidden', '');
      }
    });
  }

  function bindPageFilter() {
    var box = qs('[data-filter-box]');
    if (!box) {
      return;
    }
    var input = qs('.page-filter', box);
    var year = qs('.page-filter-year', box);
    var type = qs('.page-filter-type', box);
    var cards = qsa('[data-card]');
    function apply() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region')
        ].join(' '));
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && normalize(card.getAttribute('data-year')).indexOf(y) === -1) {
          ok = false;
        }
        if (t && normalize(card.getAttribute('data-type')).indexOf(t) === -1) {
          ok = false;
        }
        card.hidden = !ok;
      });
    }
    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  bindMenu();
  bindHero();
  bindGlobalSearch('globalSearch', 'globalSearchPanel');
  bindGlobalSearch('heroSearch', 'heroSearchPanel');
  bindPageFilter();
})();
