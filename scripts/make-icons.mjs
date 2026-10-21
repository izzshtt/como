// Builds the site icons from the black COMO logo: the "como." wordmark centered
// on the cream background. Run once, or again when the logo changes:
//   node scripts/make-icons.mjs
import sharp from "sharp"

const BG = "#f9f7f3"
const logo = sharp("public/img/logo/como-black.png")
const { width, height } = await logo.metadata()
// Keep the "como." wordmark only (top part of the logo), drop "bakery & brunch".
// Two steps: within one pipeline sharp trims before it extracts.
const top = await logo.extract({ left: 0, top: 0, width, height: Math.round(height * 0.66) }).toBuffer()
const mark = await sharp(top).trim().toBuffer()

async function icon(size, file, padding) {
  const inner = Math.round(size * (1 - padding * 2))
  const fitted = await sharp(mark).resize({ width: inner, height: inner, fit: "inside" }).toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: fitted, gravity: "center" }])
    .png()
    .toFile(file)
}

await icon(32, "public/favicon-32.png", 0.06)
await icon(180, "public/apple-touch-icon.png", 0.14)
await icon(512, "public/icon-512.png", 0.14)
console.log("Icons written to public/")
