<!--
  TEMPLATE. Copy to CLAUDE.md at the repo root, then:
    1. Replace every <PLACEHOLDER>.
    2. Delete sections that do not apply (marked "if ...").
    3. Delete this comment.
  Keep it short enough to read in full. Link to docs/architecture.md for the why.
  Source: https://qiheme.github.io/#/standards/agents
-->

# CLAUDE.md — <REPO NAME>

Rules for Claude Code, other agents and humans working in this repository.

**What this is:** <one sentence: what the product does and for whom>.

**Stack:** <e.g. React 19 · Vite · TypeScript · Cobalt + Tailwind v4 · Supabase · Vitest · Playwright>. Node ≥ 24.

**Blueprint:** [<Web app | Static site | Full-stack app | Library | Functions | CLI>](https://qiheme.github.io/#/blueprints/README) from the [Engineering Handbook](https://qiheme.github.io). This file is self-contained; the handbook has the reasons. Where the two disagree, this file wins and the difference is listed under [Deviations](#6-deviations-from-the-standard).

## Commands

```bash
npm run dev             # dev server
npm run build           # production build
npm run lint            # ESLint, zero warnings allowed
npm run typecheck       # tsc --noEmit. Vitest does NOT typecheck
npm test                # unit tests once, no coverage
npm test -- <name>      # one file or suite by name filter
npm run test:coverage   # unit tests WITH the 100% floor enforced. This is the gate
npm run test:e2e        # Playwright against the built app (run `npm run build` first)
```

<if the repo has a database>
```bash
npm run db:migrate      # apply pending migrations to DIRECT_URL
npm run db:generate     # Drizzle repos: generate a migration after editing the schema
```

Git hooks (husky): **pre-commit** lints staged files; **pre-push** runs `typecheck` and `test:coverage`.

## Project layout

```
<tree, one line per folder. Say what each folder is allowed to contain.>
```

## 1. Work starts with an issue

1. **Every piece of work has a GitHub issue first.** If none exists, open one before writing code. Use the Feature, Bug or Task form and set the Issue Type.
2. Branch from the issue: `feat/<n>-short-slug` or `fix/<n>-short-slug`.
3. Commits and the PR reference the issue. The PR body says `Closes #<n>` (or `Part of #<n>`).
4. **Out-of-scope discoveries are filed, not fixed.** Open an issue and carry on. Reference it in a code comment if it matters right there (`// TODO: see #42`).

## 2. Test first: red → green → refactor

Applies to every piece of logic. Layout, copy and styling are exempt; any component with a condition or a computed value is logic.

1. **Red.** Write the failing test first, with a stub that compiles but returns the wrong answer. Run it and read the failure: it must fail for the intended reason.
2. **Green.** The minimum code to pass. Reach **100% coverage on the files you touched before moving on** (`npm run test:coverage`).
3. **Refactor.** Clean up with tests green. No new behaviour.

Commit each phase: `test(scope): red — …`, `feat(scope): green — …`, `refactor(scope): …`.

- A passing test proves nothing until you have seen it fail.
- When a coverage gap appears, ask what behaviour is untested and add that test. Do not exclude the file.
- Never skip, disable or delete a test to get green. Never lower a threshold.
- Every coverage exclusion in the Vitest config has a written reason.

## 3. Quality gates

| Gate | When | What |
| --- | --- | --- |
| lint-staged | pre-commit | `eslint --fix --max-warnings 0` on staged files |
| typecheck + coverage | pre-push | `npm run typecheck && npm run test:coverage` |
| CI | every PR | lint → typecheck → coverage → build → end-to-end<, plus a migrations job> |

Coverage is a hard floor: **100% lines, branches, functions and statements.**

## 4. Architecture rules

<The rules specific to this repo, each with its reason. Keep the ones below that apply; add your own.>

- **Logic is pure and takes its dependencies as arguments** (HTTP client, database client, clock). Production wiring supplies the real ones. Thin entry points only construct and delegate.
- **Views hold no business logic.** Only organisms and pages touch app state; atoms, molecules and templates take props.
- **Components follow atomic design.** A level imports from its own level or below, never above.
- **Cobalt first.** If `@q-labs/cobalt` has the component, import it. Colours, type, radius and shadow come from its tokens. No raw hex values.
- <if the repo has a database> **Every table has row-level security on.** Schema changes are migration files in this PR; they only add things. Never change the schema through the dashboard or an MCP tool.
- <if the repo has server code> **Every server endpoint authenticates inside the handler.** Failures are returned as `{ ok: false, error: { code, message } }`; only the code and message cross the wire.
- <if the repo has an interface> **UI meets the Front-End Checklist** ([frontendchecklist.io](https://frontendchecklist.io)): Critical rules always, High rules for anything new. `e2e/quality.spec.ts` automates the checkable ones; review the rest with the checklist's MCP server or skills before opening a PR that changes what users see.
- **Anything prefixed `VITE_` or `PUBLIC_` is public.** Secrets live in Supabase Function secrets or GitHub Actions secrets, never in the repo.

### Do not break

<Rules whose violation is a security or data-loss bug. State each as an invariant and name the test that guards it. Delete this section if there are none.>

## 5. Commits and PRs

- **Conventional commits**: `type(scope): description (#issue)`. Types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`, `ci`.
- The PR title is conventional too. The PR body follows `.github/pull_request_template.md`, including **evidence it works at runtime**: what you ran and what you saw. Green CI is not evidence.
- <if a deployed app> **Bump the version** in a user-facing PR: `npm version <patch|minor|major> --no-git-tag-version`. The merge tags and deploys it.
- **Docs parity.** A PR that changes behaviour, structure, setup or conventions updates `README.md` (and `docs/architecture.md`) in the same PR.
- **No new dependency without discussion.** Open an issue first.
- Before opening the PR, run the `verify` skill (`.claude/skills/verify`).
- To check this repo against the standard: `/handbook-audit`, or `node .claude/skills/handbook-audit/scripts/audit.mjs . --all`.

## 6. Deviations from the standard

<Where this repo differs from https://qiheme.github.io and why. "None" is a fine answer.>

| Standard | This repo | Reason | Tracking issue |
| --- | --- | --- | --- |
| | | | |

## 7. Environment gotchas

<Things that cost someone an hour once. Tool quirks, version pins and why, what cloud sessions cannot do here.>

- **Cloud sessions:** Chromium is pre-installed; never run `playwright install`. Outbound internet is allow-listed.
- **Shell:** `pkill -f "pattern"` kills the shell that contains the pattern; use `pkill -f "[p]attern"`.
