// Shared weapon-theme configuration for the NUI.
const JSConfig = {
  // Global NUI audio volume (0.0 to 1.0); individual streaks can override it.
  audioVolume: 0.1,
  defaultTheme: {
    1: { video: "vids/defult/1-kill-notif.webm", audio: "sounds/defult/1-kill-notif.mp3" },
    2: { video: "vids/defult/2-kill-notif.webm", audio: "sounds/defult/2-kill-notif.mp3" },
    3: { video: "vids/defult/3-kill-notif.webm", audio: "sounds/defult/3-kill-notif.mp3" },
    4: { video: "vids/defult/4-kill-notif.webm", audio: "sounds/defult/4-kill-notif.mp3" },
    5: { video: "vids/defult/5-kill-notif.webm", audio: "sounds/defult/5-kill-notif.mp3" },
    6: { video: "vids/defult/6-kill-notif.webm", audio: "sounds/defult/6-kill-notif.mp3" },
  },

  themes: {
    reaver: {
      1: { video: "vids/reaver/Reaver-1-kill-notif.webm", audio: "sounds/reaver/Reaver1.mp3" },
      2: { video: "vids/reaver/Reaver-2-kill-notif.webm", audio: "sounds/reaver/Reaver2.mp3" },
      3: { video: "vids/reaver/Reaver-3-kill-notif.webm", audio: "sounds/reaver/Reaver3.mp3" },
      4: { video: "vids/reaver/Reaver-4-kill-notif.webm", audio: "sounds/reaver/Reaver4.mp3" },
      5: { video: "vids/reaver/Reaver-5-kill-notif.webm", audio: "sounds/reaver/Reaver5.mp3" },
      6: { video: "vids/reaver/Reaver-5-kill-notif.webm", audio: "sounds/reaver/Reaver5.mp3" },
    },
  },

  weaponThemes: {
    // Weapon hashes map to theme names.
    "-2084633992": "default",
    "-1074790547": "reaver",
  },
};
