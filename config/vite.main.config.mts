import { alias } from './vite.alias.config';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    process.env.NODE_ENV === 'development'
      ? undefined
      : viteStaticCopy({
          targets: [
            {
              src: ['node_modules/7zip-bin/win', 'node_modules/7zip-bin/linux', 'node_modules/7zip-bin/mac'],
              dest: '../../.vite/build',
            },
          ],
        }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias,
  },
});
