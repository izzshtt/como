# COMO. bakery & brunch: digitale menukaart

View-only QR menu (no ordering). Vite + React + TypeScript, static output.

```
npm install
npm run dev      # http://localhost:5173  (add ?splash to keep the splash on screen)
npm run build    # static site in dist/
```

## Structure
- `src/data/menu.ts`: all content (sections → categories → items). Shaped like future Sanity documents.
- `src/components/`: Header, Logo, HeroImage, OrganicCurve, PalmShadows, SectionCard, CategoryRow, MenuItemRow, Price, NavMenu.
- `src/pages/`: Splash, Home, SectionPage (Eten/Drankjes), CategoryPage.
- Categories can have `groups` (titled blocks of items on the same page), used for Loaded Crêpes and Crêpe Rolls.
- `src/styles.css`: design tokens (exact COMO palette, Playfair Display + DM Sans) and all component styles.
- Routes: `#/`, `#/eten`, `#/drankjes`, `#/eten/<category>`, `#/drankjes/<category>`.
- `public/404.html` + `public/404.css`: page Vercel shows for addresses without a hash that do not exist. Keep its colors in sync with `src/styles.css`.

## Photos
Originals live in `photos-src/`. `npm run images` (also runs automatically before `npm run build`)
turns them into responsive WebP files in `public/img/photos/` (320, 640, 960, 1600 px, metadata stripped)
and writes `src/data/photo-manifest.json`. The browser downloads only the size it needs.
To replace a photo: put the original (at least 1600 px wide) in `photos-src/` with the same name and run `npm run images`.
A category page uses `hero` if set in `menu.ts`, otherwise the category thumbnail.
For a dedicated hero, add `<name>-hero.png` (or .jpg) to `photos-src/`, run `npm run images`, and set `hero: photo("<name>-hero")` on that category.
Loading: every photo has a tiny blurred preview inlined in the app, so no slot is ever empty. The splash stays until Home's photos are loaded (2.2 s minimum, 4 s maximum), then all thumbnails, the white header logo and all category heroes (max 960 px) load in the background. Data saver on the phone skips the background loading.
