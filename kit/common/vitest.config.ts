/**
 * Vitest configuration.
 * Standard: https://qiheme.github.io/handbook/#/standards/testing
 *
 * Coverage is a hard floor, not an aspiration: every metric is pinned at 100%
 * and `npm run test:coverage` (pre-push hook and CI) fails below it. Plain
 * `npm test` does not enforce the thresholds.
 *
 * Full-stack apps keep this file separate from vite.config.ts: the TanStack
 * Start and Nitro plugins drive full builds and must not run under the test
 * runner. Web apps and libraries add `plugins: [react()]` here.
 *
 * Edge Function code that imports with Deno's `npm:` prefix (for example
 * `npm:zod@3`) needs an alias so Node resolves the installed package:
 *   resolve: { alias: [{ find: /^npm:zod@.*$/, replacement: 'zod' }] }
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // `node` for pure logic, server code and CLIs. A component test opts in
    // per file with a `// @vitest-environment jsdom` docblock.
    // Web apps and libraries: change this to 'jsdom' and add
    //   setupFiles: ['./src/test/setup.ts']   (imports @testing-library/jest-dom/vitest)
    environment: 'node',
    // Every place a blueprint puts testable code, so one config fits every
    // repo and one run gives one coverage report:
    //   src/                 next to the code
    //   tests/               static sites (their end-to-end specs are
    //                        *.spec.ts under tests/e2e, so they don't match)
    //   scripts/<tool>/      tools that ship with the repo
    //   supabase/functions/  Edge Function handlers
    include: [
      'src/**/*.test.{ts,tsx}',
      'tests/**/*.test.{ts,tsx}',
      'scripts/**/*.test.{ts,js}',
      'supabase/functions/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // A folder that does not exist is ignored.
      include: ['src/**/*.{ts,tsx}', 'scripts/**/*.{ts,js}', 'supabase/functions/**/*.ts'],
      // Every exclusion needs a reason a reviewer would accept, written here.
      // When a coverage gap appears, ask what behaviour is untested and add
      // that test. Do not exclude the file.
      exclude: [
        '**/*.test.{ts,tsx,js}',
        // Tool entry points: they build the real file system, network and
        // clock, then hand off. Every decision is in the modules beside them.
        'scripts/**/bin/**',
        // Edge Function entry points (supabase/functions/<name>/index.ts):
        // Deno.serve glue with no branches. The logic is in _shared/, which
        // is NOT excluded.
        'supabase/functions/!(_shared)/index.ts',
        'supabase/functions/__tests__/**',
        // Test helpers and setup.
        'src/test/**',
        // Entry point: mounts the app and nothing else.
        'src/main.tsx',
        // Stories (D26): review fixtures for Storybook, not shipped logic. The
        // components they render are covered by their own tests.
        'src/**/*.stories.{ts,tsx}',
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
