# The stack

One choice per layer. Each row says what we use, whether it is settled, and why.

Status labels: **Adopted** (two or more active repos already do this), **In use** (one repo does it and it works there), **Proposed** (recommended, needs sign-off in [Decisions](../decisions.md)), **Open** (undecided).

## Language and runtime

| Layer | Standard | Status | Why |
| --- | --- | --- | --- |
| Language | **TypeScript**, `strict: true`. No `any`. No non-null assertion without a comment saying why it is safe | Adopted | Five of six active repos. Types catch what tests miss: a wrong import passed 98 tests in one repo and only `tsc` caught it |
| Runtime | **Node 24** (LTS). `.nvmrc` contains `24`. `engines.node` is `>=24` | Proposed | Repos pin 22, 22.22.2, 24 and 24.14.1 today. One pin means one CI setup and one cloud setup |
| Node pin style | Major only (`24`), not an exact patch | Proposed | An exact pin (`22.22.2`) must be installed by hand on every machine and cloud image. The lockfile already makes dependencies reproducible |
| Package manager | **npm**, with a committed `package-lock.json`. CI runs `npm ci` | Adopted | Every repo uses it |
| Modules | ES modules (`"type": "module"`) | Adopted | Every active repo |

**When to move Node versions.** Review once a year when a new LTS line starts (each October). Move after the new line has been LTS for six months. Node 24 is supported until 2028-04-30. Node 26 became LTS on 2026-10-28, so the next review moves to 26 no earlier than May 2027. Source: the [Node release schedule](https://github.com/nodejs/Release).

## Frontend

| Layer | Standard | Status | Why |
| --- | --- | --- | --- |
| Content sites | **Astro**, static output | Adopted | Both content sites. Ships no JavaScript by default |
| Apps | **React** + **Vite** | Adopted | Every app |
| Full-stack apps | **TanStack Start** (React, Vite, server functions) | In use (one repo) | Use only when the server must own the data. See [Full-stack app](../blueprints/full-stack-app.md) |
| Routing | **TanStack Router** for new apps | Proposed | Same router as TanStack Start, so a web app can grow into a full-stack app without a rewrite. An existing React Router app stays as it is |
| Server data in the browser | **TanStack Query** | Proposed | Caching, retries and loading states written once. Replaces hand-rolled fetch-in-effect code |
| Design system | **Cobalt** (`@q-labs/cobalt`). Use its components before writing your own | Adopted | Three repos. See [UI](ui.md) |
| Styling | **Tailwind v4** for layout, with Cobalt's tokens mapped into the Tailwind theme. No raw hex values | In use (one repo). Proposed for content sites | One styling approach everywhere. One other app uses Tailwind without the tokens, and one uses the tokens without Tailwind. Existing plain-CSS-on-tokens sites are fine as they are |
| Inside Cobalt itself | CSS Modules, tokens only | In use (one repo) | A library must not force Tailwind on its consumers |
| Component structure | Atomic design: atoms, molecules, organisms, templates, pages. A level imports from its own level or below | Adopted | Three repos. One repo enforces it with a test |
| Formatting | **Prettier**: no semicolons, single quotes | Proposed | No active repo has a formatter, and the repos disagree on style. A formatter ends the argument and shrinks diffs |

## Backend and data

| Layer | Standard | Status | Why |
| --- | --- | --- | --- |
| Database | **Supabase** Postgres | Adopted | Every app with data |
| Auth | **Supabase Auth** | Adopted for web apps, Open for full-stack apps | See [Data](data.md#auth) |
| Data access, web app | `supabase-js` from the browser, protected by row-level security | Adopted | Two repos |
| Data access, full-stack app | **Drizzle** over a direct connection. Supabase's Data API switched off | In use (one repo) | For data that policies alone should not guard |
| Server-side code | **Supabase Edge Functions**, logic in pure modules tested with Vitest | In use (one repo), Proposed as the default | Sits next to the data. Secrets stay in Supabase. See [Functions](../blueprints/functions.md) |
| Validation | **zod** at every boundary: forms, function inputs, provider responses | Adopted | Two repos |
| AI calls | Behind a provider adapter with a mock. Model name and key come from configuration | In use (one repo) | Two repos call a model; one has the full pattern |

## Quality

| Layer | Standard | Status | Why |
| --- | --- | --- | --- |
| Unit tests | **Vitest** + Testing Library | Adopted | Every tested repo |
| Coverage | **100%** lines, branches, functions, statements, enforced by `npm run test:coverage` | Adopted | Four repos |
| End-to-end | **Playwright**, Chromium, against the built output | Adopted | Two repos |
| Front-end quality | The **Front-End Checklist** ([frontendchecklist.io](https://frontendchecklist.io)). Critical and High rules are required | Proposed | A maintained, prioritised list that agents can read. See [Front-end checklist](frontend-checklist.md) |
| Lint | **ESLint** flat config + `typescript-eslint` + `react-hooks`, `--max-warnings 0` | Adopted | Two repos on the flat config. The rest need it |
| Type check | `npm run typecheck` (`tsc --noEmit`, or `astro check` for Astro) | Adopted | Vitest does not typecheck |
| Git hooks | **husky**. Commit: lint staged files. Push: typecheck and coverage | Adopted (husky, three repos). This exact split is in use in one | Push-time gates let the red commit of a TDD cycle be committed |

More: [Testing](testing.md).

## Delivery

| Layer | Standard | Status | Why |
| --- | --- | --- | --- |
| CI | **GitHub Actions**: lint, typecheck, coverage, build, end-to-end, migrations | Adopted | Every repo with CI |
| Hosting | **Netlify**. Built on GitHub Actions and uploaded prebuilt. Netlify never builds | Adopted | Two repos have the full pipeline. Two repos still deploy to Vercel |
| Previews | One preview per PR, deployed by a trusted workflow that never runs PR code | Adopted | Two repos |
| App releases | Version bumped by hand in the PR. Merge tags `v<version>` | Adopted | Two repos |
| Production deploys | **Every merge is tagged** (`v<version>+<n>` when not bumped) and production deploys only from the tag | Proposed (D21) | No repo yet. The two with a release workflow deploy the merged commit, tagged or not |
| Library releases | **Changesets**, published to GitHub Packages | In use (one repo) | Cobalt is the only library |
| Docs and Storybook | GitHub Pages | Adopted | Cobalt's Storybook, this handbook |
| Dependency updates | **Dependabot**, weekly, grouped | Proposed | Vitest is on four different majors across the repos. Nothing keeps them moving together |

More: [CI/CD](ci-cd.md).

## Collaboration

| Layer | Standard | Status | Why |
| --- | --- | --- | --- |
| Tracking | A GitHub issue before any code | Adopted | Every repo with a rulebook |
| Method | Test first: red, green, refactor | Adopted | Every repo with a rulebook |
| Commits | Conventional commits: `type(scope): description (#issue)` | Adopted | Two repos use this exact shape |
| Default branch | `main` | Adopted in six repos, three still on `master` | One name means one set of workflow files |
| Agent rulebook | `CLAUDE.md` in every repo | Adopted in four repos | See [Agents](agents.md) |
| Other agent files | `AGENTS.md` and Copilot's file are one-line pointers to `CLAUDE.md`, not copies | Proposed | Three repos keep copies today, and none has `AGENTS.md`. A pointer cannot go stale |

More: [Workflow](workflow.md).

## Version baseline

These are the versions the newest reference repo runs today. They are a floor for new projects, not a promise that they are the latest. Check with `npm view <package> version` before you start.

| Tool | Baseline | Note |
| --- | --- | --- |
| Node | 24 | See above |
| React | 19 | Cobalt accepts 18 and up |
| Vite | 8 | |
| Vitest | 5 | With `@vitest/coverage-v8` on the same major |
| TypeScript | `tsc` 7, with the `typescript` package aliased to the 6 line | `typescript-eslint` does not support 7 yet. Drop the alias when it does |
| ESLint | 10 | Flat config only |
| Tailwind | 4 | Via `@tailwindcss/vite` |
| Astro | 7 for new sites | Both existing sites run 5, which is two majors behind. Upgrading is a Task in each. Cobalt has not been tried on Astro 7 yet |
| Playwright | Current | Never pin below the cloud image's browser |
| husky / lint-staged | 9 / 16 | lint-staged 17 needs a newer Node patch than some machines have |
| Storybook | 10 for new libraries | Cobalt runs 8, two majors behind. A Task there |
| Changesets | 3 for new libraries | Cobalt runs 2 |
| Cobalt | 0.3 | |

Checked against the npm registry on 2026-11-21.

**Version rule (Proposed).** Start a new project on the baseline. An existing repo may trail the baseline by one major version. Two majors behind is a Task issue in that repo.

## What we do not use

| Not this | Use instead | Why |
| --- | --- | --- |
| Create React App | Vite | Unmaintained |
| Redux | TanStack Query for server data, React state for the rest | Less code for the same result |
| Bootstrap, other component kits | Cobalt | One design system |
| Jest | Vitest | Shares Vite's config and transforms |
| Vercel (new projects) | Netlify | One host, one pipeline to maintain |
| Netlify's own Git builds | GitHub Actions builds | Tests gate the deploy. Works for private repos in any org |
| yarn, pnpm, bun | npm | One lockfile format |
| Editing the database in the dashboard | Migration files in a PR | Reviewable and repeatable |
