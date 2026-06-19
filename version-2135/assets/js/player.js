function initMoviePlayer(source) {
  var video = document.getElementById('movie-player');
  var button = document.querySelector('.player-start');
  var started = false;
  var hlsInstance = null;

  function attachSource() {
    if (!video || started) {
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    attachSource();
    if (button) {
      button.classList.add('hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        playVideo();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
