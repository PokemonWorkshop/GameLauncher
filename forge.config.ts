import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerNSIS } from './src/MakerNSIS';
import { MakerZIP } from '@electron-forge/maker-zip';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { VitePlugin } from '@electron-forge/plugin-vite';

const config: ForgeConfig = {
  packagerConfig: {
    icon: './src/assets/images/icon',
    extraResource: ['app-update.yml'],
  },
  rebuildConfig: {},
  makers: [new MakerNSIS({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main.ts',
          config: 'config/vite.main.config.mts',
          target: 'main',
        },
        {
          entry: 'src/preloadRenderer.ts',
          config: 'config/vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'config/vite.renderer.config.mts',
        },
      ],
    }),
  ],
  outDir: 'out/make',
};

export default config;
