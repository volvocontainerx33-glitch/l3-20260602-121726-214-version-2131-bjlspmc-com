(function () {
  var menuButton = document.querySelector('.menu-btn');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === activeIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5600);
  }

  var quickInput = document.querySelector('[data-quick-search]');
  var quickButton = document.querySelector('[data-quick-submit]');
  if (quickInput && quickButton) {
    quickButton.addEventListener('click', function () {
      var value = quickInput.value.trim();
      window.location.href = './search.html' + (value ? '?q=' + encodeURIComponent(value) : '');
    });
    quickInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        quickButton.click();
      }
    });
  }

  var searchInput = document.querySelector('[data-filter-input]');
  var regionFilter = document.querySelector('[data-region-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var noResults = document.querySelector('.no-results');

  function normalized(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var query = normalized(searchInput ? searchInput.value : '');
    var region = regionFilter ? regionFilter.value : '';
    var year = yearFilter ? yearFilter.value : '';
    var shown = 0;

    cards.forEach(function (card) {
      var text = normalized([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' '));
      var okQuery = !query || text.indexOf(query) !== -1;
      var okRegion = !region || card.getAttribute('data-region') === region;
      var okYear = !year || card.getAttribute('data-year') === year;
      var visible = okQuery && okRegion && okYear;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });

    if (noResults) {
      noResults.style.display = shown ? 'none' : 'block';
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
    }
    searchInput.addEventListener('input', applyFilters);
  }
  if (regionFilter) {
    regionFilter.addEventListener('change', applyFilters);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }
  applyFilters();
})();
