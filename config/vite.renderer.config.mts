import { alias } from './vite.alias.config';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: process.env.NODE_ENV === 'production' ? resolve(__dirname, '../src/index.html') : resolve(__dirname, 'index.html'),
      },
      output: {
        dir: '.vite/renderer/main_window',
      },
    },
  },
  plugins: [
    react(),
    svgr({ include: '**/*.svg' }),
    viteStaticCopy({
      targets: [
        {
          src: ['assets/images', 'assets/fonts'],
          dest: '../../../../.vite/renderer/assets',
        },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.png', '.jpg', '.svg'],
    alias,
  },
  root: resolve(__dirname, '../src'),
});
