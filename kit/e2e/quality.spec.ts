/**
 * Front-End Checklist, the part a machine can check.
 * Standard: https://qiheme.github.io/#/standards/frontend-checklist
 *
 * Copy to e2e/quality.spec.ts (tests/e2e/ in a static site) and list every
 * route a visitor can land on in PAGES. Each test names the checklist rules it
 * covers, so a failure points at a rule page on https://frontendchecklist.io/rules.
 * Checks are soft assertions: one run reports every broken rule, not just the first.
 *
 * This is a floor, not the whole checklist. Rules about content quality,
 * performance budgets and keyboard flows still need a person or an agent.
 *
 * Needs: @playwright/test and @axe-core/playwright
 */
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** Every route a visitor can land on. Keep it in step with the app. */
const PAGES = ['/']

/**
 * True for pages search engines should index (marketing sites, public pages).
 * Set to false for an app that lives behind a login: the description,
 * canonical URL, robots.txt and sitemap checks are then skipped.
 */
const INDEXABLE = true

for (const path of PAGES) {
  test.describe(`front-end checklist: ${path}`, () => {
    // HTML: doctype, charset, viewport, lang, unique-id. CSS: do not disable pinch zoom.
    test('document basics', async ({ page }) => {
      await page.goto(path)
      const doc = await page.evaluate(() => {
        const ids = Array.from(document.querySelectorAll('[id]'), (el) => el.id)
        return {
          doctype: document.doctype?.name ?? '',
          charset: document.characterSet,
          charsetFirst: document.head.firstElementChild?.matches('meta[charset]') ?? false,
          viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? '',
          lang: document.documentElement.getAttribute('lang') ?? '',
          duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i),
        }
      })
      expect.soft(doc.doctype, 'HTML5 doctype').toBe('html')
      expect.soft(doc.charset, 'UTF-8 character encoding').toBe('UTF-8')
      expect.soft(doc.charsetFirst, '<meta charset> is the first element in <head>').toBe(true)
      expect.soft(doc.viewport, 'responsive viewport meta tag').toContain('width=device-width')
      expect
        .soft(doc.viewport, 'pinch zoom is not disabled')
        .not.toMatch(/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0*)?(\s*,|\s*$)/)
      expect.soft(doc.lang, 'lang attribute on <html>').not.toBe('')
      expect.soft(doc.duplicateIds, 'every id is unique').toEqual([])
    })

    // SEO: page title, single H1, meta description, canonical URL.
    test('title, heading and search basics', async ({ page }) => {
      await page.goto(path)
      expect.soft((await page.title()).trim(), 'descriptive page title').not.toBe('')
      await expect.soft(page.locator('h1'), 'exactly one <h1>').toHaveCount(1)
      test.skip(!INDEXABLE, 'not an indexable page')
      const head = await page.evaluate(() => ({
        descriptions: Array.from(document.querySelectorAll('head meta[name="description"]'), (el) =>
          (el.getAttribute('content') ?? '').trim(),
        ),
        canonicals: Array.from(document.querySelectorAll('head link[rel="canonical"]'), (el) =>
          el.getAttribute('href'),
        ),
      }))
      expect.soft(head.descriptions, 'one meta description').toHaveLength(1)
      expect.soft(head.descriptions[0] ?? '', 'meta description text').not.toBe('')
      expect.soft(head.canonicals, 'one canonical URL').toHaveLength(1)
      expect.soft(head.canonicals[0] ?? '', 'canonical URL is absolute').toMatch(/^https:\/\//)
    })

    // Images: alt text, explicit width and height, no broken images.
    test('images', async ({ page }) => {
      await page.goto(path, { waitUntil: 'load' })
      const images = await page.evaluate(() =>
        Array.from(document.images, (img) => ({
          src: img.currentSrc || img.src,
          hasAlt: img.hasAttribute('alt'),
          sized: img.hasAttribute('width') && img.hasAttribute('height'),
          broken: img.complete && img.naturalWidth === 0,
        })),
      )
      expect
        .soft(
          images.filter((i) => !i.hasAlt).map((i) => i.src),
          'images without an alt attribute',
        )
        .toEqual([])
      expect
        .soft(
          images.filter((i) => !i.sized).map((i) => i.src),
          'images without width and height',
        )
        .toEqual([])
      expect
        .soft(
          images.filter((i) => i.broken).map((i) => i.src),
          'broken images',
        )
        .toEqual([])
    })

    // Security: no mixed content. HTML: Subresource Integrity on external scripts and styles.
    // JavaScript: error handling (no uncaught errors, no console errors).
    test('loads cleanly and safely', async ({ page, baseURL }) => {
      const origin = new URL(baseURL ?? 'http://localhost').origin
      const errors: string[] = []
      const insecure: string[] = []
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('request', (request) => {
        const url = request.url()
        if (url.startsWith('http://') && !url.startsWith(origin)) insecure.push(url)
      })
      await page.goto(path, { waitUntil: 'load' })
      const withoutIntegrity = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>(
            'script[src], link[rel="stylesheet"][href]',
          ),
        )
          .filter((el) => {
            const url = new URL(el instanceof HTMLScriptElement ? el.src : el.href)
            // Font stylesheets are generated per browser, so they cannot be pinned by hash.
            return (
              url.origin !== location.origin &&
              url.hostname !== 'fonts.googleapis.com' &&
              !el.integrity
            )
          })
          .map((el) => (el instanceof HTMLScriptElement ? el.src : el.href)),
      )
      expect.soft(errors, 'console errors and uncaught exceptions').toEqual([])
      expect.soft(insecure, 'requests over plain http').toEqual([])
      expect
        .soft(withoutIntegrity, 'external scripts and styles without an integrity hash')
        .toEqual([])
    })

    // Accessibility: names, labels, contrast, ARIA validity, landmarks, heading order and more.
    // axe covers a large share of the checklist's accessibility rules, not all of them.
    test('accessibility (axe, WCAG 2.2 A and AA)', async ({ page }) => {
      await page.goto(path)
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()
      expect
        .soft(
          violations.map(
            (v) =>
              `${v.id}: ${v.help} (${v.nodes.length} element${v.nodes.length === 1 ? '' : 's'})`,
          ),
          'axe violations',
        )
        .toEqual([])
    })
  })
}

// SEO: robots.txt and XML sitemap.
test.describe('front-end checklist: site files', () => {
  test.skip(!INDEXABLE, 'not an indexable site')

  test('robots.txt is published', async ({ request }) => {
    expect.soft((await request.get('/robots.txt')).status(), 'GET /robots.txt').toBe(200)
  })

  test('an XML sitemap is published', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text()
    const sitemap = robots.match(/^sitemap:\s*(\S+)/im)?.[1]
    expect.soft(sitemap, 'robots.txt names the sitemap').toBeTruthy()
    const path = new URL(sitemap ?? '/missing-sitemap', 'http://localhost').pathname
    expect.soft((await request.get(path)).status(), `GET ${path}`).toBe(200)
  })
})
