(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
        let current = 0;
        let timer = null;

        const activate = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        };

        const start = function () {
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                activate(i);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    const filterInput = document.querySelector('[data-card-filter]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const cards = Array.from(document.querySelectorAll('[data-card-list] .movie-card'));

    const filterCards = function () {
        const q = filterInput ? filterInput.value.trim().toLowerCase() : '';
        const y = yearFilter ? yearFilter.value : '';

        cards.forEach(function (card) {
            const text = [card.dataset.title, card.dataset.genre, card.dataset.year].join(' ').toLowerCase();
            const yearMatched = !y || card.dataset.year === y;
            const textMatched = !q || text.indexOf(q) !== -1;
            card.style.display = yearMatched && textMatched ? '' : 'none';
        });
    };

    if (filterInput) {
        filterInput.addEventListener('input', filterCards);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', filterCards);
    }

    const players = Array.from(document.querySelectorAll('[data-player]'));

    players.forEach(function (wrap) {
        const video = wrap.querySelector('video');
        const trigger = wrap.querySelector('[data-play-trigger]');

        if (!video || !trigger) {
            return;
        }

        const loadAndPlay = function () {
            const src = video.getAttribute('data-stream');

            if (!src) {
                return;
            }

            if (!video.dataset.ready) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.dataset.ready = '1';
                } else if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    video.dataset.ready = '1';
                } else {
                    video.src = src;
                    video.dataset.ready = '1';
                }
            }

            const playPromise = video.play();

            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(function () {
                    wrap.classList.add('playing');
                }).catch(function () {
                    wrap.classList.add('playing');
                });
            } else {
                wrap.classList.add('playing');
            }
        };

        trigger.addEventListener('click', loadAndPlay);
        video.addEventListener('click', function () {
            if (video.paused) {
                loadAndPlay();
            }
        });
        video.addEventListener('play', function () {
            wrap.classList.add('playing');
        });
    });

    const searchForm = document.querySelector('[data-search-form]');
    const searchInput = document.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');

    if (searchForm && searchInput && results && typeof MOVIE_INDEX !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q') || '';
        searchInput.value = initial;

        const render = function (query) {
            const q = query.trim().toLowerCase();
            const picked = MOVIE_INDEX.filter(function (item) {
                if (!q) {
                    return item.featured;
                }
                return item.text.indexOf(q) !== -1;
            }).slice(0, 80);

            if (!picked.length) {
                results.innerHTML = '<p class="empty-state">没有找到匹配影片，请换个关键词试试。</p>';
                return;
            }

            results.innerHTML = '<div class="movie-grid">' + picked.map(function (item) {
                return [
                    '<article class="movie-card">',
                    '<a class="poster-link" href="' + item.file + '">',
                    '<img src="' + item.image + '" alt="' + item.title + '" loading="lazy">',
                    '<span class="poster-mask"></span>',
                    '<span class="play-dot">▶</span>',
                    '</a>',
                    '<div class="card-body">',
                    '<div class="card-meta"><span>' + item.year + '</span><span>' + item.category + '</span></div>',
                    '<h3><a href="' + item.file + '">' + item.title + '</a></h3>',
                    '<p>' + item.line + '</p>',
                    '</div>',
                    '</article>'
                ].join('');
            }).join('') + '</div>';
        };

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const q = searchInput.value.trim();
            const url = q ? 'search.html?q=' + encodeURIComponent(q) : 'search.html';
            window.history.replaceState(null, '', url);
            render(q);
        });

        searchInput.addEventListener('input', function () {
            render(searchInput.value);
        });

        render(initial);
    }
})();
