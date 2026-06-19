(function() {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (navToggle && mobilePanel) {
        navToggle.addEventListener('click', function() {
            mobilePanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function(dot, dotIndex) {
        dot.addEventListener('click', function() {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function() {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    var filterRoot = document.querySelector('[data-filter-root]');

    if (filterRoot) {
        var input = filterRoot.querySelector('[data-filter-input]');
        var category = filterRoot.querySelector('[data-filter-category]');
        var year = filterRoot.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-title]'));
        var empty = filterRoot.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input && input.value);
            var categoryValue = normalize(category && category.value);
            var yearValue = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function(card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchCategory = !categoryValue || normalize(card.getAttribute('data-category')) === categoryValue;
                var matchYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                var shouldShow = matchKeyword && matchCategory && matchYear;

                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [input, category, year].forEach(function(control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }
})();
