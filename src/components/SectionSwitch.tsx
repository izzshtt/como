import { sections, type Section } from "../data/menu"
import { Link } from "./Link"

type Props = {
  current: Section["slug"]
  /** "light" = on the cream background, "photo" = on top of a photo. */
  tone: "light" | "photo"
}

/** Two-option pill in the header: jump between Eten and Drankjes in one tap. */
export function SectionSwitch({ current, tone }: Props) {
  return (
    <nav className={`switch switch--${tone}`} aria-label="Kies eten of drankjes">
      {sections.map((s) => {
        const active = s.slug === current
        return (
          <Link
            key={s.slug}
            to={`/${s.slug}`}
            replace
            className={`switch__option${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {s.title}
          </Link>
        )
      })}
    </nav>
  )
}
