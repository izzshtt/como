// Share and search images from the home hero photo:
//   como-og.jpg    1200 x 630, link previews (WhatsApp, Facebook, LinkedIn)
//   como-1x1.jpg, como-4x3.jpg, como-16x9.jpg   for the structured data (Google asks for these ratios)
// Runs in "prebuild". Change the source photo in photos-src/ and the next build updates them.

import { mkdir, readdir } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const SRC = "photos-src"
const OUT = "public/img/share"
const SOURCE_NAME = "home-hero"

const file = (await readdir(SRC)).find((f) => path.parse(f).name === SOURCE_NAME)
if (!file) throw new Error(`No ${SOURCE_NAME}.* in ${SRC}/`)

await mkdir(OUT, { recursive: true })

const sizes = [
  ["como-og.jpg", 1200, 630],
  ["como-1x1.jpg", 1200, 1200],
  ["como-4x3.jpg", 1200, 900],
  ["como-16x9.jpg", 1200, 675],
]

for (const [name, width, height] of sizes) {
  await sharp(path.join(SRC, file))
    .rotate()
    .resize({ width, height, fit: "cover", position: sharp.strategy.attention })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, name))
}

console.log(`Share images written to ${OUT}/ from ${file}`)
