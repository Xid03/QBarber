import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.integration.test.ts'],
    exclude: ['__tests__/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html']
    }
  }
});
