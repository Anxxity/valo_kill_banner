      const defaultKillConfig = {
        1: { video: 'vids/defult/1-kill-notif.webm', audio: 'sounds/defult/1-kill-notif.mp3' },
        2: { video: 'vids/defult/2-kill-notif.webm', audio: 'sounds/defult/2-kill-notif.mp3' },
        3: { video: 'vids/defult/3-kill-notif.webm', audio: 'sounds/defult/3-kill-notif.mp3' },
        4: { video: 'vids/defult/4-kill-notif.webm', audio: 'sounds/defult/4-kill-notif.mp3' },
        5: { video: 'vids/defult/5-kill-notif.webm', audio: 'sounds/defult/5-kill-notif.mp3' },
        6: { video: 'vids/defult/6-kill-notif.webm', audio: 'sounds/defult/6-kill-notif.mp3' },
      };

      const killConfig = {
        default: defaultKillConfig,
        "-2084633992": defaultKillConfig,

        "-1074790547": {
          1: { video: 'vids/reaver/Reaver-1-kill-notif.webm', audio: 'sounds/reaver/Reaver1.mp3' },
          2: { video: 'vids/reaver/Reaver-2-kill-notif.webm', audio: 'sounds/reaver/Reaver2.mp3' },
          3: { video: 'vids/reaver/Reaver-3-kill-notif.webm', audio: 'sounds/reaver/Reaver3.mp3' },
          4: { video: 'vids/reaver/Reaver-4-kill-notif.webm', audio: 'sounds/reaver/Reaver4.mp3' },
          5: { video: 'vids/reaver/Reaver-5-kill-notif.webm', audio: 'sounds/reaver/Reaver5.mp3' },
          6: { video: 'vids/reaver/Reaver-5-kill-notif.webm', audio: 'sounds/reaver/Reaver5.mp3' },
        },
      };

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
        
          playKillNotification(killStreak,weaponHash);
        }
      });