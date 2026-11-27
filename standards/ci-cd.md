# CI/CD

How code is checked, previewed, released and hosted. One pipeline shape for every deployed repo.

## The pipeline

```mermaid
flowchart TB
    subgraph local["On your machine"]
        commit["git commit<br/><i>lint staged files</i>"] --> push["git push<br/><i>typecheck + coverage</i>"]
    end

    push --> ci

    subgraph pr["Pull request"]
        ci["<b>ci.yml</b>: runs the PR's code, no deploy credentials<br/>lint → typecheck → coverage → build → end-to-end<br/>uploads the build as an artifact"]
        ci --> preview["<b>deploy-preview.yml</b>: trusted, never runs PR code<br/>uploads the artifact to a per-PR URL<br/>comments the link"]
    end

    preview --> merge(["Squash merge to main"])
    merge --> ci2["<b>ci.yml</b> on main"]

    subgraph rel["release.yml: only after CI passes"]
        tag["Tag every merge<br/><i>v‹version› when bumped, else v‹version›+‹n›</i>"]
        check["Check out the tag<br/><i>must be the commit CI tested</i>"]
        migrate["Migrate the database<br/><i>repos with one</i>"]
        deploy["Build → netlify deploy --prod"]
        tag --> check --> migrate --> deploy
    end

    ci2 --> tag
    manual(["Run workflow with a tag on main"]) -.->|"rollback: deploy only"| check
```

The three workflow files are in the kit: [`ci.yml`](../kit/workflows/ci.yml), [`deploy-preview.yml`](../kit/workflows/deploy-preview.yml), [`release.yml`](../kit/workflows/release.yml).

## Gates

| Gate | When | Runs | Why there |
| --- | --- | --- | --- |
| lint-staged | pre-commit | `eslint --fix --max-warnings 0` on staged files | Fast. Never blocks the red commit of a TDD cycle |
| Quality | pre-push | `npm run typecheck && npm run test:coverage` | Needs green tests, so it cannot run on commit |
| CI | every PR, every push to `main` | lint → typecheck → coverage → build → end-to-end, plus the migrations job | The gate that cannot be skipped |
| Preview | every PR | The built site on its own URL | A person looks at it before merge |
| Release | merge to `main`, after CI passes | Tag, then deploy that tag (migrate first in database repos) | A commit that fails CI is never tagged. An untagged commit is never deployed |

## Hosting: Netlify, built on GitHub Actions

**Netlify hosts. GitHub Actions builds. Netlify never builds.** The site is uploaded prebuilt with the Netlify CLI (`netlify deploy --no-build --dir dist`).

| Why | |
| --- | --- |
| Tests gate the deploy | Netlify's own build would deploy code that CI is still checking |
| It works for private repos in any org | Netlify's Git integration could not reach one of ours |
| One place for build configuration | The workflow file, in the repo, reviewed like code |
| Rollback is a button | Re-run the release workflow with an older tag |

One-time setup per site:

1. Create the Netlify project. **Stop builds** (Project configuration → Build & deploy → Continuous deployment), or leave it unlinked from Git.
2. Create a Netlify personal access token.
3. In the GitHub repo, add the secrets and variables in the table below.
4. Optional: add required reviewers to the `production` environment to put a click in front of every production deploy.

Until the Netlify secrets exist, previews skip with a notice and production deploys fail with a pointer to the README.

Server-rendered apps (TanStack Start) follow the same shape, but the artifact holds more than `dist/`. That pipeline is not proven yet: see [Full-stack app](../blueprints/full-stack-app.md#deploying).

### What uses GitHub Pages

Only documentation of public repos: Cobalt's Storybook and this handbook. Not apps. An app's Storybook is built in CI to prove it works, and is not published.

### Leaving Vercel

Two repos still deploy to Vercel. New work does not, and both move: the owner decided on one host ([D1](../decisions.md)). To move a static site: remove the Vercel adapter and add the three workflows. To move an app that uses Vercel Functions or Vercel Cron: move that code first. See [Functions](../blueprints/functions.md#moving-off-vercel-functions).

## Previews are split in two, on purpose

A PR's code runs `npm ci` and the build. A compromised dependency could read any secret those steps can see. So:

| | `ci.yml` on the PR | `deploy-preview.yml` |
| --- | --- | --- |
| Trust | Untrusted: runs the PR's code | Trusted: always runs the copy on `main` (`workflow_run`) |
| Credentials | Read-only token. No deploy secrets | Holds the Netlify token |
| Does | Builds, tests, uploads `dist/` as an artifact | Downloads the artifact, checks it holds only build output, uploads it as a draft deploy |
| Runs PR code? | Yes | Never. No checkout, no `npm` inside the artifact |

**What data a preview uses is open** ([O10](../decisions.md#open)). The kit builds a pull request with the same public values as production, so a preview of a database app reads the production project through row-level security. Migrations run on release, so a preview of a pull request that adds a table cannot load the feature it exists to show. One repo is trying previews in demo mode instead: fixtures only, no database client in the build.

A draft deploy to an alias (`pr-<number>--<site>.netlify.app`) cannot touch production. Fork PRs get no preview. `workflow_run` workflows only fire once the file exists on `main`, so previews start working after the pipeline's own PR merges.

## Releases

### Apps and sites

**Every merge is tagged, and production deploys only from a tag.** Decided by the owner ([D21](../decisions.md)). No repo runs it yet. The two repos with a release workflow tag only when the version was bumped and deploy the merged commit directly.

Why: a tag names exactly what is live, every deploy can be rolled back to by name, and a commit nobody tagged cannot reach production.

1. **Bump the version in the PR** when the change is user-facing: `npm version <patch|minor|major> --no-git-tag-version`.
   - patch: fixes and tweaks. minor: new features, new pages, schema changes. major: breaking changes.
2. **Merge.** `release.yml` waits for CI on `main`, then tags the merged commit:

   | The merge | Tag | GitHub Release |
   | --- | --- | --- |
   | Bumped the version to `1.5.0` | `v1.5.0` | Yes, notes generated from the PRs since the previous version |
   | Did not bump it | `v1.5.0+1`, then `v1.5.0+2`, … | No. A build, not a new version |

   `+<n>` is [SemVer](https://semver.org/) build metadata: the same version, built again with more merged work. Nothing commits back to `main`, so `package.json` keeps the version and the tag adds the build number.
3. **Deploy runs once the tag exists.** The deploy job checks out `refs/tags/<tag>` from GitHub and stops unless the tag points at the commit CI tested. Then it migrates (database repos), builds and deploys. The Netlify deploy message and the job summary name the tag.
4. **A burst of merges** gets one tag. A run whose commit is no longer `main`'s tip stops before tagging. The newest merge is tagged and deployed, and its tag contains the earlier merges.
5. **Rollback:** Actions → Release & Deploy → Run workflow → enter an older tag. The tag must be on `main`'s history, so a tag pushed by hand on an unmerged branch is refused. Code only. It never rolls the database back, which is safe because migrations only add things.

**Why the deploy is a job in the same workflow, not a second workflow that starts on a tag push.** A tag pushed with the built-in `GITHUB_TOKEN` does not start other workflows (GitHub docs: "Automatic token authentication"). A separate workflow would need an app token or personal access token in every repo. It would also deploy any matching tag anyone pushed, tested or not.

An app that shows its own changelog to users also keeps a changelog entry per version, and CI checks that the version, the changelog and the tag agree. Build tags (`+<n>`) are not versions and need no entry. A check that compares the newest tag with the changelog must ignore them. Not verified against the repo that has this check.

### Libraries

Changesets. Every PR that changes behaviour, API or tokens adds a changeset (`npx changeset`). Merging opens a "Version Packages" PR. Merging that publishes to GitHub Packages. See [Library](../blueprints/library.md).

## The migrations job

Repos with a database have a second CI job. It starts a throwaway Postgres 17 and:

1. Creates stand-ins for what Supabase ships and plain Postgres lacks: the Data API roles, and the `auth` schema with `auth.users` and `auth.uid()` that policies and foreign keys refer to.
2. Applies every migration to the empty database.
3. Applies them again and checks that nothing changes.
4. Drizzle repos: regenerates from the schema and fails if a new file appears (the schema changed without a migration).

In production, `release.yml` applies pending migrations **before** the build and deploy. If a migration fails, nothing is deployed and the current version keeps running. The database secret is given to that one step only. Rules for writing migrations: [Data](data.md#migrations).

## Secrets and variables

Same names in every repo. Set under Settings → Secrets and variables → Actions.

| Name | Kind | What it is |
| --- | --- | --- |
| `COBALT_PACKAGES_TOKEN` | Secret | A token with `read:packages`, so `npm ci` can install `@q-labs/cobalt`. The built-in `GITHUB_TOKEN` cannot read another owner's packages |
| `NETLIFY_AUTH_TOKEN` | Secret | Netlify personal access token |
| `NETLIFY_SITE_ID` | Secret | The Netlify project ID |
| `DIRECT_URL` | Secret, `production` environment | Database connection for migrations: Supabase **session pooler**, port 5432. GitHub's runners are IPv4-only and cannot reach the direct connection |
| `VITE_*`, `PUBLIC_*` | **Variables**, not secrets | Build-time values that end up in the public bundle anyway: the Supabase URL, the publishable (anon) key, feature flags |

Never put a real secret in a `VITE_*` or `PUBLIC_*` name. Anything with those prefixes is shipped to every browser. More: [Security](security.md).

## Workflow conventions

| Convention | Why |
| --- | --- |
| `node-version-file: .nvmrc` | One place to change Node |
| `cache: npm` and `npm ci` | Fast, reproducible installs |
| `permissions:` set per workflow, least privilege. `contents: read` unless it must write | A leaked token can do less |
| `persist-credentials: false` on checkouts that run untrusted code | The token is not left on disk |
| `HUSKY: '0'` in CI | `npm ci` would install hooks; a tag push would run them |
| Pin the Netlify CLI to an exact version | A CLI release cannot break deploys on its own |
| `concurrency` cancels superseded PR runs. Runs on `main` each get their own group. Production deploys are serialised and never cancelled mid-upload | A shared group keeps only one pending run, so a burst of merges would silently drop one's CI run and its tag |
| The deploy skips itself if `main` has moved on | Runs can finish out of order; an old commit must not overwrite a newer one |
| Secrets are scoped to the single step that needs them | `npm ci` and the build never see the database URL |
| Never rely on a check that could pass vacuously | A failed lookup must stop the job, not read as "nothing to do" |

## Dependency updates

**Proposed.** Dependabot, weekly, with minor and patch updates grouped into one PR per repo. Major updates arrive one at a time and are treated as a Task. Config: [`kit/common/.github/dependabot.yml`](../kit/common/.github/dependabot.yml).
