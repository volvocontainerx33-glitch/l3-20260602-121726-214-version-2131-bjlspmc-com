(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupPosters() {
        document.querySelectorAll('img.js-poster').forEach(function (image) {
            image.addEventListener('error', function () {
                image.hidden = true;
                var parent = image.parentElement;
                if (parent) {
                    parent.classList.add('is-missing-image');
                }
            });
        });
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var panel = document.querySelector('[data-nav-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        function showSlide(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.dataset.heroDot || 0));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }
    }

    function setupLocalFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var results = document.querySelector('[data-filter-results]');
        if (!panel || !results) {
            return;
        }
        var input = panel.querySelector('[data-filter-input]');
        var yearSelect = panel.querySelector('[data-year-filter]');
        var clearButton = panel.querySelector('[data-clear-filter]');
        var emptyState = document.querySelector('[data-empty-state]');
        var cards = Array.from(results.querySelectorAll('[data-filter-card]'));

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize(card.dataset.search);
                var cardYear = card.dataset.year || '';
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !year || cardYear === year;
                var visible = matchedKeyword && matchedYear;
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
        if (clearButton) {
            clearButton.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                applyFilter();
            });
        }

        var params = new URLSearchParams(window.location.search);
        if (params.get('year') && yearSelect) {
            yearSelect.value = params.get('year');
        }
        applyFilter();
    }

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card movie-card--compact">',
            '    <a class="poster-wrap" href="' + movie.url + '" data-fallback="' + escapeHtml(movie.title) + '">',
            '        <img class="poster-img js-poster" src="' + movie.image + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
            '        <span class="poster-badge">' + escapeHtml(movie.year || '年份') + '</span>',
            '        <span class="poster-score">' + escapeHtml(movie.rating) + '</span>',
            '    </a>',
            '    <div class="movie-card__body">',
            '        <div class="movie-card__meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
            '        <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupGlobalSearch() {
        var page = document.querySelector('[data-search-page]');
        if (!page || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var form = page.querySelector('[data-search-form]');
        var input = page.querySelector('[data-global-search-input]');
        var summary = page.querySelector('[data-search-summary]');
        var results = page.querySelector('[data-search-results]');

        function render() {
            var keyword = normalize(input.value);
            if (!keyword) {
                summary.textContent = '请输入关键词开始搜索。';
                results.innerHTML = '';
                return;
            }
            var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                return normalize(movie.search).indexOf(keyword) !== -1;
            }).slice(0, 120);
            summary.textContent = '找到 ' + matched.length + ' 条匹配结果，最多展示前 120 条。';
            results.innerHTML = matched.map(movieCardTemplate).join('\n');
            setupPosters();
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
        });
        input.addEventListener('input', render);

        var params = new URLSearchParams(window.location.search);
        if (params.get('q')) {
            input.value = params.get('q');
            render();
        }
    }

    function setupPlayer() {
        var video = document.querySelector('.js-hls-player');
        var playButton = document.querySelector('[data-play-button]');
        if (!video) {
            return;
        }
        var source = video.dataset.src;
        var hlsInstance = null;

        function attachSource() {
            if (!source || video.dataset.bound === 'true') {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
            video.dataset.bound = 'true';
        }

        function startPlayback() {
            attachSource();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (playButton) {
            playButton.addEventListener('click', startPlayback);
            video.addEventListener('play', function () {
                playButton.classList.add('is-hidden');
            });
        }
        video.addEventListener('click', attachSource, { once: true });
        video.addEventListener('loadedmetadata', function () {
            if (hlsInstance) {
                video.controls = true;
            }
        });
    }

    ready(function () {
        setupPosters();
        setupNavigation();
        setupHeroSlider();
        setupLocalFilters();
        setupGlobalSearch();
        setupPlayer();
    });
})();
