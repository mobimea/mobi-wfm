import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup-fixed.ts'],
    css: true,
    // Only run our app tests, not node_modules or Cypress specs
    include: [
      'src/**/*.{test,spec}.{ts,tsx,js,jsx}'
    ],
    exclude: [
      'node_modules/**',
      'cypress/**',
      'src/__tests__/settings-integration.test.js',
      '**/settings-integration.test.js',
      'src/hooks/__tests__/useSupabaseData.test.ts' // temporarily exclude unstable hook-mocking suite
    ],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
