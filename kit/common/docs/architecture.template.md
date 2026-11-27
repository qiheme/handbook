# Architecture: as built

<!-- Copy to docs/architecture.md. Delete these comments. Keep the section order. -->

What <PROJECT> is made of today, where each part runs, and why. This page changes in the same pull request as the code it describes.

- **Where the app is going:** `architecture/` (one page per epic).
- **Why each choice was made:** `decisions/`.

**Checked on <DATE>** against `main` at `<COMMIT>`, <WHICH LIVE SOURCES WERE READ>.

## The system in one picture

<!-- A Mermaid flowchart: people, the app, each service, the arrows between them. -->

## Where each part runs

| Part | Runs on | Talks to the database as | Source |
| --- | --- | --- | --- |

## Code layout and layers

| Rule | Enforced by |
| --- | --- |

## State and the write path

<!-- A sequence diagram from a tap to the database. Say what happens when the write fails. -->

## Data model

<!-- An erDiagram. Then: keys, policies, what is stored as JSON. -->

## Server functions

| Function | Started by | Caller proves itself with | Reads | Writes | Outside call |
| --- | --- | --- | --- | --- | --- |

## Outside services and what they cost

<!-- Every service, including free ones. -->

| Service | Used for | Called from | Key | Cost today | What would make it cost money |
| --- | --- | --- | --- | --- | --- |

## Build, checks and delivery

| Gate | Runs | What it checks |
| --- | --- | --- |

## Production today

| Fact | Evidence |
| --- | --- |

## Gaps against the handbook

<!-- Stack-level only. Every row has an issue. Never write a security weakness here. -->

| Standard | Here | Issue |
| --- | --- | --- |

## Not verified

| What | Why not | What would settle it |
| --- | --- | --- |
