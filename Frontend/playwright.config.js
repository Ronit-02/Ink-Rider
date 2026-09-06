import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

const frontendRoot = path.resolve(import.meta.dirname)
const backendRoot = path.resolve(frontendRoot, '../Backend')
const e2eEnv = {
  ...process.env,
  NODE_ENV: 'test',
  FRONTEND_URL: 'http://127.0.0.1:3000',
  VITE_API_URL: 'http://127.0.0.1:8000',
}

const managedWebServers = [
  {
    command: 'node server.js',
    cwd: backendRoot,
    url: 'http://127.0.0.1:8000/api/post/feed?limit=1',
    timeout: 120_000,
    env: e2eEnv,
    reuseExistingServer: false,
  },
  {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 3000',
    cwd: frontendRoot,
    url: 'http://127.0.0.1:3000/',
    timeout: 120_000,
    env: e2eEnv,
    reuseExistingServer: false,
  },
]

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  // Several authenticated flows intentionally exercise the shared seeded demo
  // account. Keep browser verification deterministic instead of interleaving
  // mutations from multiple workers against that fixture.
  workers: 1,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // CI owns a clean pair of servers. Local runs may point at already-warmed
  // services with E2E_BASE_URL, avoiding duplicate Windows child processes and
  // making browser failures distinguishable from cold Vite startup.
  webServer: process.env.E2E_BASE_URL ? undefined : managedWebServers,
})
