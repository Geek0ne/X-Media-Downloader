import { defineConfig } from 'vitest/config';

// 只跑根目录的单测；e2e/ 是 Playwright 的地盘，互不干扰
export default defineConfig({
  test: {
    include: ['utils.test.js'],
  },
});
