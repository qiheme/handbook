# Target architecture: <EPIC NAME> (#<ISSUE>)

<!-- Copy to docs/architecture/<issue>-<slug>.md. Delete these comments. -->

What changes underneath the app to build #<ISSUE>, why, and in what order. The starting point is `../architecture.md`. Each choice has a record in `../decisions/`.

**Status: proposed.** <!-- or: accepted by #<PR> -->

## The plan on one page

| # | Change | Why | Where the work is |
| --- | --- | --- | --- |

## Target picture

<!-- The baseline's diagram, as it will be. -->

## What changes, layer by layer

| Layer | Today | Target | Story |
| --- | --- | --- | --- |

## Data

### What goes where

| Data | Today | Target | Story |
| --- | --- | --- | --- |

### New tables

<!-- An erDiagram. The shape, not the migration: each story writes its own, test first. -->

### Rules every new table follows

| Rule | Why |
| --- | --- |

### Changes to existing data

| Change | How | Story |
| --- | --- | --- |

## The write path

## Server functions

| Function | Trigger | Caller proves itself with | Change in this epic |
| --- | --- | --- | --- |

## Environments

| Environment | Code | Data | Who can reach it |
| --- | --- | --- | --- |

## Story map

<!-- Architecture that belongs to one experience is written into that story. This is the index. -->

| Story | What it changes underneath | Needs first |
| --- | --- | --- |

## Order

| Wave | Stories | Must land before |
| --- | --- | --- |

<!-- Sizes on the issue-form scale. No dates. -->

## Running cost

| Change | Effect on cost |
| --- | --- |

## Risks and what is not verified

| Risk or gap | Effect | Settled by |
| --- | --- | --- |
