---
name: handbook-new-project
description: Start a new project the standard way, from an Engineering Handbook blueprint (qiheme/handbook). Use when asked to start, scaffold, bootstrap or set up a new app, site, library, service or tool, or to set up an empty repository.
argument-hint: "[blueprint] [what it is]"
---

# Start a new project from the Engineering Handbook

The handbook is the standard for how these projects are built: <https://qiheme.github.io/handbook/>. This skill takes an empty (or nearly empty) repository to the point where it meets the standard and the first real feature can start.

Do the steps in order. Each one ends with something you can check.

## Reading the handbook

Read pages as Markdown, never from memory. Try in this order and use the first that works:

1. A local clone, if one is attached to this session: `../handbook/<path>`.
2. `https://raw.githubusercontent.com/qiheme/handbook/HEAD/<path>`
3. `https://qiheme.github.io/handbook/<path>`

If none is reachable, stop and say so. A project started from memory is how the repos drifted apart in the first place.

## Step 1: pick the blueprint

Read `blueprints/README.md`. Choose from what the request says:

| It is… | Blueprint |
| --- | --- |
| Mostly content: marketing site, portfolio, blog | `static-site` |
| An interactive app people sign in to (the default) | `web-app` |
| An app where the server must own the data, render pages, or fetch for the user | `full-stack-app` |
| A package other repos install | `library` |
| Server-side code with no interface: API, webhook, scheduled job | `functions` |
| Run from a terminal | `cli-and-scripts` |

If the request does not settle it, ask **one** question, the one that decides between the two closest blueprints. If nothing fits, read `blueprints/other.md` and follow its rule: start from the closest blueprint and write the decision down.

Then read the chosen blueprint page in full.

## Step 2: open the first issue

Before any file changes. Title: what is being built. Body: the blueprint, the reason for it, and anything that will differ from the standard. This is issue #1 and every commit below refers to it.

If you cannot create issues here, say so and give the issue text to the user to file.

## Step 3: scaffold

Run the command in the blueprint page's "Create it" section, then install the packages it lists. Use the current stable versions; check with `npm view <package> version` rather than trusting a number you remember. `standards/stack.md` has the baseline.

Installing Cobalt needs a token for GitHub Packages. If `npm install` fails on `@q-labs/cobalt`, do not work around it: tell the user the token is missing (`standards/ui.md` says where it goes) and continue with the steps that do not need it.

## Step 4: copy the kit

Read `kit/README.md`. For every row that applies to this blueprint, copy the file to its destination and do what the "After copying" column says. Fetch each file; do not write it from memory.

Do not skip:

- `CLAUDE.md` from `kit/common/CLAUDE.template.md`. Replace **every** `<PLACEHOLDER>`. Delete the sections marked "if …" that do not apply. List every difference from the standard under "Deviations".
- `AGENTS.md` and `.github/copilot-instructions.md`: pointers, not copies.
- `.claude/skills/verify/SKILL.md` from the template, with the real commands and ports for this project.
- The three workflows, with the parts that do not apply removed as their comments direct.
- This skill's sibling: copy `skills/handbook-audit/` from the handbook into `.claude/skills/handbook-audit/`, so any later session can audit the repo.

Merge `kit/common/package.scripts.json` into `package.json`. The script names are a contract; adjust the commands for the framework, not the names.

## Step 5: prove the gates work

A gate that has never failed proves nothing.

1. Write one small, real unit of logic test first: a failing test, then the code that passes it.
2. Run, and fix until each passes:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

3. Break the code on purpose and confirm `npm run test:coverage` fails. Restore it.
4. For anything with pages, add the first route to `PAGES` in `e2e/quality.spec.ts` and run `npm run test:e2e`.

## Step 6: run the audit

```bash
node .claude/skills/handbook-audit/scripts/audit.mjs . --all
```

Fix every `FAIL`. For each `TODO` (a proposed rule), either meet it or leave it and say so. A `FAIL` that is deliberate becomes a row in the Deviations table of `CLAUDE.md`: the rule id in backticks in the Rule column, and the reason. The script then reports it as `DEV` and passes.

The project is set up when this prints no `FAIL`.

## Step 7: write the README

The sections and their order are in `standards/repo-contract.md`. Write what is true now: stack, how to run it, scripts, environment variables, structure, deployment. No features that do not exist yet.

## Step 8: commit and open the pull request

Conventional commits that refer to the issue. In the pull request, say what you ran and what you saw, and list:

- What was **not** done, and why.
- **What only the owner can do**, as a checklist. These are settings outside the repo, listed in `kit/README.md` under "One-time setup outside the repo": the Actions secrets and variables, the `production` environment, branch protection, Issue Types, the Netlify project with builds stopped, the Supabase project.

Until those exist, previews skip and production deploys fail. That is expected; say so.

## Step 9: tell the handbook

The new repo belongs in the handbook's `adoption.md`. That is a separate pull request to the handbook repository. If you cannot open it from here, give the user the row to add.

## Stop and ask before

- Creating a repository, a Supabase project, a Netlify project, or anything else that costs money or needs an account.
- Adding a dependency the blueprint does not list.
- Choosing something the handbook marks **Open** (see `decisions.md`). Name the options and the handbook's leaning; let the owner decide.
