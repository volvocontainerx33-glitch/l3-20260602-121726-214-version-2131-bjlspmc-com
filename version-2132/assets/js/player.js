function startMoviePlayer(sourceUrl) {
    var video = document.getElementById('movie-player');
    var cover = document.getElementById('player-cover');
    var button = document.getElementById('play-button');
    var bridge = null;
    var ready = false;

    if (!video || !cover || !button) {
        return;
    }

    function mount() {
        if (ready) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            bridge = new window.Hls();
            bridge.loadSource(sourceUrl);
            bridge.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }

        ready = true;
    }

    function play() {
        mount();
        cover.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var attempt = video.play();
        if (attempt && attempt.catch) {
            attempt.catch(function() {});
        }
    }

    cover.addEventListener('click', play);
    button.addEventListener('click', play);
    video.addEventListener('click', function() {
        if (video.paused) {
            play();
        }
    });
}
