# The kit

Files to copy into a repo so it meets the [repo contract](../standards/repo-contract.md). They are taken from the repos where each one already works, with the project-specific parts removed.

Copy, then read each file once. The comments say what to delete and what to fill in.

## What to copy where

| Kit file | Goes to | Who needs it | After copying |
| --- | --- | --- | --- |
| [`common/CLAUDE.template.md`](common/CLAUDE.template.md) | `CLAUDE.md` | Every repo | Replace every `<PLACEHOLDER>`. List deviations |
| [`common/AGENTS.template.md`](common/AGENTS.template.md) | `AGENTS.md` | Every repo | Nothing |
| [`common/.github/copilot-instructions.md`](common/.github/copilot-instructions.md) | `.github/copilot-instructions.md` | Every repo | Nothing |
| [`common/claude-skill-verify/SKILL.template.md`](common/claude-skill-verify/SKILL.template.md) | `.claude/skills/verify/SKILL.md` | Anything that runs | Write the real commands and ports |
| The handbook skills in [`../skills/`](../skills/handbook-audit/SKILL.md) | `.claude/skills/handbook-audit/`, `.claude/skills/handbook-new-project/` | Every repo | Install with `npx skills add qiheme/qiheme.github.io --agent claude-code --skill '*' --copy`, or copy the two folders. Then run `/handbook-audit` |
| [`common/.nvmrc`](common/.nvmrc) | `.nvmrc` | Node repos | Nothing |
| [`common/.npmrc`](common/.npmrc) | `.npmrc` | Repos that install Cobalt | Nothing. Never add a token |
| [`common/.gitignore`](common/.gitignore) | `.gitignore` | Node repos | Add repo-specific entries |
| [`common/.env.example`](common/.env.example) | `.env.example` | Repos that read environment variables | List every variable the app reads |
| [`common/package.scripts.json`](common/package.scripts.json) | merged into `package.json` | Node repos | Adjust `dev`, `build`, `preview`, `typecheck` for the framework |
| [`common/eslint.config.js`](common/eslint.config.js) | `eslint.config.js` | Node repos | Add the TanStack plugins if used |
| [`common/.prettierrc.json`](common/.prettierrc.json) | `.prettierrc.json` | Node repos (Proposed) | Nothing |
| [`common/vitest.config.ts`](common/vitest.config.ts) | `vitest.config.ts` | Node repos | Set the environment. Give every exclusion a reason. Static sites: narrow coverage `include` to `src/lib/**`. Tools under `scripts/<tool>/` and Edge Function handlers under `supabase/functions/` are already discovered and covered, except their thin entry points |
| [`common/playwright.config.ts`](common/playwright.config.ts) | `playwright.config.ts` | Anything with pages | Static sites: set `testDir` to `tests/e2e` |
| [`e2e/quality.spec.ts`](e2e/quality.spec.ts) | `e2e/quality.spec.ts` (`tests/e2e/` in a static site) | Anything with pages (Proposed) | Install `@axe-core/playwright`. List every route in `PAGES`. Set `INDEXABLE` to `false` for an app behind a login |
| [`common/.husky/pre-commit`](common/.husky/pre-commit), [`pre-push`](common/.husky/pre-push) | `.husky/` | Node repos | Run `npm install` once so `prepare` installs the hooks |
| [`common/.github/pull_request_template.md`](common/.github/pull_request_template.md) | `.github/pull_request_template.md` | Every repo | Add repo-specific checklist lines |
| [`common/.github/ISSUE_TEMPLATE/`](common/.github/ISSUE_TEMPLATE/feature.yml) | `.github/ISSUE_TEMPLATE/` | Every repo | Enable Issue Types in the repo settings |
| [`common/.github/dependabot.yml`](common/.github/dependabot.yml) | `.github/dependabot.yml` | Node repos (Proposed) | Add the Dependabot secret named in the file |
| [`workflows/ci.yml`](workflows/ci.yml) | `.github/workflows/ci.yml` | Every repo with code | Delete the migrations job, or the end-to-end steps, if they do not apply. Set the build variables |
| [`workflows/deploy-preview.yml`](workflows/deploy-preview.yml) | `.github/workflows/deploy-preview.yml` | Anything deployed to Netlify | Nothing |
| [`workflows/release.yml`](workflows/release.yml) | `.github/workflows/release.yml` | Anything deployed to Netlify | Delete the migrate step if there is no database. Set the build variables |
| [`netlify/netlify.toml`](netlify/netlify.toml) | `netlify.toml` | Anything deployed to Netlify | Nothing |
| [`netlify/_redirects`](netlify/_redirects) | `public/_redirects` | Single-page apps only | Nothing |
| [`netlify/_headers`](netlify/_headers) | `public/_headers` | Anything deployed to Netlify (Proposed) | Write the app's Content-Security-Policy, starting from the commented line |
| [`ui/app.css`](ui/app.css) | `src/styles/app.css` | Apps using Cobalt with Tailwind | Import it once from the app entry |
| [`db/supabase-roles.sql`](db/supabase-roles.sql) | `scripts/ci/supabase-roles.sql` | Repos with migrations | Nothing |
| [`db/supabase-auth-stub.sql`](db/supabase-auth-stub.sql) | `scripts/ci/supabase-auth-stub.sql` | Repos whose migrations use `auth.uid()` or `auth.users` (every browser-direct app) | Add anything else of Supabase's your migrations refer to |
| [`db/api-role-grants.sql`](db/api-role-grants.sql) | `scripts/ci/api-role-grants.sql` | Server-only (Drizzle) repos | Call it from CI and from a test |

Files whose names end in `.template.md` are renamed on copy. They carry that suffix here so agents working in this handbook do not mistake them for this repo's own instructions.

## By blueprint

| | Static site | Web app | Full-stack app | Library | CLI |
| --- | --- | --- | --- | --- | --- |
| Everything in `common/` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `workflows/ci.yml` | ✓ no migrations job | ✓ | ✓ | ✓ no preview, no migrations | ✓ |
| `workflows/deploy-preview.yml`, `release.yml` | ✓ | ✓ | adjust the artifact | Changesets instead | |
| `netlify/netlify.toml` | ✓ | ✓ | ✓ | | |
| `netlify/_redirects` | | ✓ | | | |
| `netlify/_headers` | ✓ | ✓ | ✓ | | |
| `e2e/quality.spec.ts` | ✓ | ✓ | ✓ | | |
| `ui/app.css` | ✓ | ✓ | ✓ | | |
| `db/*.sql` | | ✓ roles and auth stub | ✓ roles and grants check | | |

A library keeps its own release and Storybook workflows. Copy those from the `cobalt` repo: they are specific to publishing a package.

## One-time setup outside the repo

Copying files is not enough. Each of these is a setting somewhere else.

| Where | What |
| --- | --- |
| GitHub → Settings → Secrets and variables → Actions → Secrets | `COBALT_PACKAGES_TOKEN`, `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` |
| Same place → Variables | The `VITE_*` or `PUBLIC_*` values the build needs |
| GitHub → Settings → Environments → `production` | Create it. Add `DIRECT_URL` as a secret if there is a database. Optionally add required reviewers |
| GitHub → Settings → Branches | Protect `main`: require the CI check |
| GitHub → Settings → General | Enable Issue Types |
| Netlify → the project → Build & deploy | Stop builds |
| Your machine, `~/.npmrc` | The token line for GitHub Packages |

## How much of this has been run

| Files | State |
| --- | --- |
| `workflows/*.yml` | Generalised from two repos where they run in production. Checked with `actionlint`. The combined form here (one CI file feeding both preview and release, with a `main` default branch and the optional migrate step) has **not** run end to end in a repo yet. Expect to fix small things on first use, and send the fix back here. `release.yml` tagging every merge and deploying from the tag is **Proposed** (D21): it has not run in any repo. Its tagging script was run against a local Git remote |
| `eslint.config.js`, `vitest.config.ts`, hooks, `app.css`, `db/*.sql` | Taken from a repo where they run. The lint and test configs were run against a scratch project. The three `no-eval` rules in the lint config are an addition, checked the same way |
| `playwright.config.ts` | Generalised from one repo. The `executablePath` line for cloud sessions is new |
| `.prettierrc.json`, `dependabot.yml`, `_redirects` | **Proposed.** Not taken from a repo, and not yet deployed anywhere |
| `netlify/_headers` | The long-cache rule for fingerprinted files is in use in one repo. The security headers are **Proposed** and have not been deployed anywhere |
| `db/supabase-auth-stub.sql` | Generalised from one repo's CI stand-in. Run here against Postgres 16: a migration with a foreign key to `auth.users` and an `auth.uid()` policy fails without it and applies with it; the policy then shows each user only their own rows. Safe to apply twice |
| The handbook skills and `audit.mjs` | New. The script has 95 tests at 100% line, branch and function coverage on Node 22 and 24, and was run against the eight other repos; its results matched the adoption table apart from two cells that were then corrected. Installing with the `skills` tool was checked from a local copy of this repo, not from GitHub. The skills' written steps have not yet been followed end to end by an agent in a real repo, and no repo lists deviations in the form the script reads yet |
| `e2e/quality.spec.ts` | **Proposed.** New. Run here with Playwright 1.63 and axe 4.14 against a good page (7 tests pass) and a deliberately bad page (20 distinct failures reported). Typechecks under strict mode. Not yet run in a repo |
| `CLAUDE.template.md`, issue forms, PR template | Merged from the four existing rulebooks |

## Changing the kit

When a kit file needs a fix, fix it here first, then in the repos that copied it. A kit file and the standards page that describes it change in the same PR.
