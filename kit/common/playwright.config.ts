/**
 * Playwright configuration.
 * Standard: https://qiheme.github.io/#/standards/testing
 *
 * End-to-end tests run against the BUILT app (`npm run build` first), served
 * by the preview server, so they exercise what actually ships. CI runs them
 * after the build step; a failure fails CI, which blocks both the PR preview
 * and the production deploy.
 */
import { defineConfig, devices } from '@playwright/test'

const CI = !!process.env.CI
// Not the dev server's port: `npm run dev` can stay up while the suite runs,
// and the tests can never hit it by accident.
const PORT = 4322

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // No waiting on animations.
    reducedMotion: 'reduce',
    // Cloud sessions ship their own Chromium; never run `playwright install`
    // there. Unset locally and in CI, where Playwright's own browser is used.
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // Below the breakpoint where the layout changes.
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    // Always start a fresh preview of the build, locally too: reusing whatever
    // is already listening could test a stale build or some other server. If
    // the port is taken, Playwright fails with a clear error instead.
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
