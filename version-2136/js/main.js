(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");

    if (menuButton && menu) {
        menuButton.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        var setSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        };

        var nextSlide = function () {
            setSlide((current + 1) % slides.length);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                setSlide(index);
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(nextSlide, 5200);
            });
        });

        if (slides.length > 1) {
            timer = window.setInterval(nextSlide, 5200);
        }
    }

    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));

    scopes.forEach(function (scope) {
        var input = scope.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search]"));

        if (!input || cards.length === 0) {
            return;
        }

        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                var matched = keyword === "" || text.indexOf(keyword) !== -1;
                card.hidden = !matched;
            });
        });
    });
})();
