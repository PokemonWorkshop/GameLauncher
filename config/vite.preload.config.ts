import { alias } from './vite.alias.config';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias,
  },
});
