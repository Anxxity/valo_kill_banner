const themeConfig = JSConfig;

document.addEventListener("DOMContentLoaded", () => {
  const videoElement = document.getElementById("kill-video");
  const audioElement = document.getElementById("kill-audio");
  const notificationContainer = document.getElementById("kill-notification");

  if (!videoElement || !audioElement || !notificationContainer) {
    console.error("[Kill Banner] Required NUI elements are missing.");
    return;
  }

  const DEFAULT_AUDIO_VOLUME = 0.1;
  const FADE_OUT_DURATION = 500;

  let hideTimeout = null;
  let currentPlayId = 0;
  let loadedVideo = "";
  let loadedAudio = "";

  function clearHideTimeout() {
    if (hideTimeout !== null) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  function resetPlayback(element) {
    element.pause();
    try {
      element.currentTime = 0;
    } catch (_) {
      // The media may not have loaded metadata yet.
    }
  }

  function releaseMedia() {
    resetPlayback(videoElement);
    resetPlayback(audioElement);
    videoElement.removeAttribute("src");
    audioElement.removeAttribute("src");
    videoElement.load();
    audioElement.load();
    loadedVideo = "";
    loadedAudio = "";
  }

  function setMediaSource(element, source, currentSource) {
    if (source === currentSource) {
      resetPlayback(element);
      return currentSource;
    }

    element.src = source;
    element.load();
    return source;
  }

  function hideNotification(playId) {
    if (playId !== currentPlayId || !notificationContainer.classList.contains("active")) {
      return;
    }

    clearHideTimeout();
    notificationContainer.classList.add("fade-out");

    hideTimeout = setTimeout(() => {
      if (playId !== currentPlayId) return;

      notificationContainer.classList.remove("active", "fade-out");
      resetPlayback(videoElement);
      resetPlayback(audioElement);
      hideTimeout = null;
    }, FADE_OUT_DURATION);
  }

  function getKillConfig(killCount, weaponHash) {
    const weaponKey = weaponHash === null || weaponHash === undefined
      ? null
      : String(weaponHash);

    const themeName = weaponKey
      ? themeConfig.weaponThemes[weaponKey]
      : null;

    const selectedTheme = themeName && themeConfig.themes[themeName]
      ? themeConfig.themes[themeName]
      : themeConfig.defaultTheme;

    const streak = Math.max(1, Math.min(Math.floor(Number(killCount) || 1), 6));
    return selectedTheme[streak] || themeConfig.defaultTheme[streak] || null;
  }

  function getAudioVolume(config) {
    const configuredVolume = Number(config.volume ?? themeConfig.audioVolume ?? DEFAULT_AUDIO_VOLUME);
    if (!Number.isFinite(configuredVolume)) return DEFAULT_AUDIO_VOLUME;
    return Math.max(0, Math.min(configuredVolume, 1));
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
    resetPlayback(videoElement);
    resetPlayback(audioElement);

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
        hideTimeout = setTimeout(() => hideNotification(playId), (videoElement.duration + 0.5) * 1000);
      }
    };

    loadedVideo = setMediaSource(videoElement, config.video, loadedVideo);
    loadedAudio = setMediaSource(audioElement, config.audio, loadedAudio);
    audioElement.volume = getAudioVolume(config);

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
    if (event.data?.type !== "playerKill") return;
    playKillNotification(event.data.killStreak, event.data.weaponHash ?? null);
  });

  window.addEventListener("pagehide", () => {
    currentPlayId++;
    clearHideTimeout();
    releaseMedia();
  });
});
