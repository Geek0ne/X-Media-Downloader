import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:8123',
    // 关键：不访问真实网络。所有 X 接口与媒体域名都在用例里 mock
    headless: true,
  },
  webServer: {
    command: 'node server.mjs',
    port: 8123,
    reuseExistingServer: true,
  },
});
