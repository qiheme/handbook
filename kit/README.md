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
| [`common/.nvmrc`](common/.nvmrc) | `.nvmrc` | Node repos | Nothing |
| [`common/.npmrc`](common/.npmrc) | `.npmrc` | Repos that install Cobalt | Nothing. Never add a token |
| [`common/.gitignore`](common/.gitignore) | `.gitignore` | Node repos | Add repo-specific entries |
| [`common/.env.example`](common/.env.example) | `.env.example` | Repos that read environment variables | List every variable the app reads |
| [`common/package.scripts.json`](common/package.scripts.json) | merged into `package.json` | Node repos | Adjust `dev`, `build`, `preview`, `typecheck` for the framework |
| [`common/eslint.config.js`](common/eslint.config.js) | `eslint.config.js` | Node repos | Add the TanStack plugins if used |
| [`common/.prettierrc.json`](common/.prettierrc.json) | `.prettierrc.json` | Node repos (Proposed) | Nothing |
| [`common/vitest.config.ts`](common/vitest.config.ts) | `vitest.config.ts` | Node repos | Set the environment. Give every exclusion a reason |
| [`common/playwright.config.ts`](common/playwright.config.ts) | `playwright.config.ts` | Anything with pages | Set `testDir` if specs are not in `e2e/` |
| [`common/.husky/pre-commit`](common/.husky/pre-commit), [`pre-push`](common/.husky/pre-push) | `.husky/` | Node repos | Run `npm install` once so `prepare` installs the hooks |
| [`common/.github/pull_request_template.md`](common/.github/pull_request_template.md) | `.github/pull_request_template.md` | Every repo | Add repo-specific checklist lines |
| [`common/.github/ISSUE_TEMPLATE/`](common/.github/ISSUE_TEMPLATE/feature.yml) | `.github/ISSUE_TEMPLATE/` | Every repo | Enable Issue Types in the repo settings |
| [`common/.github/dependabot.yml`](common/.github/dependabot.yml) | `.github/dependabot.yml` | Node repos (Proposed) | Add the Dependabot secret named in the file |
| [`workflows/ci.yml`](workflows/ci.yml) | `.github/workflows/ci.yml` | Every repo with code | Delete the migrations job, or the end-to-end steps, if they do not apply. Set the build variables |
| [`workflows/deploy-preview.yml`](workflows/deploy-preview.yml) | `.github/workflows/deploy-preview.yml` | Anything deployed to Netlify | Nothing |
| [`workflows/release.yml`](workflows/release.yml) | `.github/workflows/release.yml` | Anything deployed to Netlify | Delete the migrate step if there is no database. Set the build variables |
| [`netlify/netlify.toml`](netlify/netlify.toml) | `netlify.toml` | Anything deployed to Netlify | Nothing |
| [`netlify/_redirects`](netlify/_redirects) | `public/_redirects` | Single-page apps only | Nothing |
| [`ui/app.css`](ui/app.css) | `src/styles/app.css` | Apps using Cobalt with Tailwind | Import it once from the app entry |
| [`db/supabase-roles.sql`](db/supabase-roles.sql) | `scripts/ci/supabase-roles.sql` | Repos with migrations | Nothing |
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
| `ui/app.css` | ✓ | ✓ | ✓ | | |
| `db/*.sql` | | ✓ roles | ✓ both | | |

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
| `workflows/*.yml` | Generalised from two repos where they run in production. Checked with `actionlint`. The combined form here (one CI file feeding both preview and release, with a `main` default branch and the optional migrate step) has **not** run end to end in a repo yet. Expect to fix small things on first use, and send the fix back here |
| `eslint.config.js`, `vitest.config.ts`, hooks, `app.css`, `db/*.sql` | Taken from a repo where they run. The lint and test configs were run against a scratch project |
| `playwright.config.ts` | Generalised from one repo. The `executablePath` line for cloud sessions is new |
| `.prettierrc.json`, `dependabot.yml`, `_redirects` | **Proposed.** No repo uses them yet |
| `CLAUDE.template.md`, issue forms, PR template | Merged from the four existing rulebooks |

## Changing the kit

When a kit file needs a fix, fix it here first, then in the repos that copied it. A kit file and the standards page that describes it change in the same PR.
