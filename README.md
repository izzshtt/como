# COMO. bakery & brunch: website en digitale menukaart

View-only QR menu (no ordering). Vite + React + TypeScript, static output.

```
npm install
npm run dev      # http://localhost:5173  (add ?splash to keep the splash on screen)
npm run build    # static site in dist/
```

## Pages
- `/` website: `index.html` + `src/site/home.css`. Plain HTML and CSS, no JavaScript, so it loads fast and search engines read it directly.
- `/menu/` menu app: `menu/index.html` + `src/main.tsx` (React, hash routes like `/menu/#/eten`). `/menu` without a slash redirects to `/menu/` (vercel.json, deploy/nginx.conf).
- Shared colours and fonts: `src/shared/tokens.css`, used by both.
- `npm run dev`: website on http://localhost:5173/, menu on http://localhost:5173/menu/.
- Photos on the website are referenced by file name in `index.html` (e.g. `home-hero-640.webp`). The build checks that every referenced file exists (`scripts/check-public-refs.mjs`); if a replaced photo loses a width, update its `srcset`.
- Once the domain is known: add `url`, `image` and `hasMenu` to the JSON-LD in `index.html`, plus `<link rel="canonical">` and an `og:image`.

## Structure (menu)
- `src/data/menu.ts`: all content (sections → categories → items). Shaped like future Sanity documents.
- `src/components/`: Header, Logo, HeroImage, OrganicCurve, PalmShadows, SectionCard, CategoryRow, MenuItemRow, Price, NavMenu.
- `src/pages/`: Splash, Home, SectionPage (Eten/Drankjes), CategoryPage.
- Categories can have `groups` (titled blocks of items on the same page), used for Loaded Crêpes and Crêpe Rolls.
- `src/styles.css`: all menu component styles (colours and fonts come from `src/shared/tokens.css`).
- Routes: `/menu/#/`, `/menu/#/eten`, `/menu/#/drankjes`, `/menu/#/eten/<category>`, `/menu/#/drankjes/<category>`.
- `public/404.html` + `public/404.css`: page Vercel shows for addresses without a hash that do not exist. Keep its colors in sync with `src/styles.css`.

## Deploy (Hetzner + Coolify)
- Build pack: Dockerfile. Base Directory `/`, Dockerfile Location `/Dockerfile`, Ports Exposes `80`.
- Domain: enter it with `https://` so the Coolify proxy requests and renews the certificate.
- Security headers, caching and the 404 page live in `deploy/`. While Vercel is still used, keep `deploy/security-headers.conf` and `vercel.json` in sync.

## Photos
Originals live in `photos-src/`. `npm run images` (also runs automatically before `npm run build`)
turns them into responsive WebP files in `public/img/photos/` (320, 640, 960, 1600 px, metadata stripped)
and writes `src/data/photo-manifest.json`. The browser downloads only the size it needs.
To replace a photo: put the original (at least 1600 px wide) in `photos-src/` with the same name and run `npm run images`.
A category page uses `hero` if set in `menu.ts`, otherwise the category thumbnail.
For a dedicated hero, add `<name>-hero.png` (or .jpg) to `photos-src/`, run `npm run images`, and set `hero: photo("<name>-hero")` on that category.
Loading: every photo has a tiny blurred preview inlined in the app, so no slot is ever empty. The splash stays until Home's photos are loaded (2.2 s minimum, 4 s maximum), then all thumbnails, the white header logo and all category heroes (max 960 px) load in the background. Data saver on the phone skips the background loading.
