function initializePlayer(sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("moviePlayButton");

    if (!video || !button || !sourceUrl) {
        return;
    }

    var started = false;
    var hls = null;

    var attachSource = function () {
        if (started) {
            return;
        }

        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    };

    var playVideo = function () {
        attachSource();
        button.classList.add("hidden");
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                button.classList.remove("hidden");
            });
        }
    };

    button.addEventListener("click", playVideo);

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        button.classList.add("hidden");
    });

    video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
            button.classList.remove("hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
