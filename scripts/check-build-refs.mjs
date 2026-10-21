// Fails the build when a built page points at a file or page that does not exist, for example a
// photo width that disappeared after an original was replaced, or a broken internal link.
// Runs after `vite build` (see "postbuild" in package.json) and checks every HTML file in dist/.

import { statSync } from "node:fs"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"

const DIST = "dist"
const pages = (await readdir(DIST, { recursive: true })).filter((f) => f.endsWith(".html"))
const missing = []

for (const page of pages) {
  const html = await readFile(path.join(DIST, page), "utf8")
  const refs = [...html.matchAll(/\s(?:src|href|srcset)="([^"]+)"/g)].flatMap(([, value]) =>
    value.split(",").map((part) => part.trim().split(/\s+/)[0]),
  )
  for (const ref of refs) {
    if (!ref.startsWith("/") || ref.startsWith("//")) continue
    const clean = ref.split(/[?#]/)[0]
    const target = clean.endsWith("/") ? `${clean}index.html` : clean
    // Only real files count: a folder link without its trailing slash (/menukaart) costs a redirect,
    // and on Nginx a folder without its own redirect block answers 404.
    if (!statSync(path.join(DIST, target), { throwIfNoEntry: false })?.isFile()) missing.push(`${page}: ${ref}`)
  }
}

if (missing.length) {
  console.error("Broken references in the build:\n" + missing.map((m) => `  - ${m}`).join("\n"))
  process.exit(1)
}

console.log(`Checked links and files in ${pages.length} pages: all present.`)
