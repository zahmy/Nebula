import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path, { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      "@server": path.resolve(__dirname, "server"),
    },
  },
  server: {
    port: 5173,
    hmr: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/query': {
        target: 'http://drizzle-proxy:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/query/, '/query'), // 保持/query
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('proxy-key', req.headers['proxy-key'] || 'key');
            console.log('代理送出的URL:', proxyReq.path);
            console.log('代理送出的標頭:', req.headers);
          });
          proxy.on('error', (err, req, res) => {
            console.log('代理錯誤:', err);
          });
        },
      },
    },
  },
})
