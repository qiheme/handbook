/**
 * ESLint flat config. Run with `npm run lint` (zero warnings allowed).
 * Standard: https://qiheme.github.io/#/standards/stack
 *
 * Needs: eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-jsdoc globals
 */
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import jsdoc from 'eslint-plugin-jsdoc'
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
      // Front-End Checklist, Critical: never run strings as code.
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      // A leading underscore marks a deliberately unused name.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // Web projects (D27): every export in src/ has a JSDoc comment, with no
  // types in it (TypeScript owns them). Tests, stories and test setup are
  // exempt. Other blueprints may delete this block.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/*.test.*', '**/*.stories.*', 'src/test/**'],
    extends: [jsdoc.configs['flat/recommended-typescript-error']],
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          // Off, so `eslint --fix` in the commit hook cannot satisfy the
          // rule by inserting an empty comment.
          enableFixer: false,
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            MethodDefinition: true,
          },
          contexts: ['TSTypeAliasDeclaration', 'TSInterfaceDeclaration', 'TSEnumDeclaration'],
        },
      ],
    },
  },
])
