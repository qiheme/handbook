# Repo contract

What every repo contains, and what every repo's commands are called. If these are the same everywhere, a person or an agent can walk into any repo and work.

## Required files

| File | Purpose | Kit source |
| --- | --- | --- |
| `README.md` | What it is, how to run it, scripts, environment variables, deployment | Write it. Sections below |
| `CLAUDE.md` | The rulebook for agents and people | [`kit/common/CLAUDE.template.md`](../kit/common/CLAUDE.template.md) |
| `AGENTS.md`, `.github/copilot-instructions.md` | One-line pointers to `CLAUDE.md` | [`kit/common/AGENTS.template.md`](../kit/common/AGENTS.template.md) |
| `.nvmrc` | The Node version: `24` | [`kit/common/.nvmrc`](../kit/common/.nvmrc) |
| `.npmrc` | The registry line for `@q-labs`. Never a token | [`kit/common/.npmrc`](../kit/common/.npmrc) |
| `.env.example` | Every variable the app reads, with comments. `.env` itself is git-ignored | [`kit/common/.env.example`](../kit/common/.env.example) |
| `.gitignore` | | [`kit/common/.gitignore`](../kit/common/.gitignore) |
| `package.json` | Scripts named as below, `engines.node`, `lint-staged` | [`kit/common/package.scripts.json`](../kit/common/package.scripts.json) |
| `eslint.config.js` | Flat config | [`kit/common/eslint.config.js`](../kit/common/eslint.config.js) |
| `vitest.config.ts` | Tests and the 100% thresholds | [`kit/common/vitest.config.ts`](../kit/common/vitest.config.ts) |
| `.husky/pre-commit`, `.husky/pre-push` | Local gates | [`kit/common/.husky/`](../kit/common/.husky/pre-push) |
| `e2e/quality.spec.ts` | The automated part of the [Front-end checklist](frontend-checklist.md). Anything with pages (Proposed) | [`kit/e2e/quality.spec.ts`](../kit/e2e/quality.spec.ts) |
| `public/_headers` | Security headers. Anything deployed to Netlify (Proposed) | [`kit/netlify/_headers`](../kit/netlify/_headers) |
| `.github/workflows/ci.yml` | CI | [`kit/workflows/ci.yml`](../kit/workflows/ci.yml) |
| `.github/workflows/deploy-preview.yml`, `release.yml` | Anything that deploys | [`kit/workflows/`](../kit/workflows/release.yml) |
| `.github/pull_request_template.md` | | [`kit/common/.github/pull_request_template.md`](../kit/common/.github/pull_request_template.md) |
| `.github/ISSUE_TEMPLATE/` | Feature, Bug, Task forms | [`kit/common/.github/ISSUE_TEMPLATE/`](../kit/common/.github/ISSUE_TEMPLATE/feature.yml) |
| `.github/dependabot.yml` | Weekly grouped updates (Proposed) | [`kit/common/.github/dependabot.yml`](../kit/common/.github/dependabot.yml) |
| `.claude/skills/verify/SKILL.md` | How to prove a change works in the running app | [`kit/common/claude-skill-verify/SKILL.template.md`](../kit/common/claude-skill-verify/SKILL.template.md) |
| `docs/architecture.md` | Diagrams and the reasons behind the design. Needed once the README can't hold it | Write it |

Shell-only and Python-only repos keep the non-Node rows. See [CLI and scripts](../blueprints/cli-and-scripts.md).

## Script names

The same command does the same thing in every repo. CI, hooks and agents rely on these names.

| Script | Does | Notes |
| --- | --- | --- |
| `npm run dev` | Start the dev server | |
| `npm run build` | Production build | |
| `npm run preview` | Serve the production build locally | |
| `npm run lint` | ESLint, zero warnings allowed | |
| `npm run typecheck` | `tsc --noEmit`, or `astro check` | Vitest does not typecheck |
| `npm test` | Unit tests, once, no coverage | Fast loop |
| `npm run test:watch` | Unit tests in watch mode | |
| `npm run test:coverage` | Unit tests **with the 100% floor enforced** | The gate. Hooks and CI call this one |
| `npm run test:e2e` | Playwright, against the built output | Anything with pages |
| `npm run db:migrate` | Apply pending migrations | Repos with a database |
| `npm run db:generate` | Generate a migration from the schema | Drizzle repos |
| `npm run storybook` | Component explorer | Libraries, web apps, full-stack apps |
| `npm run build-storybook` | Build the explorer. CI runs it | Libraries, web apps, full-stack apps |

A repo may add scripts. It may not give one of these names a different meaning.

## README sections

In this order, so the same thing is always in the same place.

1. One paragraph: what it is and who it is for.
2. **Tech stack**: a table. Link the blueprint it follows.
3. **Getting started**: prerequisites, install, environment variables, run.
4. **Scripts**: the table above, trimmed to what exists.
5. **Project structure**: a tree with one line per folder.
6. **Testing**.
7. **Deployment**: the pipeline, the secrets and variables it needs, one-time setup.
8. **Cloud sessions**: only what is specific to this repo. See [Agents](agents.md#cloud-sessions).
9. **Contributing**: one line pointing at `CLAUDE.md`.

Docs parity is a rule: a PR that changes behaviour, structure, setup or conventions updates the README (and `docs/architecture.md`) in the same PR.

## Repository settings

| Setting | Value | Status |
| --- | --- | --- |
| Default branch | `main` | Adopted |
| Branch protection on `main` | Require the CI check. No direct pushes | Proposed |
| Merge method | Squash merge. The PR title becomes the commit, so it follows conventional commits | Adopted in practice |
| Issue types | Feature, Bug, Task enabled | Adopted |
| Actions secret | `COBALT_PACKAGES_TOKEN`: a token with `read:packages`, for installing Cobalt | Adopted. One repo still calls it `NPM_TOKEN` |
| Environment `production` | Holds deploy secrets. Add required reviewers to gate production behind a click | Adopted |
| Netlify Git integration | Off. Builds are stopped in the Netlify project | Adopted |

## Folder names

| Folder | Holds |
| --- | --- |
| `src/` | Application source |
| `src/lib/` | Pure logic. No framework, no network, dependencies passed in as arguments |
| `src/components/` | UI, by atomic level |
| `e2e/` | Playwright specs (`tests/e2e/` in Astro sites) |
| `supabase/migrations/`, `supabase/functions/` | Database changes and Edge Functions |
| `scripts/` | Node tools that ship with the repo. `scripts/<tool>/bin/` is the only impure part |
| `docs/` | Architecture and decisions |
| `.github/`, `.husky/`, `.claude/` | Automation |
