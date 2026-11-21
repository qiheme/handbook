/**
 * ESLint flat config. Run with `npm run lint` (zero warnings allowed).
 * Standard: https://qiheme.github.io/#/standards/stack
 *
 * Needs: eslint @eslint/js typescript-eslint eslint-plugin-react-hooks globals
 */
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores([
    'dist/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'storybook-static/**',
    // Framework output and generated files. Never hand-edited.
    '.output/**',
    '.nitro/**',
    '.tanstack/**',
    '.astro/**',
    '.netlify/**',
    'drizzle/**',
    'src/routeTree.gen.ts',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  // TanStack apps: also install @tanstack/eslint-plugin-query and
  // @tanstack/eslint-plugin-router, import them, and add
  //   pluginQuery.configs['flat/recommended'],
  //   pluginRouter.configs['flat/recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // A leading underscore marks a deliberately unused name.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
])
