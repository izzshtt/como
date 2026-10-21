// Fails the build when a page points at a file that does not exist in public/,
// for example a photo width that disappeared after an original was replaced.
// Runs after `npm run images` (see "prebuild" in package.json).

import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"

const PAGES = ["index.html", "menu/index.html", "public/404.html"]
const missing = []

for (const page of PAGES) {
  const html = await readFile(page, "utf8")
  const refs = [...html.matchAll(/\s(?:src|href|srcset)="([^"]+)"/g)].flatMap(([, value]) =>
    value.split(",").map((part) => part.trim().split(/\s+/)[0]),
  )
  for (const ref of refs) {
    if (!/^\/(img\/|favicon|apple-touch|icon-|404\.)/.test(ref)) continue
    if (!existsSync(`public${ref}`)) missing.push(`${page}: ${ref}`)
  }
}

if (missing.length) {
  console.error("Missing files in public/:\n" + missing.map((m) => `  - ${m}`).join("\n"))
  process.exit(1)
}

console.log(`Checked file references in ${PAGES.length} pages: all present.`)
