// Thin-line icons, drawn to match the concept's light 1.25px strokes.

type IconProps = { className?: string }

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
}

export const ArrowRight = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" width="20" height="20" className={className} {...base}>
    <path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5" />
  </svg>
)

export const ArrowLeft = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" width="22" height="22" className={className} {...base} strokeWidth={1.4}>
    <path d="M19.5 12h-15M10 6.5 4.5 12l5.5 5.5" />
  </svg>
)
