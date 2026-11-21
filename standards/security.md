# Security

Short rules that apply to every repo. Most of them answer one question: where does this secret go?

## Where each secret goes

| Secret | Put it | Never |
| --- | --- | --- |
| Token for installing `@q-labs/cobalt` | Your user-level `~/.npmrc`. In CI: the `COBALT_PACKAGES_TOKEN` secret | In the repo's `.npmrc`. The committed file holds only the registry line |
| Netlify token, site ID | GitHub Actions secrets | In `netlify.toml` or the repo |
| Database URL and password | GitHub Actions secret on the `production` environment, scoped to the migrate step. The host's environment for a running server | In a `VITE_*` variable, in `.env.example`, in chat |
| Supabase service-role key | Supabase Function secrets, or the server host's environment | Anywhere a browser bundle or an agent's machine can read it |
| Third-party API keys (model providers, payment, banking) | Supabase Function secrets | In the frontend. In a cloud environment's plain variables |
| Public values: Supabase URL, publishable key, feature flags | `.env` locally, GitHub Actions **variables** in CI | Treated as secret. They are in the bundle |
| A key an agent's cloud session must send | A network secret on a separate keyed environment ([Agents](agents.md#cloud-sessions)) | Pasted into chat. Chat is not a secret store |

`.env` is git-ignored. `.env.example` is committed and documents every variable with a placeholder value.

## Rules

| Rule | Why |
| --- | --- |
| **Anything prefixed `VITE_` or `PUBLIC_` is public.** | It is compiled into the JavaScript every visitor downloads |
| **Authenticate inside the handler.** Every server function, Edge Function and API route checks who is calling, itself | A route guard only hides a page. The endpoint is still reachable |
| **Never import server-only code from client code.** After changing server wiring, build and search the client bundle for it | A database driver in the browser bundle is a leak |
| **Return failures as data**: `{ ok: false, error: { code, message } }`. Only the code and message cross the wire | Stack traces and provider error strings leak internals |
| **Validate at every boundary** with zod: form input, function input, webhook payloads, model output | |
| **Untrusted code gets no credentials.** A PR build runs with a read-only token | See [CI/CD](ci-cd.md#previews-are-split-in-two-on-purpose) |
| **Tokens you issue are stored as hashes** and shown to the user once | A database leak does not leak usable tokens |
| **Stored third-party tokens are encrypted**, in a table with RLS on and no policies | Only the service role can read it |
| **Row-level security on every table** | [Data](data.md#rules-for-every-table) |
| **Links saved from user input are `http(s)` only** | A stored `javascript:` URL becomes a clickable attack |
| **Every site sends security headers**: HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and a Content-Security-Policy written for that app. Start from [`kit/netlify/_headers`](../kit/netlify/_headers) | The Security rules of the [Front-end checklist](frontend-checklist.md). Proposed |
| **External scripts and styles carry an integrity hash**, and are pinned to an exact version | A changed file on someone else's CDN cannot run on our pages |
| **No new dependency without discussion.** Open an issue first | Every package is code you run with your secrets |

## Fetching URLs that users supply

If the server fetches a URL someone typed in, it can be pointed at your own internal network. Any code that does this must:

1. Allow `http` and `https` only, no credentials in the URL, standard ports only.
2. Block internal hostnames and private, loopback, link-local and cloud-metadata address ranges.
3. Check the address **at connection time**, not before, so a hostname cannot answer "public" to the check and "private" to the request.
4. Follow redirects by hand and re-check every hop.
5. Use one overall deadline and a size cap.

Do not add an "allow private addresses" switch to production code. Tests that need a local server inject a permissive lookup.

## AI and model providers

- Provider keys live in Supabase Function secrets. They are never on a laptop, in a repo, or in the browser.
- Calls go through a provider adapter, and every repo has a **mock** provider. Tests and demo mode use the mock, so no key is needed to run the suite.
- Model output is untrusted input. Validate it with zod and sanitise it before it reaches the client.
- The model name comes from configuration, not from code.

## Agents and the Supabase MCP server

- Agents do not apply schema changes or run writes against production through an MCP tool. Schema changes are migration files in a PR.
- Use a scoped access token for MCP servers, not a full-account one.
- A host blocked by a cloud environment's network policy is a settings change for the owner, not something to work around.

## Reporting a security problem

Do not post details in a public issue. Use the repo's private security advisory (Security → Advisories → Report a vulnerability).

## This handbook is public

It holds no secret values and no internals of private projects. Names of secrets (like `NETLIFY_AUTH_TOKEN`) are fine. Values, project IDs, internal URLs and private repo details are not.
