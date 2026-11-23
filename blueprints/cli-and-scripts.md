# Blueprint: CLI and scripts

For anything run from a terminal: a Node tool that ships with an app, a standalone command-line program, shell scripts that set up a machine, or a Python script that crunches a file.

Three languages, one idea: **decisions live in pure functions that are tested; the part that touches the real world is a thin shell around them.**

| Kind | Language | Reference repo |
| --- | --- | --- |
| A tool that belongs to an app (import, migrate, release notes) | Node, in the app's repo | `easy-finances` `scripts/` (private) |
| A standalone command-line program | Node, in its own repo | None yet |
| Machine setup, glue between other programs | Bash | `setup-scripts` (private) |
| Data crunching, one-off analysis | Python | None in the tagged repos |

## Node tools

### Layout

```
scripts/
  <tool>/
    bin/run.js        The only impure file: builds real ports, dispatches. Excluded from coverage
    cli.js            Argument parsing and command dispatch
    commands.js       What each command does, written against ports
    config.js         Reads and validates the environment
    *.test.js         100% on everything outside bin/
  README.md           The full reference for every tool
```

A **port** is a small object standing in for the outside world: `fs`, `fetch`, the clock, the database client. `bin/run.js` builds the real ones; tests pass fakes.

### Rules

| Rule | Why |
| --- | --- |
| **Expose each tool as an npm script**: `npm run <tool> -- <command>` | One way to run things; no global installs |
| **Reuse the app's pure modules** instead of copying them | The tool and the app cannot drift |
| **Every command that changes something has `--dry-run`** | See what would happen first |
| **Validate configuration up front** and fail with a readable message | A missing variable should not surface as a stack trace ten steps later |
| **Tool secrets live in a separate, git-ignored env file with owner-only permissions.** The tool refuses to run if the file is readable by others | |
| **Never store a third-party password.** If a human login is needed, open a visible browser and save only the session | |
| **Record progress only after the step succeeds** | A failed push must not mark the item as done |
| **Take a lock for anything that must not run twice at once** (migrations use a Postgres advisory lock) | |
| **Exit codes mean something**: 0 success, non-zero failure. CI depends on it | |

### A standalone Node CLI

The same layout at the repo root (`src/` instead of `scripts/<tool>/`), with the full [repo contract](../standards/repo-contract.md), a `bin` entry in `package.json`, and TypeScript. Publish to GitHub Packages with Changesets if other repos install it ([Library](library.md)); otherwise tag releases like an app.

## Shell scripts

Use bash when the job is installing things or wiring programs together. If it starts needing data structures, write it in Node.

| Layer | Choice |
| --- | --- |
| Shell | Bash. `set -u` at least; `set -euo pipefail` unless the script must survive a failing step |
| Lint | `shellcheck` on every file |
| Tests | `bats` unit tests |
| CI | GitHub Actions. On `macos-latest` when the scripts are macOS-specific |
| Entry point | One `test.sh` that runs lint, syntax checks and all tests. CI runs the same script |

### Rules

| Rule | Why |
| --- | --- |
| **Put decisions in pure functions** (`lib/pure.sh`): arguments in, result printed, no side effects | "Which folders would this delete?" can be tested without deleting anything |
| **Tests run against temp folders, never the real machine** | |
| **Scripts converge**: running twice gives the same result as running once. Skip what is already done | Safe to re-run on a machine that is half set up |
| **Never delete without asking**, name exactly what will go, and default to No | |
| **Back up before replacing a file** | |
| **One config file** holds everything a user should edit | |
| **Number the steps** (`00-…`, `01-…`) and make each runnable alone | |
| **A script that must not fail the caller ends each risky line with a warning, not an exit** | A cloud setup script that exits non-zero stops the session starting |

## Python scripts

Proposed. Nothing in the tagged repos is Python, so this records the toolchain the machine setup already installs.

| Layer | Choice |
| --- | --- |
| Version and packages | `uv`. Python 3.12 |
| Lint and format | `ruff` |
| Tests | `pytest`, same coverage bar for anything kept |
| One-off scripts | A single file that carries its own dependencies: `uv add --script report.py pandas`, then `uv run report.py` |
| Projects | `uv init`, `pyproject.toml`, `uv sync`, `uv run` |

A throwaway analysis does not need tests. A script that runs more than twice, or that anyone else runs, is a project and follows the rules.

## Which language

| The job | Use |
| --- | --- |
| Shares logic or types with an app | Node, in that app's repo |
| Talks to our APIs or database | Node |
| Installs software, edits dotfiles, chains commands | Bash |
| Tables, statistics, spreadsheets, PDFs | Python |
| Longer than about 200 lines of bash | Rewrite in Node |
