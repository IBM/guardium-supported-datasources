import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Match CRA's "homepage": "." so the gh-pages deploy works with relative paths
  base: './',
  build: {
    outDir: 'build',
    sourcemap: false,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
