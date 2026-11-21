# Blueprint: Static site

For sites that are mostly content: a studio site, a portfolio, a blog, a landing page. The whole site is built into plain files ahead of time. No server runs.

**Reference repos:** `cloud129-site` (private; has the full pipeline), `portfolio`.

## The stack

| Layer | Choice | Status |
| --- | --- | --- |
| Framework | Astro, `output: 'static'` | Adopted |
| Language | TypeScript, `astro/tsconfigs/strict` | Adopted |
| Design | `@q-labs/cobalt`: tokens always, components rendered to HTML with no client JavaScript | Tokens from the package: In use (one repo). Components in Astro: Proposed, shown working only in Cobalt's own example |
| Layout CSS | Tailwind v4 on Cobalt tokens for new sites. Plain CSS on tokens is fine where it already exists | Proposed |
| Interactivity | Vanilla script in `public/` for small things (theme, menu). A React island (`client:*`) only for a real widget | In use (one repo) |
| Content | Astro content collections: Markdown and YAML in `src/content/`, typed by a schema | In use (one repo) |
| Editing by non-developers | Sveltia CMS at `/admin/`, committing to Git | In use (one repo). Optional |
| Forms | Netlify Forms | In use (one repo) |
| SEO | `@astrojs/sitemap`, an RSS endpoint, canonical and Open Graph tags from the layout | In use (one repo) |
| Unit tests | Vitest on pure helpers in `src/lib/`, 100% coverage of that folder. Tests live in `tests/` | In use (one repo). The coverage gate is Proposed |
| End-to-end | Playwright against `astro preview` of `dist/`, desktop and mobile | In use (one repo) |
| Type check | `astro check` | In use (one repo) |
| Host | Netlify, prebuilt | In use (one repo). One site is still on Vercel |

## Create it

```bash
npm create astro@latest my-site -- --template minimal --typescript strict
cd my-site
npx astro add react sitemap
npm install @q-labs/cobalt
npm install -D tailwindcss @tailwindcss/vite vitest @vitest/coverage-v8 jsdom @playwright/test
```

Then copy the kit: [`kit/README.md`](../kit/README.md).

## Folder layout

```
src/
  pages/          One file per route. Thin: fetch content, pass it to components
  layouts/        Layout.astro: the document shell, <head>, theme, nav, footer
  components/     .astro components
  content/        Markdown and YAML, by collection
  content.config.ts   Collection schemas
  lib/            Pure helpers: sorting, grouping, feed items, date copy
  data/           Site-wide settings in one JSON file
  styles/         App CSS on Cobalt tokens
public/           Static files, the small browser script, admin/ for the CMS
tests/            *.test.ts unit tests
tests/e2e/        *.spec.ts Playwright specs
```

## Rules for this blueprint

| Rule | Why |
| --- | --- |
| **Logic lives in `src/lib/`, not in `.astro` frontmatter** | Frontmatter cannot be unit-tested. A pure function can |
| **No client JavaScript by default** | Cobalt components render to HTML. Add a `client:*` directive only when something must respond to the user |
| **Pages must work without JavaScript** | Reveal animations and similar are enabled by a class the script adds, never hard-coded |
| **`site` in `astro.config.mjs` matches the production domain** | Canonical URLs, the sitemap and the feed are built from it |
| **All copy and settings come from content files or one data file** | Change it once, it updates everywhere. Non-developers can edit it |
| **Import `@q-labs/cobalt/tokens`; never copy the token file** | A copy goes stale |
| **The browser script is tested** by loading the real file into jsdom and clicking through it | It is logic like any other |

## Scripts

| Script | Command |
| --- | --- |
| `dev` | `astro dev` |
| `build` | `astro build` |
| `preview` | `astro preview` |
| `typecheck` | `astro check` |
| `lint` | `eslint . --max-warnings 0` |
| `test` / `test:coverage` | `vitest run` / `vitest run --coverage` |
| `test:e2e` | `playwright test` |

## End-to-end suite

Start with these specs. They catch the failures a content site actually has.

| Spec | Guards against |
| --- | --- |
| `pages` | A page failing to load, or missing its `<h1>`, title or canonical URL |
| `navigation` | Broken nav links; the mobile menu not opening |
| `theme` | The light/dark toggle not working or not persisting |
| `forms` | A form losing the attributes Netlify needs (submissions would vanish silently) |
| `seo` | The 404 page, feed, sitemap and `robots.txt` |
| `links` | Any internal link pointing at a page that does not exist |

Every test also fails on a console error. The suite starts its own preview server on a port the dev server does not use.

## Deploying

The standard pipeline, unchanged: [CI/CD](../standards/ci-cd.md). The artifact is `dist/`.

Do not add a host adapter (`@astrojs/vercel`, `@astrojs/netlify`). A static site needs none, and without one the same `dist/` deploys anywhere.

## When this blueprint stops fitting

| Need | Do |
| --- | --- |
| A contact form | Netlify Forms. Still static |
| Sign-in, or per-user data | It is an app. Use [Web app](web-app.md), and keep the marketing pages here |
| A few dynamic endpoints (a webhook, a scheduled rebuild) | Add [Functions](functions.md) |
