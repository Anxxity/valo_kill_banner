const killConfig = JSConfig.killConfig;

document.addEventListener("DOMContentLoaded", () => {
  const videoElement = document.getElementById("kill-video");
  const audioElement = document.getElementById("kill-audio");
  const notificationContainer = document.getElementById("kill-notification");

  if (!videoElement || !audioElement || !notificationContainer) {
    console.error("[Kill Banner] Required NUI elements are missing.");
    return;
  }

  const AUDIO_VOLUME = 0.1;
  const FADE_OUT_DURATION = 500;

  let hideTimeout = null;
  let currentPlayId = 0;

  function clearHideTimeout() {
    if (hideTimeout !== null) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  function stopMedia() {
    videoElement.pause();
    audioElement.pause();

    videoElement.removeAttribute("src");
    audioElement.removeAttribute("src");

    videoElement.load();
    audioElement.load();
  }

  function hideNotification(playId) {
    if (playId !== currentPlayId || !notificationContainer.classList.contains("active")) {
      return;
    }

    clearHideTimeout();
    notificationContainer.classList.add("fade-out");

    hideTimeout = setTimeout(() => {
      if (playId !== currentPlayId) {
        return;
      }

      notificationContainer.classList.remove("active", "fade-out");
      stopMedia();
      hideTimeout = null;
    }, FADE_OUT_DURATION);
  }

  function getKillConfig(killCount, weaponHash) {
    const weaponKey =
      weaponHash !== null && weaponHash !== undefined
        ? String(weaponHash)
        : "default";

    const weaponMap = killConfig[weaponKey] || killConfig.default;
    if (!weaponMap) {
      return null;
    }

    const streak = Math.max(1, Math.min(Math.floor(Number(killCount) || 1), 6));
    return weaponMap[streak] || weaponMap[6] || null;
  }

  function playKillNotification(killCount, weaponHash) {
    const config = getKillConfig(killCount, weaponHash);

    if (!config || !config.video || !config.audio) {
      console.error("[Kill Banner] Missing media config for kill count:", killCount);
      return;
    }

    currentPlayId++;
    const playId = currentPlayId;

    clearHideTimeout();
    stopMedia();

    notificationContainer.classList.remove("fade-out");
    notificationContainer.classList.add("active");

    videoElement.onended = () => hideNotification(playId);
    videoElement.onerror = () => {
      if (playId !== currentPlayId) return;
      console.error("[Kill Banner] Failed to load kill video:", config.video);
      hideNotification(playId);
    };

    audioElement.onerror = () => {
      if (playId !== currentPlayId) return;
      console.warn("[Kill Banner] Failed to load kill audio:", config.audio);
    };

    videoElement.onloadedmetadata = () => {
      if (playId !== currentPlayId) return;

      if (Number.isFinite(videoElement.duration) && videoElement.duration > 0) {
        clearHideTimeout();
        hideTimeout = setTimeout(() => {
          hideNotification(playId);
        }, (videoElement.duration + 0.5) * 1000);
      }
    };

    videoElement.src = config.video;
    audioElement.src = config.audio;
    audioElement.volume = AUDIO_VOLUME;

    videoElement.load();
    audioElement.load();

    const videoPlayback = videoElement.play();
    if (videoPlayback && typeof videoPlayback.catch === "function") {
      videoPlayback.catch((error) => {
        if (playId !== currentPlayId) return;
        console.error("[Kill Banner] Video playback failed:", error);
        hideNotification(playId);
      });
    }

    const audioPlayback = audioElement.play();
    if (audioPlayback && typeof audioPlayback.catch === "function") {
      audioPlayback.catch((error) => {
        if (playId !== currentPlayId) return;
        console.warn("[Kill Banner] Audio playback failed:", error);
      });
    }
  }

  window.addEventListener("message", (event) => {
    const data = event.data;

    if (data?.type !== "playerKill") {
      return;
    }

    playKillNotification(data.killStreak, data.weaponHash ?? null);
  });

  window.addEventListener("pagehide", () => {
    currentPlayId++;
    clearHideTimeout();
    stopMedia();
  });
});
