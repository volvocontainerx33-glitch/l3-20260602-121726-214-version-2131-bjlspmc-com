document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = toggle.classList.toggle("is-open");
      panel.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var tabs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-tab]"));
    var current = 0;
    var timer = null;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      tabs.forEach(function (tab, tabIndex) {
        tab.classList.toggle("is-active", tabIndex === current);
      });
    };
    var start = function () {
      if (timer || slides.length < 2) {
        return;
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    };
    var stop = function () {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        stop();
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var empty = scope.querySelector("[data-empty]");
    var apply = function () {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute("data-text") || "";
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesSelects = selects.every(function (select) {
          var key = select.getAttribute("data-filter-select");
          var value = select.value;
          return !value || card.getAttribute("data-" + key) === value;
        });
        var showCard = matchesQuery && matchesSelects;
        card.style.display = showCard ? "" : "none";
        if (showCard) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };
    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
  });
});

function initMoviePlayer(streamUrl) {
  document.addEventListener("DOMContentLoaded", function () {
    var holder = document.querySelector(".player-box");
    if (!holder) {
      return;
    }
    var video = holder.querySelector("video");
    var layer = holder.querySelector(".play-layer");
    var ready = false;
    var mount = function () {
      if (ready || !video) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        holder.hlsInstance = hls;
      } else {
        video.src = streamUrl;
      }
    };
    var start = function () {
      mount();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var playTask = video.play();
      if (playTask && playTask.catch) {
        playTask.catch(function () {});
      }
    };
    if (layer) {
      layer.addEventListener("click", start);
      layer.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          start();
        }
      });
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (layer) {
          layer.classList.add("is-hidden");
        }
      });
    }
  });
}
