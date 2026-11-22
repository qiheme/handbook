/**
 * Tests for the conformance script. Run with:
 *   node --test skills/handbook-audit/scripts/
 *
 * No dependencies: Node's built-in test runner, and repositories held in memory
 * (a Map of path to file contents) so nothing touches the disk.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { audit, detectBlueprint, format, main, majorOf, memoryRepo, parseArgs } from './audit.mjs'

const json = (value) => JSON.stringify(value, null, 2)

const POINTER = '# Agent instructions\n\nRead [`CLAUDE.md`](CLAUDE.md) and follow it.\n'

const CI = `
jobs:
  check:
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
      - run: npm ci
        env:
          NODE_AUTH_TOKEN: \${{ secrets.COBALT_PACKAGES_TOKEN }}
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:coverage
      - run: npm run build
`

const VITEST = `export default { test: { coverage: { thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 } } } }`

/** A web app that meets every rule, required and proposed. */
function conformingWebApp(overrides = {}) {
  const files = {
    'CLAUDE.md': '# CLAUDE.md\n',
    'AGENTS.md': POINTER,
    '.github/copilot-instructions.md': POINTER,
    'README.md': '# App\n',
    '.nvmrc': '24\n',
    '.npmrc': '@q-labs:registry=https://npm.pkg.github.com\n',
    '.gitignore': 'node_modules\n.env\n.env.*\n!.env.example\n',
    'package-lock.json': '{}',
    'package.json': json({
      type: 'module',
      engines: { node: '>=24' },
      scripts: {
        dev: 'vite',
        build: 'vite build',
        lint: 'eslint . --max-warnings 0',
        typecheck: 'tsc --noEmit',
        test: 'vitest run',
        'test:coverage': 'vitest run --coverage',
        'test:e2e': 'playwright test',
      },
      dependencies: { react: '^19.3.0', '@q-labs/cobalt': '^0.3.0' },
      devDependencies: {
        vite: '^8.3.4',
        vitest: '^5.0.3',
        eslint: '^10.12.0',
        tailwindcss: '^4.3.3',
      },
    }),
    'tsconfig.json':
      '{\n  // comments are allowed here\n  "compilerOptions": { "strict": true, },\n}\n',
    'eslint.config.js': 'export default []\n',
    'vitest.config.ts': VITEST,
    '.husky/pre-commit': 'npx lint-staged\n',
    '.husky/pre-push': 'npm run typecheck\nnpm run test:coverage\n',
    '.github/workflows/ci.yml': CI,
    '.github/workflows/deploy-preview.yml': 'name: Deploy Preview\n',
    '.github/workflows/release.yml': 'name: Release & Deploy\n',
    'netlify.toml': '[build]\n  publish = "dist"\n',
    '.github/pull_request_template.md': '## Summary\n',
    '.github/ISSUE_TEMPLATE/feature.yml': 'name: Feature\n',
    '.github/ISSUE_TEMPLATE/bug.yml': 'name: Bug\n',
    '.github/ISSUE_TEMPLATE/task.yml': 'name: Task\n',
    '.claude/skills/verify/SKILL.md': '---\nname: verify\n---\n',
    'e2e/quality.spec.ts': '// spec\n',
    'public/_headers': '/*\n  X-Content-Type-Options: nosniff\n',
    '.prettierrc.json': '{}',
    '.github/dependabot.yml': 'version: 2\n',
  }
  for (const [path, content] of Object.entries(overrides)) {
    if (content === null) delete files[path]
    else files[path] = content
  }
  return memoryRepo(files)
}

const statusOf = (result, id) => result.checks.find((c) => c.id === id)?.status
const withPackage = (change) => {
  const repo = conformingWebApp()
  const pkg = JSON.parse(repo.read('package.json'))
  change(pkg)
  return conformingWebApp({ 'package.json': json(pkg) })
}

describe('detectBlueprint', () => {
  const deps = (dependencies, extra = {}) =>
    memoryRepo({ 'package.json': json({ dependencies, ...extra }) })

  it('reads the blueprint from the dependencies', () => {
    assert.equal(detectBlueprint(deps({ astro: '^5.0.0' })), 'static-site')
    assert.equal(
      detectBlueprint(deps({ '@tanstack/react-start': '^1.0.0', react: '^19.0.0' })),
      'full-stack-app',
    )
    assert.equal(detectBlueprint(deps({ react: '^19.0.0', vite: '^8.0.0' })), 'web-app')
    assert.equal(detectBlueprint(deps({ react: '^16.0.0', 'react-scripts': '3.4.3' })), 'web-app')
    assert.equal(detectBlueprint(deps({ commander: '^12.0.0' })), 'cli')
  })

  it('treats a published package as a library, even when it uses React and Vite', () => {
    assert.equal(
      detectBlueprint(deps({ react: '^18.0.0', vite: '^6.0.0' }, { publishConfig: {} })),
      'library',
    )
    assert.equal(detectBlueprint(deps({ vite: '^6.0.0', '@changesets/cli': '^2.0.0' })), 'library')
  })

  it('falls back to shell, then unknown, when there is no package.json', () => {
    assert.equal(detectBlueprint(memoryRepo({ 'setup.sh': '#!/bin/bash\n' })), 'shell')
    assert.equal(detectBlueprint(memoryRepo({ 'README.md': '# x\n' })), 'unknown')
  })

  it('reports unknown when package.json is not valid JSON', () => {
    assert.equal(detectBlueprint(memoryRepo({ 'package.json': '{ nope' })), 'unknown')
  })
})

describe('majorOf', () => {
  it('reads the major version out of a range', () => {
    assert.equal(majorOf('^8.3.4'), 8)
    assert.equal(majorOf('~19.0.0'), 19)
    assert.equal(majorOf('3.4.3'), 3)
    assert.equal(majorOf('>=18'), 18)
    assert.equal(majorOf('npm:@typescript/typescript6@^6.0.2'), 6)
  })

  it('returns null when there is no version to read', () => {
    assert.equal(majorOf('latest'), null)
    assert.equal(majorOf(undefined), null)
  })
})

describe('audit: a conforming web app', () => {
  const result = audit(conformingWebApp())

  it('detects the blueprint', () => {
    assert.equal(result.blueprint, 'web-app')
    assert.equal(result.blueprintSource, 'detected')
  })

  it('passes every check, required and proposed', () => {
    const failing = result.checks
      .filter((c) => c.status === 'fail')
      .map((c) => `${c.id}: ${c.detail}`)
    assert.deepEqual(failing, [])
    assert.equal(result.ok, true)
    // the only rules that do not apply to a web app are the shell ones
    assert.deepEqual(
      result.checks.filter((c) => c.status === 'na').map((c) => c.id),
      ['shell-tests', 'shell-ci'],
    )
  })

  it('gives every check a level, a title and a handbook page', () => {
    for (const check of result.checks) {
      assert.match(check.level, /^(required|proposed)$/, check.id)
      assert.ok(check.title.length > 0, check.id)
      assert.match(check.page, /^(standards|blueprints)\/[a-z-]+\.md$/, check.id)
    }
  })

  it('has no duplicate check ids', () => {
    const ids = result.checks.map((c) => c.id)
    assert.equal(new Set(ids).size, ids.length)
  })
})

describe('audit: each rule fails when it is broken', () => {
  /** [check id, what to change in the conforming repo, text the detail must contain] */
  const cases = [
    ['rulebook', { 'CLAUDE.md': null }, 'CLAUDE.md'],
    ['agent-pointers', { 'AGENTS.md': null }, 'AGENTS.md is missing'],
    [
      'agent-pointers',
      { '.github/copilot-instructions.md': '# Rules\n' + 'A rule.\n'.repeat(30) },
      'copy',
    ],
    ['agent-pointers', { 'AGENTS.md': '# Agents\n\nDo good work.\n' }, 'does not point'],
    ['readme', { 'README.md': null }, 'README.md'],
    ['node-pin', { '.nvmrc': '24.14.1\n' }, '24.14.1'],
    ['node-pin', { '.nvmrc': null }, 'missing'],
    ['lockfile', { 'package-lock.json': null }, 'package-lock.json'],
    ['lockfile', { 'yarn.lock': '' }, 'yarn.lock'],
    [
      'npmrc-no-token',
      { '.npmrc': '//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}\n' },
      '_authToken',
    ],
    ['env-ignored', { '.gitignore': 'node_modules\n' }, '.env'],
    ['env-ignored', { '.gitignore': null }, '.gitignore'],
    [
      'typescript-strict',
      { 'tsconfig.json': '{ "compilerOptions": { "strict": false } }' },
      'strict',
    ],
    ['typescript-strict', { 'tsconfig.json': null }, 'tsconfig'],
    ['eslint-flat', { 'eslint.config.js': null }, 'eslint.config'],
    ['eslint-flat', { '.eslintrc.cjs': 'module.exports = {}' }, '.eslintrc.cjs'],
    [
      'coverage-100',
      { 'vitest.config.ts': VITEST.replace('branches: 100', 'branches: 90') },
      'branches',
    ],
    ['coverage-100', { 'vitest.config.ts': null }, 'no Vitest'],
    ['hooks', { '.husky/pre-commit': null }, 'pre-commit'],
    ['hooks', { '.husky/pre-push': 'npm test\n' }, 'pre-push'],
    ['hooks', { '.husky/pre-push': null }, 'pre-push'],
    ['ci', { '.github/workflows/ci.yml': null }, 'ci.yml'],
    [
      'ci',
      { '.github/workflows/ci.yml': CI.replace('node-version-file: .nvmrc', 'node-version: 24') },
      'node-version-file',
    ],
    [
      'ci',
      { '.github/workflows/ci.yml': CI.replace('npm run test:coverage', 'npm test') },
      'test:coverage',
    ],
    [
      'ci-secret-name',
      { '.github/workflows/ci.yml': CI.replace('COBALT_PACKAGES_TOKEN', 'NPM_TOKEN') },
      'COBALT_PACKAGES_TOKEN',
    ],
    ['netlify-pipeline', { '.github/workflows/release.yml': null }, 'release.yml'],
    ['no-vercel', { 'vercel.json': '{}' }, 'vercel.json'],
    ['pr-template', { '.github/pull_request_template.md': null }, 'pull_request_template'],
    ['issue-forms', { '.github/ISSUE_TEMPLATE/task.yml': null }, 'task.yml'],
    ['verify-skill', { '.claude/skills/verify/SKILL.md': null }, 'verify'],
    ['quality-spec', { 'e2e/quality.spec.ts': null }, 'quality.spec.ts'],
    [
      'security-headers',
      { 'public/_headers': '/assets/*\n  Cache-Control: public\n' },
      'X-Content-Type-Options',
    ],
    ['security-headers', { 'public/_headers': null }, '_headers'],
    ['prettier', { '.prettierrc.json': null }, 'Prettier'],
    ['dependabot', { '.github/dependabot.yml': null }, 'dependabot.yml'],
  ]

  for (const [id, overrides, expected] of cases) {
    it(`${id}: ${Object.keys(overrides).join(', ')}`, () => {
      const result = audit(conformingWebApp(overrides))
      const check = result.checks.find((c) => c.id === id)
      assert.equal(check.status, 'fail', check.detail)
      assert.ok(check.detail.includes(expected), `"${check.detail}" should mention "${expected}"`)
    })
  }

  it('accepts the other names a pointer file, a PR template and the spec can have', () => {
    const result = audit(
      conformingWebApp({
        '.github/copilot-instructions.md': null,
        '.github/pull_request_template.md': null,
        '.github/PULL_REQUEST_TEMPLATE.md': '## Summary\n',
        'e2e/quality.spec.ts': null,
        'tests/e2e/quality.spec.ts': '// spec\n',
        'tsconfig.json': '{ "extends": "astro/tsconfigs/strict" }',
        'eslint.config.js': null,
        'eslint.config.mjs': 'export default []\n',
      }),
    )
    for (const id of [
      'agent-pointers',
      'pr-template',
      'quality-spec',
      'typescript-strict',
      'eslint-flat',
    ]) {
      assert.equal(statusOf(result, id), 'pass', id)
    }
  })

  it('a repo with no .npmrc has no token to leak', () => {
    assert.equal(statusOf(audit(conformingWebApp({ '.npmrc': null })), 'npmrc-no-token'), 'pass')
  })

  it('finds strict mode in the tsconfig a project file refers to', () => {
    const result = audit(
      conformingWebApp({
        'tsconfig.json': '{ "files": [], "references": [{ "path": "./tsconfig.app.json" }] }',
        'tsconfig.app.json': '{ "compilerOptions": { "strict": true } }',
      }),
    )
    assert.equal(statusOf(result, 'typescript-strict'), 'pass')
  })

  it('reads the coverage thresholds from vite.config when there is no vitest.config', () => {
    const result = audit(conformingWebApp({ 'vitest.config.ts': null, 'vite.config.ts': VITEST }))
    assert.equal(statusOf(result, 'coverage-100'), 'pass')
  })
})

describe('audit: package.json rules', () => {
  it('engines', () => {
    const result = audit(withPackage((pkg) => (pkg.engines.node = '>=22.12.0')))
    assert.equal(statusOf(result, 'engines'), 'fail')
    assert.equal(statusOf(audit(withPackage((pkg) => delete pkg.engines)), 'engines'), 'fail')
  })

  it('es modules', () => {
    assert.equal(statusOf(audit(withPackage((pkg) => delete pkg.type)), 'esm'), 'fail')
  })

  it('script names', () => {
    const result = audit(withPackage((pkg) => delete pkg.scripts.typecheck))
    const check = result.checks.find((c) => c.id === 'scripts')
    assert.equal(check.status, 'fail')
    assert.ok(check.detail.includes('typecheck'))
    assert.equal(statusOf(audit(withPackage((pkg) => delete pkg.scripts)), 'scripts'), 'fail')
  })

  it('`test` is a single fast run, not a watch and not the coverage gate', () => {
    assert.equal(
      statusOf(
        audit(withPackage((pkg) => (pkg.scripts.test = 'vitest run --coverage'))),
        'test-script',
      ),
      'fail',
    )
    assert.equal(
      statusOf(audit(withPackage((pkg) => (pkg.scripts.test = 'vitest'))), 'test-script'),
      'fail',
    )
    assert.equal(
      statusOf(audit(withPackage((pkg) => delete pkg.scripts.test)), 'test-script'),
      'fail',
    )
  })

  it('Cobalt is installed', () => {
    const result = audit(withPackage((pkg) => delete pkg.dependencies['@q-labs/cobalt']))
    assert.equal(statusOf(result, 'cobalt'), 'fail')
    // with no Cobalt, there is no private registry to authenticate against
    assert.equal(
      statusOf(
        audit(withPackage((pkg) => delete pkg.dependencies['@q-labs/cobalt'])),
        'ci-secret-name',
      ),
      'pass',
    )
  })

  it('no Vercel adapter', () => {
    const result = audit(withPackage((pkg) => (pkg.dependencies['@astrojs/vercel'] = '^8.0.0')))
    assert.ok(result.checks.find((c) => c.id === 'no-vercel').detail.includes('@astrojs/vercel'))
  })

  it('framework versions two or more majors behind the baseline', () => {
    const behind = audit(withPackage((pkg) => (pkg.devDependencies.vitest = '^2.1.9')))
    const check = behind.checks.find((c) => c.id === 'versions')
    assert.equal(check.status, 'fail')
    assert.ok(check.detail.includes('vitest 2'))
    // one major behind is allowed
    assert.equal(
      statusOf(audit(withPackage((pkg) => (pkg.dependencies.react = '^18.3.1'))), 'versions'),
      'pass',
    )
  })
})

describe('audit: what counts and what does not', () => {
  it('a failed proposed rule is reported but does not fail the audit', () => {
    const result = audit(conformingWebApp({ '.prettierrc.json': null, 'public/_headers': null }))
    assert.equal(result.ok, true)
    assert.equal(result.summary.proposed, 2)
    assert.equal(result.summary.fail, 0)
  })

  it('a failed required rule fails the audit', () => {
    const result = audit(conformingWebApp({ '.nvmrc': '22\n' }))
    assert.equal(result.ok, false)
    assert.equal(result.summary.fail, 1)
  })

  it('the blueprint can be given instead of detected', () => {
    const result = audit(conformingWebApp(), { blueprint: 'static-site' })
    assert.equal(result.blueprint, 'static-site')
    assert.equal(result.blueprintSource, 'given')
  })

  it('a library is not asked for a deploy pipeline, Cobalt or page checks', () => {
    const repo = withPackage((pkg) => {
      pkg.publishConfig = { registry: 'https://npm.pkg.github.com' }
      delete pkg.dependencies['@q-labs/cobalt']
      delete pkg.scripts['test:e2e']
    })
    const result = audit(repo)
    assert.equal(result.blueprint, 'library')
    for (const id of ['netlify-pipeline', 'cobalt', 'quality-spec', 'security-headers']) {
      assert.equal(statusOf(result, id), 'na', id)
    }
    assert.equal(statusOf(result, 'scripts'), 'pass')
  })

  it('a shell repo is checked for its rulebook, a test entry point and CI only', () => {
    const bare = audit(memoryRepo({ 'setup.sh': '#!/bin/bash\n', 'README.md': '# x\n' }))
    assert.equal(bare.blueprint, 'shell')
    assert.equal(statusOf(bare, 'rulebook'), 'fail')
    assert.equal(statusOf(bare, 'shell-tests'), 'fail')
    assert.equal(statusOf(bare, 'shell-ci'), 'fail')
    assert.equal(statusOf(bare, 'node-pin'), 'na')

    const good = audit(
      memoryRepo({
        'setup.sh': '#!/bin/bash\n',
        'test.sh': 'shellcheck *.sh && bats tests\n',
        'README.md': '# x\n',
        'CLAUDE.md': '# rules\n',
        'AGENTS.md': POINTER,
        '.github/workflows/test.yml': 'name: test\n',
        '.github/pull_request_template.md': '## Summary\n',
        '.github/ISSUE_TEMPLATE/feature.yml': 'name: Feature\n',
        '.github/ISSUE_TEMPLATE/bug.yml': 'name: Bug\n',
        '.github/ISSUE_TEMPLATE/task.yml': 'name: Task\n',
      }),
    )
    assert.equal(good.ok, true, json(good.checks.filter((c) => c.status === 'fail')))
  })

  it('an unknown repo is still checked for the files every repo needs', () => {
    const result = audit(memoryRepo({ 'notes.txt': 'hi' }))
    assert.equal(result.blueprint, 'unknown')
    assert.equal(statusOf(result, 'rulebook'), 'fail')
    assert.equal(statusOf(result, 'readme'), 'fail')
  })
})

describe('format', () => {
  it('lists failures first, each with the page that states the rule', () => {
    const text = format(
      audit(conformingWebApp({ '.nvmrc': '22\n', '.prettierrc.json': null })),
      'my-app',
    )
    assert.match(text, /Handbook audit: my-app/)
    assert.match(text, /Blueprint: web-app \(detected\)/)
    assert.match(text, /FAIL\s+node-pin/)
    assert.match(text, /standards\/stack\.md/)
    assert.match(text, /TODO\s+prettier/)
    assert.ok(text.indexOf('FAIL') < text.indexOf('TODO'))
    assert.match(text, /1 required rule not met, 1 proposed rule not met/)
  })

  it('says so when everything passes, and can list the passes', () => {
    const result = audit(conformingWebApp())
    assert.match(format(result, 'x'), /Meets every rule that was checked/)
    assert.doesNotMatch(format(result, 'x'), /PASS/)
    assert.match(format(result, 'x', { all: true }), /PASS\s+rulebook/)
  })
})

describe('parseArgs and main', () => {
  it('parses a path, a blueprint and the flags', () => {
    assert.deepEqual(parseArgs(['../app', '--json', '--blueprint', 'library', '--all']), {
      path: '../app',
      json: true,
      all: true,
      blueprint: 'library',
      help: false,
    })
    assert.deepEqual(parseArgs([]), {
      path: '.',
      json: false,
      all: false,
      blueprint: undefined,
      help: false,
    })
    assert.equal(parseArgs(['--help']).help, true)
  })

  const run = (argv, repo) => {
    const out = []
    const code = main(argv, {
      openRepo: () => repo,
      print: (line) => out.push(line),
      name: () => 'app',
    })
    return { code, text: out.join('\n') }
  }

  it('exits 0 when the required rules are met and 1 when they are not', () => {
    assert.equal(run([], conformingWebApp()).code, 0)
    assert.equal(run([], conformingWebApp({ 'CLAUDE.md': null })).code, 1)
  })

  it('prints JSON on request', () => {
    const { code, text } = run(['--json'], conformingWebApp())
    assert.equal(code, 0)
    assert.equal(JSON.parse(text).blueprint, 'web-app')
  })

  it('prints usage for --help, and rejects a blueprint it does not know', () => {
    assert.match(run(['--help'], conformingWebApp()).text, /Usage:/)
    const bad = run(['--blueprint', 'spaceship'], conformingWebApp())
    assert.equal(bad.code, 2)
    assert.match(bad.text, /Unknown blueprint/)
  })
})

describe('memoryRepo', () => {
  it('answers exists, read and list like a folder would', () => {
    const repo = memoryRepo({ 'a/b.txt': 'x', 'a/c/d.txt': 'y', 'e.txt': 'z' })
    assert.equal(repo.exists('a/b.txt'), true)
    assert.equal(repo.exists('a'), true)
    assert.equal(repo.exists('nope'), false)
    assert.equal(repo.read('a/b.txt'), 'x')
    assert.equal(repo.read('nope'), null)
    assert.deepEqual(repo.list('a'), ['b.txt', 'c'])
    assert.deepEqual(repo.list(''), ['a', 'e.txt'])
    assert.deepEqual(repo.list('nope'), [])
  })
})
