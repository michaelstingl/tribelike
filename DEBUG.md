# Tribelike Debug Tools

## Quick Start

### Development
Just run `pnpm dev` - all debug tools are automatically enabled!

### Production (tribelike.shniq.dev)

**Full debug** (all logs):
```
https://tribelike.shniq.dev?debug=true
```

**Filtered debug** (only specific types):
```
https://tribelike.shniq.dev?debug=peer          # Only peer connections
https://tribelike.shniq.dev?debug=get           # Only GET operations
https://tribelike.shniq.dev?debug=subscribe     # Only subscriptions
https://tribelike.shniq.dev?debug=get,peer      # Multiple types
```

**Quiet mode** (no console hints):
```
https://tribelike.shniq.dev?debug=true&quiet    # Debug without hints
```

## Available Tools

### 1. Eruda Console (Mobile-style)
- Look for the **floating button** in the bottom-right corner
- Click to open a mobile-style dev console
- Tabs: Console, Network, Resources, Info, Elements

### 2. Gun.js Logger
Works in both browser console AND Eruda console!

**Quick commands** (easier to type):
```javascript
gunStats()     // Show current statistics
gunRecent()    // Show last 10 events
gunRecent(20)  // Show last 20 events
gunClear()     // Clear log history
```

**Full logger object**:
```javascript
gunLog.printStats()   // Same as gunStats()
gunLog.showRecent()   // Same as gunRecent()
gunLog.getStats()     // Get raw stats object
gunLog.getEvents()    // See all logged events
gunLog.clear()        // Same as gunClear()
```

### 3. Vue DevTools (Dev only)
In development, Vue DevTools appears at the bottom of the screen:
- Component inspector
- Timeline
- Routes
- Performance

## What Gets Logged?

### Gun.js Operations
- **GET** - When data is requested
- **SUBSCRIBE** - When listening for updates
- **PEER** - Connection status to Gun relays

### Console Output
Colored logs show:
- 🔫 Gun operations (green)
- 📡 Peer connections (orange)
- 👁️ Subscriptions (purple)

## Debugging Common Issues

### Check Peer Connection
```javascript
gunLog.printStats()
// Shows: Connected Peers: 1/1
```

### Monitor Specific Data
```javascript
// In console:
gun.get('profile/123').on(data => console.log('Profile updated:', data))
```

### Clear Corrupted Data
```javascript
gun.clear()  // Clears localStorage, sessionStorage, IndexedDB
```

## Tips

1. **Performance**: Check graph size with `gunLog.getStats().graphSize`
2. **Memory**: Eruda shows memory usage in the "Info" tab
3. **Network**: Eruda's Network tab shows WebSocket connections
4. **Storage**: Eruda's Resources tab shows Gun data in localStorage

## Keyboard Shortcuts

None yet - use the floating Eruda button or console commands.