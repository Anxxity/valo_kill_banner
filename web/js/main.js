const defaultKillConfig = JSConfig.defaultKillConfig;
const killConfig = JSConfig.killConfig;

document.addEventListener("DOMContentLoaded", () => {
  const videoElement = document.getElementById('kill-video');
  const audioElement = document.getElementById('kill-audio');
  const notificationContainer = document.getElementById('kill-notification');

  let hideTimeout = null;
  let currentPlayId = 0;

  function hideNotification(playId) {
    if (playId !== currentPlayId) return;

    notificationContainer.classList.add('fade-out');
    setTimeout(() => {
      if (playId !== currentPlayId) return;
      notificationContainer.classList.remove('active');
    }, 300);
  }

  function playKillNotification(killCount, weaponHash) {
    currentPlayId++;
    const playId = currentPlayId;
    
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    videoElement.pause();
    audioElement.pause();
    videoElement.removeAttribute('src');
    audioElement.removeAttribute('src');
    videoElement.load();
    audioElement.load();

    const weaponKey =
      weaponHash !== null && weaponHash !== undefined
        ? String(weaponHash)
        : 'default';

    const weaponMap = killConfig[weaponKey] || killConfig.default;
    const config = killCount > 6 ? weaponMap[6] : weaponMap[killCount];

    if (!config) {
      console.error('No config for kill count:', killCount);
      return;
    }
    videoElement.src = config.video;
    audioElement.src = config.audio;
    notificationContainer.classList.remove('fade-out');
    notificationContainer.classList.add('active');
    document.body.classList.remove('flash');
    requestAnimationFrame(() => document.body.classList.add('flash'));
    videoElement.currentTime = 0;
    audioElement.currentTime = 0;
    audioElement.volume = 0.1;
  
    Promise.allSettled([
      videoElement.play(),
      audioElement.play()
    ]);
    videoElement.onended = () => {
      hideNotification(playId);
    };

    videoElement.onloadedmetadata = () => {
      hideTimeout = setTimeout(() => {
        hideNotification(playId);
      }, (videoElement.duration + 0.3) * 1000);
    };
  }

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data?.type === 'playerKill') {
      playKillNotification(
        data.killStreak || 1,
        data.weaponHash ?? null
      );
    }
  });
});
