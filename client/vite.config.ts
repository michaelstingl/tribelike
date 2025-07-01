import axios from 'axios';
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(), // Vue DevTools for development
    tailwindcss(),
    federation({
      name: 'tribelike',
      shared: ['vue', 'tailwindcss'],
      remotes: [],
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'esnext',
    outDir: '../server/dist/views'
  },
});
