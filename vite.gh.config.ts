import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'gh-pages',
      emptyOutDir: true,
      copyPublicDir: false,
      target: 'es2020',
      cssCodeSplit: false,
      rolldownOptions: {
        input: path.resolve(import.meta.dirname, 'src/main.tsx'),
        output: {
          entryFileNames: 'app.js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.names?.[0] || '';
            if (name.endsWith('.css')) return 'app.css';
            return 'asset-[name][extname]';
          },
          inlineDynamicImports: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
  };
});
