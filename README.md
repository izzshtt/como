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
- `/menukaart/` full menu as text with prices: `menukaart/index.html`. Its content is generated from `src/data/menu.ts` at build time, so it always matches the menu app.
- Shared colours and fonts: `src/shared/tokens.css`, used by both.
- `npm run dev`: website on http://localhost:5173/, menu on http://localhost:5173/menu/.
- Photos on the website are referenced by file name in `index.html` (e.g. `home-hero-640.webp`). After every build `scripts/check-build-refs.mjs` checks that every internal link and file in `dist/` exists; if a replaced photo loses a width, update its `srcset`.

## SEO and AI search
- Business facts (name, address, phone, hours, socials, KvK): `src/data/business.ts`. Keep them identical to the Google Business Profile.
- Opening hours also appear as text in `index.html` (hero, Bezoek ons, FAQ). When the hours change, update `business.ts` and those three places.
- `scripts/vite-plugin-site.ts` fills the `<!-- site:... -->` and `<!-- menu:... -->` markers at build time: shared header and footer, JSON-LD, canonical and Open Graph tags, the two FAQ sentences about the menu and the full `/menukaart/` page. A price change in `menu.ts` updates all of it.
- `SITE_URL` (e.g. `https://www.example.nl`, no trailing slash): set it in the hosting environment once the domain is live. Without it every page is marked `noindex` and no `sitemap.xml` is written. On Coolify it must be available at build time (the Dockerfile reads it with `ARG SITE_URL`).
- Share images in `public/img/share/` are generated from `photos-src/home-hero.*` before every build.
- `geo` in `business.ts` stays `null` until the exact coordinates are copied from Google Maps (right-click the COMO pin, click the coordinates).

## Structure (menu)
- `src/data/menu.ts`: all content (sections → categories → items). Shaped like future Sanity documents.
- `src/components/`: Header, Logo, HeroImage, OrganicCurve, PalmShadows, SectionCard, CategoryRow, MenuItemRow, Price, NavMenu.
- `src/pages/`: Splash, Home, SectionPage (Eten/Drankjes), CategoryPage.
- Categories can have `groups` (titled blocks of items on the same page), used for Loaded Crêpes and Crêpe Rolls.
- `src/styles.css`: all menu component styles (colours and fonts come from `src/shared/tokens.css`).
- Routes: `/menu/#/`, `/menu/#/eten`, `/menu/#/drankjes`, `/menu/#/eten/<category>`, `/menu/#/drankjes/<category>`.
- `public/404.html` + `public/404.css`: page Vercel shows for addresses without a hash that do not exist. Keep its colors in sync with `src/styles.css`.
- From 900px wide the menu fills the screen: see the "Desktop" block at the end of `src/styles.css` (CSS only). Below 900px the phone layout is unchanged.

## Deploy (Hetzner + Coolify)
- Build pack: Dockerfile. Base Directory `/`, Dockerfile Location `/Dockerfile`, Ports Exposes `80`.
- Domain: enter it with `https://` so the Coolify proxy requests and renews the certificate.
- Security headers, caching and the 404 page live in `deploy/`. While Vercel is still used, keep `deploy/security-headers.conf` and `vercel.json` in sync.
- Every page folder (like `/menukaart/`) needs its own three blocks in `deploy/nginx.conf`: a redirect for the path without a slash, the page shell with `no-cache`, and its `index.html`. Copy the `/menukaart` blocks. Without them Nginx answers 404. Add the matching redirect to `vercel.json`.

## Photos
Originals live in `photos-src/`. `npm run images` (also runs automatically before `npm run build`)
turns them into responsive WebP files in `public/img/photos/` (320, 640, 960, 1600 px, metadata stripped)
and writes `src/data/photo-manifest.json`. The browser downloads only the size it needs.
To replace a photo: put the original (at least 1600 px wide) in `photos-src/` with the same name and run `npm run images`.
A category page uses `hero` if set in `menu.ts`, otherwise the category thumbnail.
For a dedicated hero, add `<name>-hero.png` (or .jpg) to `photos-src/`, run `npm run images`, and set `hero: photo("<name>-hero")` on that category.
Loading: every photo has a tiny blurred preview inlined in the app, so no slot is ever empty. The splash stays until Home's photos are loaded (2.2 s minimum, 4 s maximum), then all thumbnails, the white header logo and all category heroes (max 960 px) load in the background. Data saver on the phone skips the background loading.
