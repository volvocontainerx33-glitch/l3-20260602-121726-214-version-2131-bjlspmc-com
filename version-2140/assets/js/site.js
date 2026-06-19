
(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      menuToggle.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open');
    });
  }

  const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const heroTabs = Array.from(document.querySelectorAll('[data-hero-tab]'));
  let heroIndex = 0;
  let heroTimer = null;

  function showHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });
    heroTabs.forEach(function (tab, tabIndex) {
      tab.classList.toggle('is-active', tabIndex === heroIndex);
    });
  }

  function startHeroTimer() {
    if (heroSlides.length < 2) {
      return;
    }
    clearInterval(heroTimer);
    heroTimer = setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5200);
  }

  heroTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const nextIndex = Number(tab.getAttribute('data-hero-tab')) || 0;
      showHeroSlide(nextIndex);
      startHeroTimer();
    });
  });

  showHeroSlide(0);
  startHeroTimer();

  const searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    const input = searchPage.querySelector('[data-search-input]');
    const categoryFilter = searchPage.querySelector('[data-category-filter]');
    const yearFilter = searchPage.querySelector('[data-year-filter]');
    const clearButton = searchPage.querySelector('[data-clear-search]');
    const countBox = searchPage.querySelector('[data-search-count]');
    const cards = Array.from(searchPage.querySelectorAll('[data-movie-card]'));
    const params = new URLSearchParams(window.location.search);
    const initialKeyword = params.get('q') || '';

    if (input) {
      input.value = initialKeyword;
    }

    function normal(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applySearch() {
      const keyword = normal(input ? input.value : '');
      const category = categoryFilter ? categoryFilter.value : '';
      const year = yearFilter ? yearFilter.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normal([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchCategory = !category || card.getAttribute('data-category') === category;
        const matchYear = !year || card.getAttribute('data-year') === year;
        const matched = matchKeyword && matchCategory && matchYear;

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (countBox) {
        countBox.textContent = visible ? '匹配影片：' + visible : '没有匹配影片';
      }
    }

    [input, categoryFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (categoryFilter) {
          categoryFilter.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        applySearch();
      });
    }

    applySearch();
  }
})();
