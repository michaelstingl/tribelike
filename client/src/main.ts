import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import 'vue3-openlayers/styles.css';
import OpenLayersMap from 'vue3-openlayers';
import VueDnDKitPlugin from '@vue-dnd-kit/core';

// Debug mode activation (?debug=true works in production!)
const params = new URLSearchParams(location.search);
const debugMode = import.meta.env.DEV || params.has('debug');
const quietMode = params.has('quiet');

if (debugMode) {
  // Load Gun.js Logger
  import('./utils/gunLogger').then(({ default: gunLogger }) => {
    if (!quietMode) {
      console.log('Gun Logger loaded. Available commands:');
      console.log('- gunStats()     // Show statistics');
      console.log('- gunRecent()    // Show recent activity');
      console.log('- gunClear()     // Clear logs');
      console.log('- gunLog         // Full logger object');
    }
  });
  
  // Load Eruda (mobile-style console)
  import('eruda').then(({ default: eruda }) => {
    eruda.init({
      container: document.body,
      tool: ['console', 'network', 'resources', 'info', 'elements'],
      useShadowDom: true,
      autoScale: true
    });
    
    // Position bottom right
    eruda.position({ 
      x: window.innerWidth - 50, 
      y: window.innerHeight - 50 
    });
    
    // Start minimized
    eruda.hide();
    
    // Show hint
    if (!quietMode) {
      console.log('%c📱 Eruda Console loaded! Click the floating button to open.', 
        'color: #9C27B0; font-weight: bold');
    }
  });
}

const app = createApp(App);

app.use(router);
app.use(VueDnDKitPlugin);
app.use(OpenLayersMap /*, options */);

app.mount('#app');
