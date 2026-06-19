(function () {
  function closestScope(element) {
    return element.closest('.page-hero') && element.closest('main') ? element.closest('main') : document;
  }

  function initNavigation() {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      header.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }
    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function getFilterValue(scope, selector) {
    var control = scope.querySelector(selector);
    return control ? control.value.trim() : '';
  }

  function applyFilters(scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    if (!cards.length) {
      return;
    }
    var text = getFilterValue(scope, '[data-filter="text"]').toLowerCase();
    var category = getFilterValue(scope, '[data-filter="category"]');
    var year = getFilterValue(scope, '[data-filter="year"]');
    var type = getFilterValue(scope, '[data-filter="type"]');
    var region = getFilterValue(scope, '[data-filter="region"]');
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var ok = true;
      if (text && haystack.indexOf(text) === -1) {
        ok = false;
      }
      if (category && card.getAttribute('data-category') !== category) {
        ok = false;
      }
      if (year && card.getAttribute('data-year') !== year) {
        ok = false;
      }
      if (type && card.getAttribute('data-type') !== type) {
        ok = false;
      }
      if (region && card.getAttribute('data-region') !== region) {
        ok = false;
      }
      card.hidden = !ok;
      if (ok) {
        visible += 1;
      }
    });
    var empty = scope.querySelector('.empty-state');
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function initFilters() {
    var url = new URL(window.location.href);
    var query = url.searchParams.get('q') || '';
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.js-filter-input, .js-filter-select'));
    inputs.forEach(function (control) {
      if (control.getAttribute('data-filter') === 'text' && query && !control.value) {
        control.value = query;
      }
      var scope = closestScope(control);
      control.addEventListener('input', function () {
        applyFilters(scope);
      });
      control.addEventListener('change', function () {
        applyFilters(scope);
      });
      applyFilters(scope);
    });
  }

  function playVideo(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream') || '';
    if (!video || !stream) {
      return;
    }
    player.classList.add('is-playing');
    if (cover) {
      cover.setAttribute('aria-hidden', 'true');
    }
    if (video.dataset.ready === '1') {
      video.play().catch(function () {});
      return;
    }
    video.dataset.ready = '1';
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      video._hlsInstance = hls;
      return;
    }
    video.src = stream;
    video.addEventListener('loadedmetadata', function () {
      video.play().catch(function () {});
    }, { once: true });
    video.load();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
    players.forEach(function (player) {
      var button = player.querySelector('.player-button');
      var cover = player.querySelector('.player-cover');
      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo(player);
        });
      }
      if (cover) {
        cover.addEventListener('click', function () {
          playVideo(player);
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
