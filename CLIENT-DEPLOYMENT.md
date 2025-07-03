# Tribelike Client Deployment Guide

## Overview

Tribelike is a P2P application where the entire logic runs in the browser. This means you can deploy your own client instance on any static hosting service and still connect to the Tribelike network!

## Understanding P2P Deployment

### Traditional Apps vs Tribelike
- **Traditional**: Client → API Server → Database
- **Tribelike**: Static Files → Browser → Gun Network

The "server" is just a relay for peer discovery. All data storage and logic happens in your browser.

## Deployment Options

### 1. GitHub Pages (Free & Easy)

#### Manual Deployment
```bash
# Clone and build
git clone https://github.com/toplocs/tribelike.git
cd tribelike
git checkout gun
pnpm install
pnpm build

# Create gh-pages branch
git checkout -b gh-pages
cp -r server/dist/views/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Enable GitHub Pages in repo settings
```

#### Automated with GitHub Actions
The project now includes a complete deployment workflow that also builds plugins!

See `.github/workflows/client_deploy.yml` for the full implementation.

Key features:
- Automatic deployment on push to `gun` branch
- Plugin support (Event, Wiki, Chat)
- Configurable plugin branches
- Custom domain support (CNAME)

Example: https://tribelike.shniq.dev (deployed July 2025)

### 2. Netlify (Free Tier Available)

```bash
# Build locally
pnpm build

# Deploy with Netlify CLI
npm install -g netlify-cli
netlify deploy --dir=server/dist/views --prod
```

Or drag & drop the `server/dist/views` folder to [Netlify](https://app.netlify.com/drop).

### 3. Vercel (Free Tier Available)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd server/dist/views
vercel --prod
```

### 4. IPFS (Truly Decentralized)

```bash
# Install IPFS
# Build the app
pnpm build

# Add to IPFS
ipfs add -r server/dist/views
# Note the hash and access via IPFS gateway
```

### 5. Any Static Host

The build output (`server/dist/views`) is just static HTML/JS/CSS. Upload to:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Your own web server
- Even a local file:// URL works!

## Configuration

### Connecting to the Network

Before building, update the Gun peers in `client/src/services/gun.ts`:

```javascript
const gun = Gun({ 
  peers: [
    'https://toplocs.com/gun',        // Main Tribelike relay
    'https://your-relay.com/gun',     // Your own relay (optional)
    'https://gunjs.herokuapp.com/gun' // Public Gun relay
  ], 
  rad: true 
});
```

### Environment Variables

Create `.env` in the client directory:
```bash
VITE_GUN_PEERS=https://toplocs.com/gun,https://your-relay.com/gun
VITE_APP_NAME="My Tribelike Instance"
```

## Running Your Own Relay (Optional)

While not required, you can run your own Gun relay:

```bash
# Use the minimal server from Tribelike
cd server
pnpm install
pnpm start

# Or create a minimal relay
npm init -y
npm install express gun
```

```javascript
// relay.js
const express = require('express');
const Gun = require('gun');

const app = express();
const server = app.listen(3000);

Gun({ web: server });

console.log('Gun relay running on http://localhost:3000/gun');
```

## Custom Modifications

### Theming
Edit `client/src/assets/main.css` before building.

### Features
Add your own components/views - it's just a Vue.js app!

### Plugins
Register your custom plugins in Gun:
```javascript
gun.get('plugins').set({
  id: 'my-plugin',
  name: 'My Custom Plugin',
  url: 'https://my-cdn.com/plugin.js'
})
```

## Security Considerations

1. **HTTPS Required**: WebAuthn only works on secure origins
2. **CORS**: Ensure your Gun relay allows your domain
3. **CSP**: Configure Content Security Policy appropriately

## Benefits of Self-Hosting

- **No Vendor Lock-in**: Your data, your instance
- **Custom Features**: Modify as needed
- **Privacy**: Control your relay connections
- **Resilience**: Network continues even if toplocs.com is down
- **Learning**: Understand P2P architecture

## Troubleshooting

### "User not found" Error
Clear browser storage - Gun data might be corrupted.

### Can't Connect to Peers
- Check browser console for WebSocket errors
- Ensure Gun relay URLs are correct
- Try public Gun relays first

### Build Issues
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Community Instances

Once deployed, share your instance! Multiple instances strengthen the network:
- Different features/themes
- Geographic distribution
- Redundancy

## Conclusion

Deploying Tribelike is as simple as hosting static files. No databases, no complex server setup - just build and deploy. Your instance becomes a peer in the global Tribelike network!

Welcome to the decentralized web! 🚀