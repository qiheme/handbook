# Decisions

Every choice in this handbook that is not yet settled, in one place. Each has a recommendation, the runner-up, and what it affects.

- **Proposed** means the handbook already tells new work to do this. Saying yes makes it Adopted. Saying no means changing the handbook.
- **Open** means the handbook does not pick. Someone has to.

To decide one: comment on the handbook's tracking issue or open a PR that changes the status here and on the page it links to.

## Needs a yes or no

| # | Decision | Recommendation | Runner-up | Why the recommendation | Affects |
| --- | --- | --- | --- | --- | --- |
| D1 | One host for everything | **Netlify**, built on GitHub Actions. Two repos leave Vercel | Keep Vercel for the two that are there | One pipeline to maintain; tests gate every deploy; the pipeline already exists twice | Travel-OS (large), portfolio (small) |
| D2 | Node version | **Node 24**, pinned as the major `24` | Node 26, the newest LTS | Two repos are already on 24 and it is supported until April 2028. Move to 26 after May 2027 | Six repos, the cloud setup script |
| D3 | Router and data layer for new web apps | **TanStack Router + TanStack Query** | React Router | Same as the full-stack blueprint, so an app can grow without a rewrite. Existing React Router code stays | New web apps only |
| D4 | Code formatter | **Prettier**: no semicolons, single quotes, width 100 | Biome; or no formatter | The repos disagree on style today and no formatter enforces any. This style matches three of them | Every Node repo: one large formatting commit each |
| D5 | Migrations for browser-direct apps | **Supabase CLI** file naming, applied by `supabase db push` in the release workflow | The custom runner one repo already has | Works with the local Supabase stack and type generation. Not proven in a repo yet. The existing runner stays where it is | New web apps |
| D6 | App releases | **Version bump in the PR, tag on merge**, generated notes | semantic-release, computed from commit messages | Two repos do it this way, with a rollback path. semantic-release was planned in one repo and would be a second system | wish-list's release plan |
| D7 | Public build-time values | **GitHub Actions variables**, for previews and production | Keep production values in Netlify and pull them with `netlify build` | Netlify never builds, so the build's inputs belong where the build runs. One repo does the runner-up for production today, which also works | easy-finances production build |
| D8 | Styling on content sites | **Tailwind on Cobalt tokens** for new sites | Plain CSS on Cobalt tokens | One approach across every blueprint. Existing plain-CSS sites are not converted | New static sites |
| D9 | Default branch | **`main`** everywhere | Leave three repos on `master` | The kit's workflows name the branch. One name means no per-repo edits | cloud129-site, portfolio, this repo |
| D10 | TypeScript for the one JavaScript app | **Migrate**, file by file, pure modules first | Leave it as JavaScript | It is the largest codebase and the only one without types. Large effort; no user-visible change | easy-finances |
| D11 | Dependency updates | **Dependabot**, weekly, minor and patch grouped | Renovate; or by hand | Vitest is on four majors across the repos. Built into GitHub, no new vendor | Every Node repo |
| D12 | Protect `main` | **Require the CI check; no direct pushes** | No protection | The gate that cannot be skipped should not be skippable | Every repo |
| D13 | `stock-cerebro-client` | **Archive it** | Rebuild it on the Web app blueprint | Untouched since 2022, on an unmaintained toolchain | That repo |
| D14 | This handbook is public | **Keep it public**, with stack-level facts only | Make the repo private, or move the handbook to a private repo | Agents and new developers can read it with no access setup. The cost is care about what goes in | This repo |

## Open

| # | Question | Options | Who decides, and where |
| --- | --- | --- | --- |
| O1 | Auth for server-only (full-stack) apps | Supabase Auth, or Better-Auth | The owner, in the reference repo's auth issue. Until then the handbook leans to Supabase Auth: one sign-in system to run |
| O2 | Host and pipeline for server-rendered apps | Netlify with Nitro's Netlify preset is the starting point | Whoever ships the first deploy on the full-stack blueprint. It is unproven |
| O3 | How Edge Functions are deployed | By the release workflow, or by hand | Not recorded in any repo today. Needs writing down first, then automating |
| O4 | Mobile | Installable web app first; Expo if the device is needed | Decide on the first real mobile project. See [Not built yet](blueprints/other.md#mobile-app) |
| O5 | Scheduled jobs | Supabase Cron | Decide when the one existing scheduled job moves off Vercel |

## Already settled

For the record, these came out of the survey with no real contest: TypeScript, npm, React and Vite, Astro for content, Supabase, Cobalt, Vitest at 100% coverage, Playwright, ESLint flat config, husky, GitHub Actions, issue first, test first, conventional commits, `CLAUDE.md` as the rulebook. Reasons are on [The stack](standards/stack.md).

## How a decision gets recorded

1. A PR to this repo changes the row's status here and on the page that states the rule.
2. If the decision changes what a repo should do, [Adoption](adoption.md) gets a row.
3. Decided rows move to "Already settled" with a one-line reason. Rejected ones are deleted along with the rule they proposed.
