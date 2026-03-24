# Divye Joshi — Personal Portfolio

Clean, optimized rebuild of the personal website.

---

## Setup

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview the build locally
```

---

## GitHub Pages Deployment

### Option A — Username/org site (`username.github.io`)
1. Keep `vite.config.js` base as `'/'`
2. Push the repo to a repo named `username.github.io`
3. In repo Settings → Pages → Source: **GitHub Actions** (or `gh-pages` branch)

### Option B — Project site (`username.github.io/my-repo`)
1. In `vite.config.js`, change `base: '/'` → `base: '/my-repo/'`
2. Build and push the `dist/` folder to the `gh-pages` branch

**Quick deploy with gh-pages package:**
```bash
npm install --save-dev gh-pages
# add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"
npm run deploy
```

---

## File Overview

```
src/
  main.jsx               — React entry point
  App.jsx                — Layout, navigation, section state
  index.css              — Global styles (mobile-first)
  components/
    CanvasAnimation.jsx  — Canvas particle system + SECTIONS data
pfp.png                  — Your profile photo (place in project root)
```

## Customisation

- **Content / links** — Edit `SECTIONS` array in `src/components/CanvasAnimation.jsx`
- **Profile image** — Replace `pfp.png` in the project root
- **CV link** — Update the `url` in section id 1 (`links`)
- **Performance tuning** — Adjust `ETERNAL_COUNT()` and `TEXT_COUNT()` in `CanvasAnimation.jsx`
