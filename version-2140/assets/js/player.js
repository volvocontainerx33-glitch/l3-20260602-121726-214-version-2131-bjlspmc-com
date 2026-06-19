
(function () {
  const videos = Array.from(document.querySelectorAll('.site-video'));

  videos.forEach(function (video) {
    const source = video.getAttribute('data-stream');
    const overlay = document.querySelector('[data-player-overlay="' + video.id + '"]');
    let attached = false;
    let hls = null;

    function setMessage(message) {
      if (!overlay) {
        return;
      }
      overlay.innerHTML = '<span class="play-circle">!</span><span>' + message + '</span>';
      overlay.classList.remove('is-hidden');
    }

    function attachSource() {
      if (attached || !source) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放暂不可用');
          }
        });
        return;
      }

      setMessage('播放暂不可用');
    }

    function playVideo() {
      attachSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      const request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
