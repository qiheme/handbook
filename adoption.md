# Adoption

Where each existing repo stands against the standard, and the order to close the gaps in.

Surveyed on 2026-11-21 from each repo's default branch. This page holds stack-level facts only.

To check one repo now, run the conformance script in it (`/handbook-audit`, or see [How an agent meets the handbook](standards/agents.md#how-an-agent-meets-the-handbook)). The script was run against every repo below on 2026-11-22 and this page agrees with it.

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
| `setup-scripts` | private | [CLI and scripts](blueprints/cli-and-scripts.md) (shell) | 🟡 | No `CLAUDE.md`, issue forms or PR template |
| `stock-cerebro-client` | public | none (2022 Create React App) | 🔴 | Being retired: its features move into `easy-finances`, then it is archived (D13) |
| `qiheme.github.io` | public | Docs (this handbook) | 🟡 | Default branch is `master` |

## Detail

| Standard | wish-list | easy-finances | Travel-OS | cloud129-site | cobalt | portfolio |
| --- | --- | --- | --- | --- | --- | --- |
| TypeScript strict | 🟢 | 🔴 JavaScript | 🟢 | 🟡 TypeScript, on Astro's `base` preset, which is not strict | 🟢 | 🟢 |
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
| Every merge tagged; deploy only from the tag (Proposed, D21. Cells inferred from the kit these repos match; not re-checked) | 🔴 none yet | 🔴 tags only bumps; deploys the commit | 🔴 none | 🔴 tags only bumps; deploys the commit | — | 🔴 none |
| Migrations in CI and on release | 🟡 CI only | 🟢 both | 🔴 applied by hand | — | — | — |
| [Front-End Checklist](standards/frontend-checklist.md): audited, `quality.spec.ts` in CI | 🔴 not audited | 🔴 not audited | 🔴 not audited | 🔴 not audited | 🔴 not audited | 🔴 not audited |
| Storybook builds in CI, a story per component (D26) | not checked | not checked | not checked | — static site | 🟡 Storybook 8 | — static site |
| JSDoc on every export, `eslint-plugin-jsdoc` in the lint (D27) | not checked | not checked | not checked | not checked | not checked | not checked |
| `CLAUDE.md` | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Agent pointer files, not copies | 🟡 none | 🔴 a copy | 🔴 a copy | 🔴 none | 🔴 a copy | 🔴 none |
| `verify` skill | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| Issue forms + PR template | 🟢 | 🟡 forms only | 🔴 | 🔴 | 🟡 PR template only | 🔴 |
| Default branch `main` | 🟢 | 🟢 | 🟢 | 🔴 `master` | 🟢 | 🔴 `master` |
| Conventional commits with scope | 🟢 | 🟡 not required | 🟡 older `type(#N):` form | 🟡 not required | 🟢 | 🟡 not required |

`setup-scripts` meets the shell blueprint: `shellcheck`, `bats`, one `test.sh`, CI on macOS, pure decision functions. It lacks the files every repo needs: a `CLAUDE.md`, agent pointer files, issue forms and a PR template.

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
| 8 | Update the cloud environment's setup script to install one Node version, and to point every session at this handbook | setup-scripts | XS |
| 8a | Install the handbook skills and run `/handbook-audit` to get the repo's exact list | all | XS |

### Wave 2: close the quality gaps

| # | Change | Repo | Size |
| --- | --- | --- | --- |
| 9 | Add ESLint (flat config) | cobalt, cloud129-site, portfolio | S each |
| 10 | Move to the ESLint flat config | easy-finances | S |
| 11 | Coverage gate on `src/lib/` | cloud129-site | S |
| 12 | Tests, CI, and `@q-labs/cobalt/tokens` instead of the copied file | portfolio | M |
| 13 | Update Cobalt to 0.3 | wish-list, cloud129-site | XS to S |
| 14 | Add a `verify` skill | every repo that runs | XS each |
| 15 | Add `quality.spec.ts` and `_headers` from the kit; fix what the spec reports | every repo with pages | S each, more where it finds a lot |
| 16 | Audit the public sites against every Critical and High rule of the [Front-End Checklist](standards/frontend-checklist.md) | cloud129-site, portfolio | M each |

### Wave 3: one host

| # | Change | Repo | Size |
| --- | --- | --- | --- |
| 17 | Vercel → Netlify: drop the adapter, add the three workflows | portfolio | S |
| 18 | Move `api/` and the daily cron to Supabase Edge Functions, then Vercel → Netlify, then add the release workflow and automatic migrations. Steps: [Functions](blueprints/functions.md#moving-off-vercel-functions) | Travel-OS | L |
| 19 | First deploy: choose the host, prove the pipeline for a server-rendered app, update the blueprint | wish-list | M to L |

### Wave 4: the long ones

| # | Change | Repo | Size |
| --- | --- | --- | --- |
| 20 | JavaScript → TypeScript, file by file, starting with the pure modules | easy-finances | L |
| 21 | Adopt Cobalt and map its tokens into Tailwind | easy-finances | L |
| 22 | Tailwind token mapping; TanStack Query for server data | Travel-OS | M each. Optional: do it when those areas are next touched |
| 23 | Framework majors: React 19, Vite 8, Vitest 5, Astro 7, Storybook 10 | where behind | S to M each. Dependabot would turn this into a steady trickle |

### Not worth doing

| Change | Why not |
| --- | --- |
| Rename existing migration files to a new scheme | Risk to applied history for no gain. The existing runner is tested |
| Replace React Router in a working app | Routing rewrites are expensive and change nothing for users |
| Rewrite plain CSS on tokens as Tailwind | It already uses the tokens. Convert a file when it is next rewritten |
| Modernise `stock-cerebro-client` | Untouched since 2022 on an unmaintained toolchain. Its features are being rebuilt inside `easy-finances` instead (D13), and the repo archived afterwards |

## Tracking

Every gap is a GitHub issue in its repo. An audit files one Task issue per required rule that is not met, all sub-issues of one tracking issue titled "Handbook audit: bring `<repo>` up to the Engineering Handbook standard". That tracking issue is the live list for a repo; this page is the overview. When a repo closes a gap, its issue closes with the pull request, and this page is updated in the handbook.
