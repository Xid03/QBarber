import { afterEach, vi } from 'vitest';

process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3002';
process.env.DATABASE_URL ??= 'postgresql://qflow:qflow@localhost:5432/qflow_test';
process.env.CLIENT_URL ??= 'http://localhost:5173';
process.env.JWT_SECRET ??= 'test-secret-key';
process.env.LOG_LEVEL ??= 'error';

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});
