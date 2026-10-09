import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

// GPU olmayan ortamlarda (CI) WebGL için yazılımsal çizici
const webglArgs = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, launchOptions: { args: webglArgs } },
      testIgnore: /mobile\.spec/,
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], launchOptions: { args: webglArgs } },
      testMatch: /mobile\.spec/,
    },
  ],
  webServer: {
    command: `node scripts/serve.mjs ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
  },
});
