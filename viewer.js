/*
 * The handbook viewer's configuration and its two small plugins.
 *
 * The handbook is the Markdown files in this repository. Docsify fetches and
 * renders them in the browser; there is no build step. This file is loaded
 * before Docsify (all scripts are deferred, so they run in document order).
 */
;(function () {
  var REPO = 'qiheme/qiheme.github.io'
  // HEAD follows the default branch, so links survive a branch rename.
  var BLOB = 'https://github.com/' + REPO + '/blob/HEAD/'

  // Mermaid is 3.5 MB, so it is fetched only when a page has a diagram.
  // Pinned to an exact version and checked against its hash before it runs.
  var MERMAID = {
    src: 'https://cdn.jsdelivr.net/npm/mermaid@11.17.2/dist/mermaid.min.js',
    integrity: 'sha384-EOXBFmc3gx5mb+vn0vPvvGqACToJD24hhacX5Yx+8NUUQrHIle/Qi5Bg9o3zKwW2',
  }
  var mermaidLoading = null

  function loadMermaid() {
    if (!mermaidLoading) {
      mermaidLoading = new Promise(function (resolve, reject) {
        var script = document.createElement('script')
        script.src = MERMAID.src
        script.integrity = MERMAID.integrity
        script.crossOrigin = 'anonymous'
        script.onload = function () {
          window.mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            theme: window.matchMedia('(prefers-color-scheme: light)').matches ? 'neutral' : 'dark',
          })
          resolve(window.mermaid)
        }
        script.onerror = reject
        document.head.appendChild(script)
      })
    }
    return mermaidLoading
  }

  /**
   * Kit files and other non-page files are meant to be read as source, not
   * rendered. Rewrite relative Markdown links to them so they open on GitHub.
   * Links between pages (*.md outside kit/) are left alone for Docsify to turn
   * into routes.
   */
  function sourceLinks(hook, vm) {
    hook.beforeEach(function (markdown) {
      var page = new URL(vm.route.file, 'https://handbook.invalid/')
      return markdown.replace(/\]\(([^)\s]+)\)/g, function (match, href) {
        if (/^([a-z][a-z0-9+.-]*:|\/\/|#|\?)/i.test(href)) return match
        var target = new URL(href, page)
        var path = target.pathname.slice(1)
        var isPage = /\.md$/.test(path) && !/^kit\/(?!README\.md$)/.test(path)
        return isPage ? match : '](' + BLOB + path + target.hash + ')'
      })
    })
  }

  /** Render ```mermaid code fences as diagrams. If Mermaid cannot load, the source stays readable. */
  function diagrams(hook) {
    hook.doneEach(function () {
      var blocks = document.querySelectorAll('.markdown-section pre[data-lang="mermaid"]')
      if (!blocks.length) return
      loadMermaid().then(
        function (mermaid) {
          var nodes = Array.prototype.map.call(blocks, function (pre) {
            var figure = document.createElement('div')
            figure.className = 'mermaid'
            figure.tabIndex = 0
            figure.setAttribute('role', 'img')
            figure.setAttribute('aria-label', 'Diagram. The same information is in the text and tables around it.')
            figure.textContent = pre.textContent
            pre.replaceWith(figure)
            return figure
          })
          mermaid.run({ nodes: nodes })
        },
        function () {},
      )
    })
  }

  /**
   * Repairs to Docsify's own markup, found by running kit/e2e/quality.spec.ts
   * against this page.
   */
  function accessibility(hook) {
    hook.ready(function () {
      // One <h1> per page: the sidebar title is a label, not the page heading.
      var title = document.querySelector('h1.app-name')
      if (title) {
        var label = document.createElement('p')
        label.className = title.className
        while (title.firstChild) label.appendChild(title.firstChild)
        title.replaceWith(label)
      }
      // Docsify nests a focusable role="button" inside a <button>. Make the
      // outer button the one control; its click handler already lives there.
      var toggle = document.querySelector('button.sidebar-toggle')
      var inner = toggle && toggle.querySelector('.sidebar-toggle-button')
      if (toggle && inner) {
        toggle.tabIndex = 0
        toggle.setAttribute('aria-label', 'Toggle navigation')
        toggle.setAttribute('aria-controls', '__sidebar')
        ;['tabindex', 'role', 'aria-label', 'aria-keyshortcuts', 'aria-controls'].forEach(function (name) {
          inner.removeAttribute(name)
        })
        inner.setAttribute('aria-hidden', 'true')
      }
    })
    // A wide table scrolls sideways inside a wrapper that the keyboard can reach.
    hook.doneEach(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.markdown-section > table'), function (table) {
        var region = document.createElement('div')
        region.className = 'table-scroll'
        region.tabIndex = 0
        region.setAttribute('role', 'region')
        region.setAttribute('aria-label', 'Table')
        table.replaceWith(region)
        region.appendChild(table)
      })
    })
  }

  window.$docsify = {
    name: 'Engineering Handbook',
    repo: REPO,
    homepage: 'README.md',
    loadSidebar: true,
    // One sidebar for every folder. Its links start with "/" because
    // relativePath would otherwise resolve them against the open page.
    alias: { '/.*/_sidebar.md': '/_sidebar.md' },
    relativePath: true,
    auto2top: true,
    subMaxLevel: 2,
    search: {
      placeholder: 'Search the handbook',
      noData: 'No results',
      depth: 3,
    },
    plugins: [sourceLinks, diagrams, accessibility],
  }

  // If the viewer itself cannot load (CDN down, script blocked), say so and
  // point at the same pages on GitHub instead of showing "Loading" forever.
  window.addEventListener('load', function () {
    if (window.Docsify) return
    var status = document.getElementById('status')
    if (!status) return
    status.textContent = 'The viewer could not load. The handbook itself is plain Markdown: '
    var link = document.createElement('a')
    link.href = 'https://github.com/' + REPO + '#readme'
    link.textContent = 'read it on GitHub'
    status.appendChild(link)
    status.appendChild(document.createTextNode('.'))
  })
})()
