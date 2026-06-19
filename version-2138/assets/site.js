(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalized(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalized(filterInputs.map(function (input) {
      return input.value;
    }).join(' '));

    var activeFilters = {};

    filterSelects.forEach(function (select) {
      activeFilters[select.getAttribute('data-filter')] = normalized(select.value);
    });

    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = normalized([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category')
      ].join(' '));

      var matchKeyword = !keyword || text.indexOf(keyword) >= 0;
      var matchYear = !activeFilters.year || normalized(card.getAttribute('data-year')).indexOf(activeFilters.year) >= 0;
      var matchCategory = !activeFilters.category || normalized(card.getAttribute('data-category')) === activeFilters.category;
      var visible = matchKeyword && matchYear && matchCategory;

      card.classList.toggle('hidden-card', !visible);

      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visibleCount === 0);
    }
  }

  filterInputs.concat(filterSelects).forEach(function (element) {
    element.addEventListener('input', applyFilters);
    element.addEventListener('change', applyFilters);
  });

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var message = shell.querySelector('[data-player-message]');
    var stream = video ? video.getAttribute('data-stream') : '';

    if (!video || !stream) {
      if (message) {
        message.textContent = '播放暂不可用';
      }
      return;
    }

    shell.classList.add('playing');

    if (video.getAttribute('data-ready') !== 'yes') {
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsPlayer = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (message) {
        message.textContent = '播放暂不可用';
      }
      video.setAttribute('data-ready', 'yes');
    }

    var playRequest = video.play();

    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {
        if (message) {
          message.textContent = '点击播放按钮继续观看';
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var button = shell.querySelector('[data-play-button]');
    var video = shell.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer(shell);
        } else {
          video.pause();
          shell.classList.remove('playing');
        }
      });
    }
  });
})();
