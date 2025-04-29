import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

let publishSubDirPath = 'react-spine-pixi-starter/';
if (!publishSubDirPath.endsWith('/')) {
  publishSubDirPath = `${publishSubDirPath}/`;
}

export default defineConfig({
  plugins: [tailwindcss(), svgr(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: `/${publishSubDirPath}`,
  build: {
    outDir: `./docs/${publishSubDirPath}`,
    emptyOutDir: true, // also necessary
  },
});
