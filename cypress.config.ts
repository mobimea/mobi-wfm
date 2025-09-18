import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://192.168.100.46:5176',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{ts,tsx}',
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
    },
  },
});
