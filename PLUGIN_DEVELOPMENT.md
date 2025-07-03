# Tribelike Plugin Development Guide

> **Status**: Production-ready guide based on successful event-plugin-p2p implementation (July 2025)

## Vision: Pure P2P Plugins

Tribelike is pioneering true peer-to-peer social networking. Plugins must embrace this vision - **no servers, no databases, no central control**. Just Gun.js and the 26-line relay.

## Current Reality (July 2025)

### Plugin Ecosystem Status
| Plugin | State | P2P Ready | Notes |
|--------|-------|-----------|-------|
| event-plugin | **Pure P2P!** ✅ | **Yes** | **Live at tribelike.shniq.dev** |
| wiki-plugin | Hybrid (gun branch) | Partial | Still has backend |
| location-plugin | Hybrid | Partial | Gun.js + Express |
| link-plugin | Hybrid | Partial | Minimal features |
| chat-plugin | Empty | N/A | Never started |

**Success Story**: The event-plugin-p2p branch is the FIRST truly P2P plugin implementation!

## Pure P2P Plugin Architecture

### Core Principles
1. **No Backend**: Only the 26-line Gun relay
2. **User Owns Data**: Everything in Gun.js
3. **Offline First**: Must work without internet
4. **Real-time by Default**: Gun's .on() everywhere
5. **Privacy Optional**: Encryption available via SEA

### Data Architecture
```javascript
// Plugin namespace - public data
gun.get('plugins').get(pluginName).get(sphereId)

// User's plugin data - private
gun.user().get('plugins').get(pluginName)

// Shared sphere data - collaborative
gun.get('spheres').get(sphereId).get('plugins').get(pluginName)

// Plugin metadata - for discovery
gun.get('plugin-registry').get(pluginName).put({
  name: 'My Plugin',
  version: '1.0.0',
  description: 'Does amazing P2P things',
  author: gun.user(),
  url: 'https://my-cdn.com/my-plugin/plugin.js'
})
```

### Module Federation Setup
```typescript
// vite.config.ts
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'my-plugin',
      filename: 'plugin.js',
      exposes: {
        './Main': './src/Main.vue',
        './ListView': './src/views/ListView.vue',
        './CreateView': './src/views/CreateView.vue',
        './Settings': './src/views/Settings.vue'
      },
      shared: ['vue', 'gun']
    })
  ],
  build: {
    target: 'esnext',
    minify: true
  }
})
```

### Plugin Structure
```
my-plugin/
├── src/
│   ├── Main.vue                 # Plugin entry, routing
│   ├── views/
│   │   ├── ListView.vue         # Main list/browse view
│   │   ├── CreateView.vue       # Create new items
│   │   └── Settings.vue         # Plugin settings
│   ├── components/
│   │   └── [feature-specific]
│   ├── composables/
│   │   ├── usePluginGun.ts      # Gun.js setup
│   │   ├── usePluginData.ts     # Data operations
│   │   └── usePluginAuth.ts     # SEA integration
│   └── types/
│       └── index.ts             # TypeScript types
├── package.json                 # NO backend deps!
├── vite.config.ts              # Module federation
└── README.md                   # How to use
```

## Real Implementation Examples

### 1. Event Plugin (IMPLEMENTED in event-plugin-p2p)
```javascript
// composables/useEventGun.ts - Actual working code!
import type { IGunInstance } from 'gun'

export function useEventGun(gun: IGunInstance, sphereId: string) {
  const createEvent = async (eventData: Omit<Event, 'id' | 'creator' | 'created'>) => {
    const eventId = (Gun as any).text.random()
    const userPub = await gun.user().get('pub').once() as string
    
    const event: Event = {
      ...eventData,
      id: eventId,
      created: (Gun as any).state(),
      creator: userPub,
      attendees: {}
    }
    
    await gun.get('plugins').get('events').get(sphereId)
      .get('list').get(eventId).put(event)
    
    return eventId
  }
  
  // Real-time subscriptions with cleanup
  const subscribeToEvents = (filter?: { interest?: string, location?: string }) => {
    const off = gun.get('plugins').get('events').get(sphereId)
      .get('list').map().on((event, id) => {
        // Handle real-time updates
      })
    
    return off // Return unsubscribe function
  }
}
```

### 2. Chat Plugin (Pure P2P Concept)
```javascript
// composables/useChatGun.ts
import type { IGunInstance } from 'gun'

export function useChatGun(gun: IGunInstance, sphereId: string) {
  // Create room
  const createRoom = async (title: string, isPrivate: boolean = false) => {
    const roomId = Gun.text.random()
    const room = {
      id: roomId,
      title,
      created: Gun.state(),
      creator: await gun.user().get('pub').once(),
      isPrivate
    }
    
    if (isPrivate) {
      // Encrypt room data
      const encrypted = await SEA.encrypt(room, await gun.user().pair())
      gun.user().get('chat').get('private-rooms').get(roomId).put(encrypted)
    } else {
      // Public room
      gun.get('plugins').get('chat').get(sphereId).get('rooms').get(roomId).put(room)
    }
    
    return roomId
  }
  
  // Send message
  const sendMessage = async (roomId: string, text: string) => {
    const message = {
      id: Gun.text.random(),
      text,
      author: await gun.user().get('pub').once(),
      timestamp: Gun.state()
    }
    
    gun.get('plugins').get('chat').get(sphereId)
       .get('messages').get(roomId).set(message)
  }
  
  // Subscribe to messages
  const subscribeToMessages = (roomId: string, callback: Function) => {
    return gun.get('plugins').get('chat').get(sphereId)
              .get('messages').get(roomId)
              .map().on((msg, id) => {
                if (msg) callback({ ...msg, id })
              })
  }
  
  return {
    createRoom,
    sendMessage,
    subscribeToMessages
  }
}
```

### 3. Event Plugin Features (From Our Implementation)
```javascript
// composables/useEventGun.ts
export function useEventGun(gun: IGunInstance, sphereId: string) {
  // Create event
  const createEvent = async (eventData: Event) => {
    const eventId = Gun.text.random()
    const event = {
      ...eventData,
      id: eventId,
      created: Gun.state(),
      creator: await gun.user().get('pub').once(),
      attendees: {}
    }
    
    gun.get('plugins').get('events').get(sphereId)
       .get('list').get(eventId).put(event)
    
    return eventId
  }
  
  // RSVP to event
  const rsvpToEvent = async (eventId: string, status: 'yes' | 'no' | 'maybe') => {
    const userId = await gun.user().get('pub').once()
    
    gun.get('plugins').get('events').get(sphereId)
       .get('list').get(eventId).get('attendees')
       .get(userId).put({
         status,
         timestamp: Gun.state(),
         user: gun.user()
       })
  }
  
  // Get events with real-time updates
  const subscribeToEvents = (callback: Function) => {
    return gun.get('plugins').get('events').get(sphereId)
              .get('list').map().on((event, id) => {
                if (event) {
                  // Get attendee count
                  gun.get('plugins').get('events').get(sphereId)
                     .get('list').get(id).get('attendees')
                     .once(attendees => {
                       const count = Object.keys(attendees || {}).length
                       callback({ ...event, id, attendeeCount: count })
                     })
                }
              })
  }
  
  return {
    createEvent,
    rsvpToEvent,
    subscribeToEvents
  }
}
```

### 3. Encrypted Notes Plugin
```javascript
// composables/useNotesGun.ts
export function useNotesGun(gun: IGunInstance) {
  // All notes are encrypted and private
  const createNote = async (title: string, content: string) => {
    const noteId = Gun.text.random()
    const note = {
      id: noteId,
      title,
      content,
      created: Gun.state(),
      updated: Gun.state()
    }
    
    // Encrypt with user's key pair
    const encrypted = await SEA.encrypt(note, await gun.user().pair())
    gun.user().get('plugins').get('notes').get(noteId).put(encrypted)
    
    return noteId
  }
  
  // Get decrypted notes
  const getNotes = async (callback: Function) => {
    const pair = await gun.user().pair()
    
    gun.user().get('plugins').get('notes').map().on(async (enc, id) => {
      if (enc) {
        const decrypted = await SEA.decrypt(enc, pair)
        if (decrypted) callback({ ...decrypted, id })
      }
    })
  }
  
  return { createNote, getNotes }
}
```

## Plugin Development Workflow

### 1. Setup
```bash
# Create plugin from template
git clone https://github.com/toplocs/plugin-template my-plugin
cd my-plugin
pnpm install
```

### 2. Development
```bash
# Run with hot reload
pnpm dev

# Test in isolation
pnpm test

# Build for production
pnpm build
```

### 3. Testing with Tribelike
```javascript
// In Tribelike's Gun data
gun.get('plugins').set({
  url: 'http://localhost:5173/plugin.js',
  name: 'My Plugin (Dev)',
  pluginId: 'my_plugin_dev'
})
```

### 4. Distribution
- Host plugin.js on CDN (GitHub Pages, Vercel, etc.)
- Submit to plugin registry
- Users install via plugin manager

## Security & Privacy

### User Consent
```javascript
// Request permissions
const permissions = {
  readProfile: true,
  writeUserData: true,
  accessLocation: false
}

// Check before accessing
if (permissions.readProfile) {
  const profile = await gun.user().get('profile').once()
}
```

### Data Encryption
```javascript
// Encrypt sensitive data
const encrypted = await SEA.encrypt(data, key)

// Share encrypted data
gun.get('plugins').get(pluginId).get('encrypted').put(encrypted)

// Only those with key can decrypt
const decrypted = await SEA.decrypt(encrypted, key)
```

## Best Practices

### 1. Performance
- Use `.once()` for single reads
- Use `.on()` with cleanup for subscriptions
- Debounce rapid updates
- Paginate large lists

### 2. Offline Support
```javascript
// Check connection
const isOnline = gun._.opt.peers && Object.keys(gun._.opt.peers).length > 0

// Queue operations when offline
const queue = []
if (!isOnline) {
  queue.push(operation)
}

// Sync when back online
gun.on('hi', peer => {
  queue.forEach(op => op())
  queue.length = 0
})
```

### 3. Error Handling
```javascript
try {
  await gun.get('plugins').get(pluginId).put(data).then()
} catch (error) {
  console.error('Gun operation failed:', error)
  // Fallback or retry logic
}
```

## Common Patterns

### Lists with Pagination
```javascript
const PAGE_SIZE = 20

function paginatedList(path: string, page: number = 1) {
  const items = []
  let count = 0
  
  gun.get(path).map().once((item, id) => {
    count++
    if (count > (page - 1) * PAGE_SIZE && count <= page * PAGE_SIZE) {
      items.push({ ...item, id })
    }
  })
  
  return items
}
```

### Real-time Search
```javascript
function searchItems(query: string) {
  const results = ref([])
  
  gun.get('plugins').get(pluginId).get('items').map().on((item, id) => {
    if (item && item.title?.toLowerCase().includes(query.toLowerCase())) {
      results.value.push({ ...item, id })
    }
  })
  
  return results
}
```

## TypeScript & Gun.js Tips (From Real Experience)

### Type Casting Required
```typescript
// Gun.js methods need casting
const eventId = (Gun as any).text.random()
const timestamp = (Gun as any).state()

// User public key needs type assertion
const userId = await gun.user().get('pub').once() as string

// Complex chains need any casting
await (gun.get('plugins').get('events').get(sphereId)
  .get('list').get(eventId).get('attendees') as any)
  .get(userId).put(attendee)
```

### TypeScript Configuration
```json
// tsconfig.app.json - Relax strictness for Gun.js
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false,
    "skipLibCheck": true,
    "allowJs": true
  }
}
```

### Build Without Type Checking
```bash
# Skip type checking for faster builds
pnpm build-only  # Instead of pnpm build
```

## Testing P2P Plugins

### Unit Tests
```javascript
import { vi } from 'vitest'
import Gun from 'gun'

// Mock Gun for testing
const mockGun = {
  get: vi.fn(() => mockGun),
  put: vi.fn(() => mockGun),
  set: vi.fn(() => mockGun),
  on: vi.fn(() => mockGun),
  once: vi.fn(() => Promise.resolve({}))
}

test('creates room', async () => {
  const { createRoom } = useChatGun(mockGun, 'sphere123')
  await createRoom('Test Room')
  
  expect(mockGun.put).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Test Room' })
  )
})
```

### Integration Tests
- Use Gun's in-memory adapter
- Test real-time sync between instances
- Verify offline resilience

## Resources

## Plugin Deployment (New!)

### GitHub Actions Integration
Plugins are now automatically built and deployed with the main Tribelike app:

1. **Plugin is built in isolation** (cloned to `/tmp`)
2. **Dependencies installed with npm** (avoids pnpm workspace issues)
3. **Base path set correctly** (`PLUGIN_BASE_PATH=/plugins/plugin-name/`)
4. **Deployed to** `/plugins/plugin-name/`
5. **Auto-registered** via `plugin-registry.js`

### Manual Plugin Registration
```javascript
gun.get('plugins').set({
  id: 'event-plugin',
  name: 'Events (P2P)',
  url: '/plugins/event-plugin/plugin.js',
  version: '1.0.0',
  enabled: true
})
```

### Build Configuration
In your plugin's `vite.config.ts`:
```typescript
export default defineConfig({
  base: process.env.PLUGIN_BASE_PATH || './',
  // ... rest of config
})
```

## Resources & Links

### Documentation
- [Gun.js Docs](https://gun.eco/docs/)
- [SEA Encryption](https://gun.eco/docs/SEA)
- [Module Federation](https://github.com/originjs/vite-plugin-federation)

### Example Plugins
- [P2P Events](https://github.com/toplocs/event-plugin/tree/event-plugin-p2p) ✅ **IMPLEMENTED**
- [P2P Chat](https://github.com/toplocs/chat-plugin) (coming soon)
- [Plugin Template](https://github.com/toplocs/plugin-template) (coming soon)

### Community
- Tribelike Discord
- Plugin Developer Forum
- Weekly P2P Office Hours

---

**Remember**: The future of Tribelike is pure P2P. No servers, no control, just peers helping peers. Build plugins that embrace this vision! 🚀