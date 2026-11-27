---
name: verify
description: Build/launch/drive recipe for runtime-verifying changes to <REPO NAME> (<one line: what kind of app and what there is to drive>).
---

<!--
  TEMPLATE. Copy to .claude/skills/verify/SKILL.md, replace every <PLACEHOLDER>,
  and delete this comment. Write down the steps that actually worked, with the
  exact commands and ports. Update it whenever a step stops working.
  Source: https://qiheme.github.io/handbook/#/standards/agents
-->

# Verifying <REPO NAME> at runtime

Green unit tests are necessary, not sufficient. Before opening a PR, run the change in the built app. These steps are the ones that worked.

## Build and serve

```bash
npm run build                                   # writes <dist/ | .output/>
<command that serves the build on a spare port> &
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:<PORT>/
```

Stop it with `pkill -f "[p]attern-of-the-serve-command"`. The brackets matter: a bare pattern also matches the shell running the command and kills it.

## Drive it with a real browser

In a cloud session Chromium is pre-installed at `/opt/pw-browsers/chromium`. Do not run `playwright install`.

- If the repo has a Playwright suite: `npm run test:e2e`.
- For a one-off check, drive the page with a short script and take a screenshot:

```js
import { chromium } from '@playwright/test'
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:<PORT>/<path>')
// click through the change, assert what you expect, then:
await page.screenshot({ path: 'verify.png' })
await browser.close()
```

## Check UI changes against the Front-End Checklist

For a change users can see: run `npm run test:e2e` (it includes `quality.spec.ts`), then review the changed components and pages with the Front-End Checklist MCP server or skills. Fix Critical and High findings from this change. File the rest as issues.

## What to check for this repo

<The flows that matter here, as a short list. For each: where to click, what you should see.>

1.
2.

## <If there is server code> Check server-only code did not reach the browser

After the build, search the client bundle. Each of these must have zero matches:

```bash
grep -cE "<server-only package or symbol names>" <path to client assets>/*.js
```

Do this only when a route really uses the server code. Without a consumer the check passes vacuously, because the code is in no bundle at all.

## <If there is a database> Check migrations against a real Postgres

```bash
<commands to start a throwaway Postgres>
export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:<PORT>/postgres
npm run db:migrate; npm run db:migrate          # twice; the second must change nothing
<commands to stop and delete it>
```

Do not judge success by the exit code of `| tail`. Redirect output to a file and read `$?` from the command itself.

## What this sandbox cannot do

<Be explicit, so nobody claims a check that never ran. For example: outbound internet is allow-listed, so calls to third-party APIs cannot be tried here.>

## Clean up

`git status` must show only the files you meant to change. Remove any temporary route, flag or script you added for the check.
