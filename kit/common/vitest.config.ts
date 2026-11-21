/**
 * Vitest configuration.
 * Standard: https://qiheme.github.io/#/standards/testing
 *
 * Coverage is a hard floor, not an aspiration: every metric is pinned at 100%
 * and `npm run test:coverage` (pre-push hook and CI) fails below it. Plain
 * `npm test` does not enforce the thresholds.
 *
 * Full-stack apps keep this file separate from vite.config.ts: the TanStack
 * Start and Nitro plugins drive full builds and must not run under the test
 * runner. Web apps and libraries add `plugins: [react()]` here.
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // `node` for pure logic, server code and CLIs. A component test opts in
    // per file with a `// @vitest-environment jsdom` docblock.
    // Web apps and libraries: change this to 'jsdom' and add
    //   setupFiles: ['./src/test/setup.ts']   (imports @testing-library/jest-dom/vitest)
    environment: 'node',
    // Tests sit next to the code in src/. Static sites keep them in tests/
    // (their end-to-end specs are *.spec.ts under tests/e2e, so they don't
    // match). Tools that ship with the repo live in scripts/<tool>/.
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}', 'scripts/**/*.test.{ts,js}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // A folder that does not exist is ignored, so one config fits every repo.
      include: ['src/**/*.{ts,tsx}', 'scripts/**/*.{ts,js}'],
      // Every exclusion needs a reason a reviewer would accept, written here.
      // When a coverage gap appears, ask what behaviour is untested and add
      // that test. Do not exclude the file.
      exclude: [
        '**/*.test.{ts,tsx,js}',
        // Tool entry points: they build the real file system, network and
        // clock, then hand off. Every decision is in the modules beside them.
        'scripts/**/bin/**',
        // Test helpers and setup.
        'src/test/**',
        // Entry point: mounts the app and nothing else.
        'src/main.tsx',
        // Type-only files: nothing executes.
        'src/**/*.d.ts',
        'src/**/types.ts',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
