# djani-terminal

Personal site for **Djani Efendi**, styled as a retro amber phosphor CRT terminal.
React + Vite (JavaScript, no TypeScript), deployed at <https://djaniefendi.com> on
Cloudflare Pages.

## Develop

```
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the production build
```

## Where things live

| Path                | What it is                                                        |
| ------------------- | ----------------------------------------------------------------- |
| `src/commands.js`   | **All site content** — the command registry and the boot sequence |
| `src/App.jsx`       | Terminal shell: boot animation, input, history, autocomplete       |
| `src/styles.css`    | Amber phosphor theme, scanlines, glow                              |
| `index.html`        | Static SEO, terminal prerender target, and noscript bio            |
| `src/entry-server.jsx`, `scripts/prerender.mjs` | Build-time terminal HTML using the same React app |
| `public/`           | `robots.txt`, `sitemap.xml`, `og.png`, `favicon.svg`              |

### Editing content

Everything shown by a command lives in `src/commands.js`. To add a command, add an
entry to the `commands` object with a `description` and a `run()` returning an array
of lines — `help` is generated from the registry, so it picks the new command up
automatically. A line is an array of segments; a segment is `{ t, tone, href }` with
`tone` one of `amber`, `bright`, `dim`, `ok`, `link`.

Set `hidden: true` on a command to keep it out of `help` and the chip row.

## SEO notes

The `<head>` of `index.html` is deliberately static — none of it is rendered by
React, so crawlers see it in the raw HTML response:

- canonical `https://djaniefendi.com/`, Open Graph and Twitter card tags
- **Person** JSON-LD with `"@id": "https://djaniefendi.com/#person"` — this exact
  `@id` is the shared entity anchor across djaniefendi.com, djaniefendi.news and
  djaniefendi.org. Do not change it.
- **WebSite** JSON-LD ("Djani Terminal") pointing `about` at that `@id`

The production build also includes:

- a visible project link to The Meskhetian Turks documentary inside the terminal's
  opening screen, prerendered into the production HTML without requiring a command
  or JavaScript. React hydrates that screen and animates the reserved boot rows;
  `clear` removes the opening output and `projects` prints the full description.
- a `<noscript>` two-paragraph bio

Prerendering runs only during `npm run build`. Cloudflare still serves static
files from `dist`; `dist-ssr` is a temporary build output, not a production server.

`src/commands.js` still has a TODO for the X (Twitter) profile URL — add it to
`contact` and to the `sameAs` array in `index.html` when confirmed.

## The OG image

`public/og.png` (1200×630) is generated from `og.source.svg`. To regenerate after
editing the SVG, on macOS:

```
sips -s format png og.source.svg --out public/og.png
```

The SVG uses `font-family="Menlo"` rather than JetBrains Mono because the renderer
uses installed system fonts, not the web font.

## Deployment

Cloudflare Pages, auto-deploying from `main`:

- build command: `npm run build`
- output directory: `dist`
