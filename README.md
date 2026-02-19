# Kill Notification System

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
- Custom hashes can be added to `web/js/main.js`

## Events

### Server Events

- **`playerKilled`** - Fired by client when player kills someone
  - Triggers: `hud:updateKill` on the killing player's client

### Client Events

- **`hud:updateKill`** - Received from server after kill confirmed
  - Updates kill streak counter
  - Sends NUI message with kill data
  - Gets current weapon hash

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


