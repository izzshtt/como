import { useEffect, useRef, useState } from "react"
import type { Photo } from "../data/menu"
import { photoStyle, SIZES } from "../photoSizes"
import { OrganicCurve } from "./OrganicCurve"

/** How long each photo stays fully visible, and how long the crossfade takes. */
export const SLIDE_HOLD_MS = 3500
export const SLIDE_FADE_MS = 1200

type Props = { photos: Photo[]; alt: string }

/** Category hero that crossfades through several photos. Same frame, scrim and curve as HeroImage. */
export function HeroSlideshow({ photos, alt }: Props) {
  const [active, setActive] = useState(0)
  const imgs = useRef<(HTMLImageElement | null)[]>([])

  useEffect(() => {
    if (photos.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let timer = 0
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(advance, SLIDE_HOLD_MS + SLIDE_FADE_MS)
    }
    const advance = () => {
      if (!document.hidden) {
        setActive((i) => {
          const next = (i + 1) % photos.length
          const img = imgs.current[next]
          // Only fade to a photo that is ready, so the hero never fades into an empty frame.
          return img && img.complete && img.naturalWidth > 0 ? next : i
        })
      }
      schedule()
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [photos.length])

  return (
    <div className="hero hero--category">
      {photos.map((p, i) => (
        <img
          key={p.heroSrc}
          ref={(el) => {
            imgs.current[i] = el
          }}
          className={`hero__img hero__slide${i === active ? " is-active" : ""}`}
          src={p.heroSrc}
          srcSet={p.heroSrcSet}
          sizes={SIZES.hero}
          alt={i === active ? alt : ""}
          aria-hidden={i !== active}
          style={{ ...photoStyle(p), transitionDuration: `${SLIDE_FADE_MS}ms` }}
          fetchPriority={i === 0 ? "high" : "low"}
          decoding="async"
        />
      ))}
      <div className="hero__scrim" aria-hidden="true" />
      <OrganicCurve variant="category" />
    </div>
  )
}
