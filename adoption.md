# Adoption

Where each existing repo stands against the standard, and the order to close the gaps in.

Surveyed on 2026-11-21 from each repo's default branch. This page holds stack-level facts only.

Status: 🟢 meets the standard · 🟡 partly, or a small fix · 🔴 does not · — not applicable.

## At a glance

| Repo | Visibility | Blueprint | Overall | Biggest gap |
| --- | --- | --- | --- | --- |
| `wish-list` | private | [Full-stack app](blueprints/full-stack-app.md) | 🟡 | No deploy pipeline yet |
| `easy-finances` | private | [Web app](blueprints/web-app.md) + [Functions](blueprints/functions.md) + [CLI](blueprints/cli-and-scripts.md) | 🟡 | JavaScript, no Cobalt |
| `Travel-OS` | public | [Web app](blueprints/web-app.md) | 🟡 | Hosted on Vercel, with server code in Vercel Functions |
| `cloud129-site` | private | [Static site](blueprints/static-site.md) | 🟡 | No coverage gate, no linter, no hooks |
| `cobalt` | public | [Library](blueprints/library.md) | 🟡 | No linter, no hooks |
| `portfolio` | public | [Static site](blueprints/static-site.md) | 🔴 | No tests, no CI; copied tokens; Vercel |
| `setup-scripts` | private | [CLI and scripts](blueprints/cli-and-scripts.md) (shell) | 🟢 | No `CLAUDE.md` |
| `stock-cerebro-client` | public | none (2022 Create React App) | 🔴 | Unmaintained stack. Recommend archiving |
| `qiheme.github.io` | public | Docs (this handbook) | 🟡 | Default branch is `master` |

## Detail

| Standard | wish-list | easy-finances | Travel-OS | cloud129-site | cobalt | portfolio |
| --- | --- | --- | --- | --- | --- | --- |
| TypeScript strict | 🟢 | 🔴 JavaScript | 🟢 | 🟢 | 🟢 | 🟢 |
| Node 24, `.nvmrc` = `24` | 🟡 `22` | 🟡 `24.14.1` exact | 🟢 | 🔴 no `.nvmrc`; CI says 22 | 🟡 `22.22.2` exact | 🟡 `22` |
| CI reads `.nvmrc` | 🟢 | 🔴 hard-coded | 🔴 hard-coded | 🔴 hard-coded | 🟢 | — no CI |
| Framework on baseline | 🟢 React 19, Vite 8 | 🟡 React 18, Vite 5 | 🟡 React 18, Vite 5 | 🟡 Astro 5 | 🟡 Vite 6, Storybook 8 | 🟡 Astro 5 |
| Cobalt | 🟡 0.2 | 🔴 not used | 🟢 0.3 | 🟡 0.2, tokens only | — | 🔴 copied token file |
| Tailwind on Cobalt tokens | 🟢 | 🟡 Tailwind, no tokens | 🟡 plain CSS on tokens | 🟡 plain CSS on tokens | — | 🟡 plain CSS |
| Vitest, 100% gate | 🟢 v5 | 🟢 v4 | 🟢 v2 | 🔴 v3, no coverage gate | 🟢 v3 | 🔴 no tests |
| Script names (`test` vs `test:coverage`) | 🟢 | 🟢 | 🟡 `test` runs coverage; no `typecheck` | 🟡 `check`, no `lint` | 🟡 `test` is watch mode; no `lint` | 🔴 |
| Playwright | — not yet | 🔴 none | 🟢 with visual snapshots | 🟢 desktop + mobile | — Storybook | 🔴 |
| ESLint flat, zero warnings | 🟢 | 🔴 ESLint 8, legacy config | 🟢 | 🔴 none | 🔴 none | 🔴 none |
| Hooks: lint on commit, gates on push | 🟢 | 🟡 push runs tests without coverage | 🟡 push only; no lint-staged | 🔴 none | 🔴 none | 🔴 none |
| CI | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 none |
| CI secret is `COBALT_PACKAGES_TOKEN` | 🟢 | — | 🟡 `NPM_TOKEN` | 🟢 | — | — |
| `.npmrc` holds only the registry line | 🟢 | — | 🟢 | 🟡 also an auth line (an env-var reference, no secret) | 🟢 | — |
| Netlify, built on Actions | 🔴 not deployed | 🟢 reference | 🔴 Vercel | 🟢 reference | — Pages | 🔴 Vercel |
| PR preview | 🔴 | 🟢 | 🟡 not in the repo; left to Vercel | 🟢 | — | 🟡 not in the repo; left to Vercel |
| Release: tag on merge | 🔴 none yet | 🟢 | 🔴 none | 🟢 | 🟢 Changesets | 🔴 none |
| Migrations in CI and on release | 🟡 CI only | 🟢 both | 🔴 applied by hand | — | — | — |
| `CLAUDE.md` | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Agent pointer files, not copies | 🟡 none | 🔴 a copy | 🔴 a copy | 🔴 none | 🔴 a copy | 🔴 none |
| `verify` skill | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| Issue forms + PR template | 🟢 | 🟡 forms only | 🔴 | 🔴 | 🟡 PR template only | 🔴 |
| Default branch `main` | 🟢 | 🟢 | 🟢 | 🔴 `master` | 🟢 | 🔴 `master` |
| Conventional commits with scope | 🟢 | 🟡 not required | 🟡 older `type(#N):` form | 🟡 not required | 🟢 | 🟡 not required |

`setup-scripts` meets the shell blueprint: `shellcheck`, `bats`, one `test.sh`, CI on macOS, pure decision functions. It lacks a `CLAUDE.md`.

## What is consistent already

Worth saying, because it is most of the hard part:

- Issue first and test first are written into every repo that has a rulebook.
- 100% coverage is enforced in four repos.
- Every app with data uses Supabase with row-level security.
- Every tested repo uses Vitest. Every app uses React and Vite. Both content sites use Astro.
- The Netlify pipeline (untrusted build, trusted preview, tag-and-deploy release) exists twice and matches.
- npm everywhere.

## Suggested order

Ordered by leverage: cheap changes that touch every repo first, large single-repo migrations last. Sizes are rough estimates on the scale the issue forms use (XS under two hours, S half a day, M a weekend, L several weekends). No dates: each item becomes an issue in its repo, and gets a date when it is scheduled.

### Wave 1: make every repo look the same from outside

Small, mechanical, low risk. One PR per repo.

| # | Change | Repos | Size each |
| --- | --- | --- | --- |
| 1 | `.nvmrc` = `24`, `engines.node` `>=24`, CI uses `node-version-file` | all six Node repos | XS |
| 2 | Script names: add `typecheck`, `lint`, `test:coverage`; make `test` a single run | Travel-OS, cloud129-site, cobalt, portfolio | XS |
| 3 | Hooks from the kit | all but wish-list | XS |
| 4 | `CLAUDE.md` from the template; replace Copilot copies with pointers; add `AGENTS.md` | all | S |
| 5 | Issue forms and PR template from the kit | all but wish-list | XS |
| 6 | Rename the CI secret to `COBALT_PACKAGES_TOKEN`; remove the auth line from the committed `.npmrc` | Travel-OS, cloud129-site | XS |
| 7 | Rename `master` to `main` | cloud129-site, portfolio, this repo | XS, but update workflow branch names and the CMS config in the same PR |
| 8 | Update the cloud environment's setup script to install one Node version | setup-scripts | XS |

### Wave 2: close the quality gaps

| # | Change | Repo | Size |
| --- | --- | --- | --- |
| 9 | Add ESLint (flat config) | cobalt, cloud129-site, portfolio | S each |
| 10 | Move to the ESLint flat config | easy-finances | S |
| 11 | Coverage gate on `src/lib/` | cloud129-site | S |
| 12 | Tests, CI, and `@q-labs/cobalt/tokens` instead of the copied file | portfolio | M |
| 13 | Update Cobalt to 0.3 | wish-list, cloud129-site | XS to S |
| 14 | Add a `verify` skill | every repo that runs | XS each |

### Wave 3: one host

| # | Change | Repo | Size |
| --- | --- | --- | --- |
| 15 | Vercel → Netlify: drop the adapter, add the three workflows | portfolio | S |
| 16 | Move `api/` and the daily cron to Supabase Edge Functions, then Vercel → Netlify, then add the release workflow and automatic migrations. Steps: [Functions](blueprints/functions.md#moving-off-vercel-functions) | Travel-OS | L |
| 17 | First deploy: choose the host, prove the pipeline for a server-rendered app, update the blueprint | wish-list | M to L |

### Wave 4: the long ones

| # | Change | Repo | Size |
| --- | --- | --- | --- |
| 18 | JavaScript → TypeScript, file by file, starting with the pure modules | easy-finances | L |
| 19 | Adopt Cobalt and map its tokens into Tailwind | easy-finances | L |
| 20 | Tailwind token mapping; TanStack Query for server data | Travel-OS | M each. Optional: do it when those areas are next touched |
| 21 | Framework majors: React 19, Vite 8, Vitest 5, Astro 7, Storybook 10 | where behind | S to M each. Dependabot would turn this into a steady trickle |

### Not worth doing

| Change | Why not |
| --- | --- |
| Rename existing migration files to a new scheme | Risk to applied history for no gain. The existing runner is tested |
| Replace React Router in a working app | Routing rewrites are expensive and change nothing for users |
| Rewrite plain CSS on tokens as Tailwind | It already uses the tokens. Convert a file when it is next rewritten |
| Modernise `stock-cerebro-client` | Untouched since 2022 on an unmaintained toolchain. Archive it. If the idea returns, start fresh from the Web app blueprint |

## Tracking

Each row above becomes a Task issue in its repo when it is picked up. When a repo closes a gap, update its cell on this page in the same PR that updates its `CLAUDE.md`.
