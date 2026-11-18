# valorant kill banner fivem 

A FiveM script for GTA V that displays dynamic kill streak notifications with custom video and audio effects. The system detects when a player kills another player and triggers an overlay with progressive notifications based on kill count.

## Overview

This FiveM resource implements a real-time kill notification system that:
- Detects player-on-player kills in-game
- Tracks consecutive kill streaks
- Displays custom video/audio notifications based on kill count and weapon type
- Auto-resets kill count after 10 seconds of inactivity

## Features

- **Real-time Kill Detection** - Tracks when player kills another player
- **Kill Streak System** - Consecutive kills counted within 10-second window
- **Weapon-Based Themes** - Different notification styles for weapon types
- **Video + Audio** - Synchronized video overlays with audio notifications
- **Debug Commands** - Test notifications without kills

### Kill Streak System

```lua
killResetTime = 10000  -- 10 seconds in milliseconds

if (currentTime - lastKillTime) <= killResetTime then
    killCount = killCount + 1  -- Increment streak
else
    killCount = 1              -- Reset streak
end
```

### Message Structure

The client sends this data to the web overlay (NUI):

```lua
{
    type = "playerKill",
    killStreak = killCount,      -- 1 to 6+ 
    weaponHash = weaponHash      -- Weapon identifier
}
```

### Weapon Themes

Weapon hashes trigger different notification styles:

- `default` or `-2084633992` - Default notifications
- `-1074790547` - custom weapon notifications
- Weapon hashes and theme mappings are configured in `shared/config.js`

## Events

### Server Events

- **`playerKilled`** - Client reports a fatal player hit with the victim network ID and weapon hash
  - Server checks for a matching recent `weaponDamageEvent`, validates the networked victim entity, and applies a per-player rate limit
  - Triggers: `hud:updateKill` on the killing player's client

### Client Events

- **`hud:updateKill`** - Received from server after the kill report passes the available checks
  - Updates kill streak counter
  - Sends NUI message with kill data and the weapon hash captured at the hit

## Commands

### Test Kill Notifications
```
/testkill [killCount]
```
Simulates a kill without needing an actual kill. Optional parameter sets kill streak (default: 1).

Example:
```
/testkill 3        -- Simulate a triple kill
/testkill          -- Simulate a single kill
```

## Asset Files Required

### Video Files
- `web/vids/defult/1-kill-notif.webm` through `5-kill-notif.webm`
- `web/vids/reaver/Reaver-1-kill-notif.webm` through `Reaver-5-kill-notif.webm`

### Audio Files
- `web/sounds/defult/1-kill-notif.mp3` through `5-kill-notif.mp3`
- `web/sounds/reaver/Reaver1.mp3` through `Reaver5.mp3`

## Configuration

### Client-Side (client.lua)
- **killResetTime**: Time window for consecutive kills (in milliseconds)
  - Default: 10000 (10 seconds)

### Web-Side (web/js/main.js)
Edit the `killConfig` object to:
- Add new weapon themes
- Change video/audio file paths
- Adjust volume levels (default: 0.10)

Example:
```javascript
killConfig: {
    default: { videos: [...], audios: [...] },
    '-1074790547': { videos: [...], audios: [...] }
}
```

### Styling (web/css/idk.css)
- Overlay position (currently bottom-center at 90% from top)
- Fade in/out animations
- Video dimensions
- Z-index and layering

## Weapon Theme Configuration

Weapon hashes are mapped to theme names in `shared/config.js`.

- `defaultTheme` contains the fallback media for each kill streak.
- `themes` contains named theme definitions such as `reaver`.
- `weaponThemes` maps a weapon hash to a theme name.
- A theme can override only the streaks it has assets for; missing streaks fall back to the matching default streak.

To add a theme, add its streak media under `themes`, then map the weapon hash under `weaponThemes`. The default theme remains the fallback for unmapped weapons.

## Server-side Kill Report Checks

The server keeps a short-lived record of recent `weaponDamageEvent` events. When the client reports a fatal player hit, the server checks that:

- A matching recent damage event exists for that player, victim network ID, and weapon hash
- The victim network ID resolves to another player's ped
- The report is inside the configured validation window
- The player is not sending reports faster than the configured rate limit

The validation window and rate limit are configured in `shared/config.lua`.

**Security note:** FiveM's `weaponDamageEvent` is a network damage request, and the client supplies the fatal-hit observation. These checks reduce forged/replayed event reports, but they do not independently prove a kill or provide complete anti-cheat protection.

## NUI Playback Lifecycle

The NUI notification player stops previous media before starting a new kill banner, ignores stale playback callbacks, and clears its hide timer when a newer notification arrives.

- Video and audio playback errors are handled separately.
- A failed video hides the notification; a failed audio file logs a warning without stopping the video.
- The notification hides when the video ends, with a duration-based fallback.
- The fade-out timer matches the CSS animation duration.
- Media is stopped and unloaded when the NUI page is closed.

## Version Check

The server checks the latest version from this repository when the resource starts.

- The installed version is read from the `version` field in `fxmanifest.lua`.
- The latest version is read from [version.json](https://github.com/Anxxity/valo_kill_banner/blob/main/version.json).
- If a newer version is available, a message with the release link is printed in the server console.
- The check requires the FiveM server to have internet access. If GitHub cannot be reached, the resource continues to work normally.

When publishing an update, change the version in both `fxmanifest.lua` and `version.json`.

## Installation

1. Place the resource folder in your FiveM `resources` directory
2. Add to `server.cfg`:
   ```
   ensure valo_kill_banner
   ```
3. Add required video and audio files to `web/sounds/` and `web/vids/`
4. Restart server or use `/refresh` and `/start valo_kill_banner`

## Notes

- Videos are muted in-game (auto-play with sound disabled)
- Audio plays separately at low volume (10% default) to avoid overlap
- Kill streak resets after 10 seconds without a kill
- Only player-on-player kills count (no NPC kills)
- Notifications queue smoothly if kills happen rapidly
- Transparent background allows integration with other UI

## Troubleshooting

**Notifications not showing?**
- Check framework is loaded
- Verify NUI is enabled in fxmanifest.lua
- Test with `/testkill` command

**Audio/Video missing?**
- Verify file paths in `web/js/main.js`
- Ensure files are listed in `files` section of fxmanifest.lua
- Check case sensitivity of filenames

**Kill count not resetting?**
- Increase `killResetTime` in client.lua if needed
- Default is 10 seconds (10000ms)

## Known Bugs 
- ~~Bug where only audio plays~~  **Fixed**
- no bugs for now



## Disclaimer valo kill banner fivem 

####  Asset Usage Notice

The video clips used in this project are sourced from many YouTube Video, and the audio effects are sourced from [ValoFandom](https://valorant.fandom.com/wiki/Kill_Banners).

These assets are not owned by the author of this script and are used strictly for educational, demonstration, and non-commercial purposes.

All rights to the respective videos, sounds, trademarks, and intellectual property belong to their original creators and owners.

If you plan to use this resource in a public or commercial server, it is strongly recommended to:

Replace the assets with original or properly licensed content

Or obtain permission from the original rights holders

The developer of this script does not claim ownership of any third-party media included.
