import type { CSSProperties } from "react"
import type { Photo } from "./data/menu"

// `sizes` per slot: tells the browser how wide the photo is shown, so it
// downloads the smallest file that is still sharp on that screen.
// Below 900px the menu is a column of at most --max-width (480px); from 900px it
// fills the screen (see "Desktop" in styles.css).
export const SIZES = {
  hero: "(min-width: 900px) 50vw, (max-width: 480px) 100vw, 480px",
  card: "(min-width: 900px) 280px, (max-width: 480px) 45vw, 220px",
  row: "(min-width: 900px) 420px, (max-width: 480px) 41vw, 200px",
} as const

export type Slot = keyof typeof SIZES

const srcFor = (p: Photo, slot: Slot) => (slot === "hero" ? p.heroSrc : p.src)
const srcSetFor = (p: Photo, slot: Slot) => (slot === "hero" ? p.heroSrcSet : p.srcSet)

/** Inline style for a photo: crop position plus the blurred preview behind it. */
export const photoStyle = (p: Photo): CSSProperties => ({
  objectPosition: p.position,
  backgroundImage: `url("${p.blur}")`,
  backgroundSize: "cover",
  backgroundPosition: p.position,
})

/** True when the guest's phone asks to save mobile data. */
export const saveData = () =>
  Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)

const loads = new Map<string, Promise<void>>()

/** Downloads a single file now and resolves when it is ready (or failed). Each URL is fetched once. */
export function loadFile(url: string): Promise<void> {
  let job = loads.get(url)
  if (!job) {
    job = new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = url
    })
    loads.set(url, job)
  }
  return job
}

/** Downloads now and resolves when every photo is ready (or failed). Each file is fetched once. */
export function loadNow(photos: Photo[], slot: Slot): Promise<void> {
  return Promise.all(
    photos.map((p) => {
      const srcset = srcSetFor(p, slot)
      const key = `${srcset}|${slot}`
      let job = loads.get(key)
      if (!job) {
        job = new Promise<void>((resolve) => {
          const img = new Image()
          img.decoding = "async"
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.sizes = SIZES[slot]
          img.srcset = srcset
          img.src = srcFor(p, slot)
        })
        loads.set(key, job)
      }
      return job
    }),
  ).then(() => undefined)
}

/** Background download for photos the guest will probably need next. Skipped on data saver. */
export function preload(photos: Photo[], slot: Slot, immediate = false) {
  if (saveData()) return
  const run = () => void loadNow(photos, slot)
  if (immediate) run()
  else if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 1500 })
  else setTimeout(run, 200)
}
