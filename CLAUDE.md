# CLAUDE.md — Engineering Handbook

Rules for Claude Code, other agents and humans working in this repository.

**What this is:** the standard for how Cloud 12Nine and Q-Labs projects are built. Markdown pages (the source of truth), a kit of files other repos copy, and a no-build website that displays the pages at <https://qiheme.github.io>.

**There is no build, no `package.json`, and no dependency.** Do not add one without an issue that says why.

## If you are here to use the handbook

You are working in another repo and came here for the rules.

1. Read that repo's own `CLAUDE.md` first. It wins where it differs.
2. Find the repo's blueprint in [`blueprints/`](blueprints/README.md).
3. Look up the specific rule in [`standards/`](standards/stack.md).
4. Copy files from [`kit/`](kit/README.md), never from memory.

[`llms.txt`](llms.txt) lists every page with a one-line summary.

## Layout

```
README.md           Landing page and chooser
standards/          One page per topic: stack, repo-contract, workflow, testing, ci-cd, data, security, ui, agents
blueprints/         One page per kind of project
kit/                Files other repos copy. Not active in this repo
  common/           Configs, hooks, templates. *.template.md files are renamed on copy
  workflows/        ci.yml, deploy-preview.yml, release.yml
  netlify/ ui/ db/  Netlify config, the Tailwind + Cobalt stylesheet, SQL for CI
adoption.md         Where each existing repo stands
decisions.md        What is proposed or open
llms.txt            Index for agents
index.html          The website viewer (Docsify from a CDN). _sidebar.md is its navigation
.nojekyll           Tells GitHub Pages to serve files as they are
.github/workflows/  This repo's own CI: link check and workflow lint
```

## Rules for changing the handbook

1. **Issue first.** Every change starts with an issue in this repo. Commits and the PR reference it; the PR body says `Closes #<n>`.
2. **The standard changes here, by PR.** A repo that wants to work differently either lists a deviation in its own `CLAUDE.md` or proposes a change to this handbook. It does not just diverge.
3. **Label every rule.** `Adopted` only when two or more active repos already do it. `In use (one repo)` when exactly one does and it works there. Otherwise `Proposed`, with a row in [`decisions.md`](decisions.md). Never present a recommendation, or one repo's practice, as established everywhere.
4. **Say where a fact came from.** Claims about a repo are checked against that repo, not remembered. Claims about tool versions are checked against the registry. If you could not check, say "not verified".
5. **A rule and its kit file change together.** So do a rule and the rows in [`adoption.md`](adoption.md) it affects.
6. **Every page is listed** in `README.md`, `_sidebar.md` and `llms.txt`. Add a page to all three or to none.
7. **Relative links between pages**, ending in `.md`. They work on GitHub and in the viewer. CI fails on a broken one.
8. **Conventional commits**: `docs(scope): description (#issue)` for pages, `chore(kit): …` for kit files, `ci: …` for this repo's workflows.

## This repository is public

GitHub Pages publishes whatever is on the default branch. Anything pushed to any branch is public immediately.

- **No secret values.** Names of secrets (`NETLIFY_AUTH_TOKEN`) are fine.
- **No internals of private projects.** Name a private repo and state its stack. Do not describe its features, data model, security design, open decisions, vulnerabilities, project IDs or URLs.
- **A gap that is a security weakness is never written here.** File it as an issue in the affected repo.
- **No personal details**: no email addresses, no account IDs.

## Writing style

The readers are a new developer and an agent. Both read every word.

- Lead with the rule. Then the reason.
- Plain words, short sentences, one idea each. Define a term the first time.
- Tables for comparisons, numbered steps for procedures, a Mermaid diagram when it shows flow or structure better than text.
- Every rule has a reason. A rule without one gets ignored or misapplied.
- No filler, no hedging. If something is uncertain, say exactly what is uncertain.
- No dates without a reason. Do not invent deadlines.

## Kit rules

- A kit file comes from a repo where it already works. Say so in [`kit/README.md`](kit/README.md), or mark it Proposed.
- Templates that would be live if named normally (`CLAUDE.md`, `AGENTS.md`, `SKILL.md`) carry a `.template.md` suffix here, so this repo's agents do not load them as instructions.
- Placeholders are written `<LIKE THIS>`.
- Workflows in `kit/workflows/` must pass `actionlint`. CI checks it.

## Checking your work

There are no tests to run. Before opening a PR:

1. **Links:** every relative link resolves. CI runs a link checker; locally, open the changed pages on GitHub or in the viewer and click them.
2. **Workflows:** `actionlint kit/workflows/*.yml .github/workflows/*.yml`.
3. **Viewer:** serve the folder (`python3 -m http.server`) and open it. New pages appear in the sidebar. Diagrams render.
4. **Privacy:** reread the diff against the "public" rules above.

## Deviations from its own standard

| Standard | This repo | Reason |
| --- | --- | --- |
| Default branch `main` | `master` | Not renamed yet. See [`adoption.md`](adoption.md) |
| Node toolchain, Vitest, ESLint, hooks | None | No code. The content is Markdown and the viewer is one HTML file |
| Netlify hosting | GitHub Pages | A `username.github.io` repo is served by Pages directly |
| Cobalt via the npm package | A few token values copied into `index.html` | No build step to import the package. Marked as a snapshot in the file |
