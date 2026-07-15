import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pin-plate/ui': path.resolve(__dirname, '../../../packages/ui/src'),
    },
  },
});
