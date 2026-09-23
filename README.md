# Arslan Shafique — Portfolio

A single-page portfolio site. Plain HTML, CSS and JavaScript — **no build step, no dependencies
to install**. Open `index.html` in a browser and it works.

## Structure

```
index.html                 the whole page
assets/
  css/styles.css           design tokens + components (dark & light themes)
  js/main.js               theme toggle, nav, scroll reveal, filters, lightbox, contact form
  badges/*.png             verified credential artwork shown in the Credly badge strip
  img/arslan.jpg           profile photo
  projects/*.jpg           freelance project screenshots
  docs/*.pdf               experience letters linked from the site
```

## Editing content

Everything is in `index.html`, in the order it appears on the page. Each section is marked with
an HTML comment (`<!-- ============ PROJECTS ============ -->`).

**To add a project** — copy an existing `<article class="pcardx">` block and change the text.
The `data-cat` attribute drives the filter buttons; use one or more of `ai`, `iot`, `web`.

**To add a freelance screenshot** — drop the image in `assets/projects/`, then copy a
`<figure class="gal__item">` block. The `data-src` attribute is the image the lightbox opens.

**To add a testimonial** — copy a `<figure class="quote">` block. Add `quote--lead` to the class
to make one span two columns.

**To change the colours** — every colour is a CSS custom property at the top of
`assets/css/styles.css`, under `:root` (dark) and `[data-theme="light"]` (light).

## Previewing locally

Double-clicking `index.html` works for everything except the profile photo caching. For a proper
local server, any static server will do, e.g. with Python installed:

```bash
python -m http.server 8000
```

## Deploying

Hosted on **Vercel**, deployed from this GitHub repository. The site is static, so there is no
build command — Vercel serves the repo root as-is.

**First-time setup**

1. Push this repo to GitHub.
2. At [vercel.com/new](https://vercel.com/new), import the repository.
3. Framework preset: **Other**. Build command: *empty*. Output directory: *empty* (repo root).
4. Name the Vercel project `arslan-shafique` so the URL is `arslan-shafique.vercel.app`.

**Every update after that**

```bash
git add -A && git commit -m "Describe the change" && git push
```

Vercel redeploys automatically on push to `main`, usually within a minute.

**Custom domain** — *Project → Settings → Domains* in Vercel. Add the domain, then point its
DNS at Vercel as instructed. HTTPS is issued automatically.

## Notes

- The contact form has no backend. It composes a message in the visitor's own mail client via
  `mailto:` — nothing is stored or sent by the site itself. Swap in Formspree or Netlify Forms if
  you want submissions delivered server-side.
- Theme preference is stored in `localStorage` and falls back to the visitor's OS setting.
- Fonts load from Google Fonts. Self-host them if you need the page to work fully offline.
