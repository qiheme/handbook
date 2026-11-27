# UI and Cobalt

Every interface is built on **Cobalt** (`@q-labs/cobalt`), the React component library for the Quincy OS design system. Dark by default, cobalt and crimson accents, Space Grotesk / DM Sans / JetBrains Mono.

- Repo: <https://github.com/q-labs/cobalt>
- Component explorer (Storybook): <https://q-labs.github.io/cobalt>

## The rules

| Rule | Detail |
| --- | --- |
| **Cobalt first** | If Cobalt has the component, import it. Do not rebuild it |
| **Tokens only** | Colours, type, radius, spacing and shadow come from Cobalt's tokens. No raw hex values. No second palette |
| **Tailwind for layout** | Tailwind v4 utilities place and space things. Cobalt's tokens are mapped into the Tailwind theme so utilities follow the active theme |
| **Missing a component?** | Build a thin local version from tokens, and open an issue on Cobalt to add it there. Do not invent one silently |
| **Never copy the token file** | Import `@q-labs/cobalt/tokens`. A copy goes stale |

## Installing Cobalt

Cobalt is published to GitHub Packages, which needs a token even to read.

1. The repo's committed `.npmrc` has one line and no secret:
   ```
   @q-labs:registry=https://npm.pkg.github.com
   ```
2. Your token (a GitHub personal access token with `read:packages`) goes in your **user-level** `~/.npmrc`:
   ```
   //npm.pkg.github.com/:_authToken=<your token>
   ```
3. `npm install @q-labs/cobalt`.

In CI the token is the `COBALT_PACKAGES_TOKEN` secret. See [CI/CD](ci-cd.md#secrets-and-variables).

## Wiring it up

### React apps

```tsx
import { CobaltProvider } from '@q-labs/cobalt'

<CobaltProvider>
  <App />
</CobaltProvider>
```

Import the stylesheet once, in the app's CSS entry, together with Tailwind and the token mapping. The file is in the kit: [`kit/ui/app.css`](../kit/ui/app.css).

```css
@import 'tailwindcss';
@import '@q-labs/cobalt/styles.css';

@theme inline {
  --color-canvas: var(--bg-base);
  --color-surface: var(--bg-surface);
  --color-fg: var(--text-primary);
  --color-fg-muted: var(--text-secondary);
  --color-line: var(--border-default);
  --color-accent: var(--accent-default);
  /* …the full mapping is in the kit file */
}
```

Now `bg-surface`, `text-fg-muted`, `border-line` and `bg-accent` work as Tailwind utilities and switch with the theme.

Names avoid Tailwind's own: `text-base` is a font size in Tailwind, so Cobalt's `--bg-base` is mapped as `canvas`, and text colours are `fg-*`.

Import the full stylesheet rather than per-component CSS: per-component imports have been tree-shaken out of production builds, leaving components unstyled.

### Astro sites

Cobalt's components have no hooks or browser APIs, so Astro renders them to plain HTML and ships **no JavaScript** for them.

```astro
---
import '@q-labs/cobalt/styles.css'
import { Heading, Button } from '@q-labs/cobalt'
---
<html lang="en" data-theme="dark">
  <body>
    <Heading level={1}>Hello</Heading>
    <Button variant="primary">Get started</Button>
  </body>
</html>
```

Set `data-theme` on the `<html>` element instead of using `CobaltProvider`. Add a `client:*` directive only for a component that is truly interactive.

## Theming

- Dark is the default (`:root`). Light is `[data-theme="light"]`.
- An app may offer alternate accents by overriding Cobalt's `--accent-*` tokens. It may not define new colour names.
- Respect `prefers-reduced-motion`.

## Component structure

Each repo chooses how it groups components in `src/components/` and states it in its `CLAUDE.md`. No layout is required (D26). A repo that uses atomic design may keep it. These rules hold whatever the layout:

- **Only route-level and feature components touch app state.** Everything else takes props. Small pieces stay reusable and are tested by rendering them with props.
- **Views hold no business logic.** Logic lives in pure modules in `src/lib/` and is tested there.
- Guard "Cobalt first" with a test that fails when a hand-rolled copy of a Cobalt component appears.

## Inside Cobalt

When the work is on the library itself, different rules apply. See [Library](../blueprints/library.md).

- CSS Modules only. No Tailwind, no inline styles.
- Every value is a token: `var(--accent-default)`, not `#2563EB`.
- Each component ships five files: implementation, styles, tests, stories, index.

## Accessibility

The full rules are the Accessibility category of the [Front-end checklist](frontend-checklist.md): 95 rules, 9 of them Critical. The short version, for when you are in the middle of building something:

- One `<h1>` per page, and headings in order.
- Everything interactive is reachable and usable by keyboard, with a visible focus style.
- Every input has a label. Every button and link has a name that says what it does.
- Text meets the minimum contrast ratio. Cobalt's tokens are chosen to; your own combinations may not.
- Respect `prefers-reduced-motion`.
- Pages work without JavaScript where the content does not need it.

[`quality.spec.ts`](../kit/e2e/quality.spec.ts) runs axe on every route and fails on a violation. axe cannot test keyboard flow or how a page sounds in a screen reader; those are checked by hand before launch.
