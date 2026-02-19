const defaultKillConfig = JSConfig.defaultKillConfig;
const killConfig = JSConfig.killConfig;

document.addEventListener("DOMContentLoaded", () => {
  const videoElement = document.getElementById('kill-video');
  const audioElement = document.getElementById('kill-audio');
  const notificationContainer = document.getElementById('kill-notification');

  function playKillNotification(killCount, weaponHash) {
    const weaponKey = weaponHash !== null && weaponHash !== undefined ? String(weaponHash) : 'default';
    const weaponMap = killConfig[weaponKey] || killConfig.default;
    const config = killCount > 6 ? weaponMap[6] : weaponMap[killCount];

    if (!config) {
      console.error('No config found for kill count:', killCount);
      return;
    }

    videoElement.src = config.video;
    audioElement.src = config.audio;
    notificationContainer.classList.remove('fade-out');
    notificationContainer.classList.add('active');

    document.body.classList.remove('flash');
    setTimeout(() => {
      document.body.classList.add('flash');
    }, 10);

    videoElement.currentTime = 0;
    audioElement.currentTime = 0;

    videoElement.play();
    audioElement.volume = .10
    audioElement.play();

    videoElement.onended = () => {
      notificationContainer.classList.add('fade-out');
      setTimeout(() => {
        notificationContainer.classList.remove('active');
      }, 500);
    };

    videoElement.onloadedmetadata = () => {
      setTimeout(() => {
        if (notificationContainer.classList.contains('active')) {
          notificationContainer.classList.add('fade-out');
          setTimeout(() => {
            notificationContainer.classList.remove('active');
          }, 500);
        }
      }, (videoElement.duration + 0.5) * 1000);
    };
  }

  window.addEventListener('message', (event) => {
    const data = event.data;

    if (data.type === 'playerKill') {
      const killStreak = data.killStreak || 1;
      const weaponHash = data.weaponHash || null;

      playKillNotification(killStreak, weaponHash);
    }
  });
});

