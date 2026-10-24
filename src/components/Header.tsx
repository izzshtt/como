import type { Section } from "../data/menu"
import { ArrowLeft } from "./Icons"
import { Link } from "./Link"
import { Logo } from "./Logo"
import { SectionSwitch } from "./SectionSwitch"
import { goBack } from "../router"

type Props = {
  /** "light" = black logo on cream, "photo" = white logo over photography. */
  tone?: "light" | "photo"
  showBack?: boolean
  section?: Section["slug"]
}

export function Header({ tone = "light", showBack = false, section }: Props) {
  return (
    <header className={`header header--${tone}`}>
      <div className="header__start">
        {showBack && (
          <button type="button" className="icon-button header__back" onClick={goBack} aria-label="Terug">
            <ArrowLeft />
          </button>
        )}
        <Link to="/" className="header__logo" aria-label="COMO., naar home">
          <Logo tone={tone === "photo" ? "white" : "black"} />
        </Link>
      </div>
      <div className="header__end">
        {/* Desktop only (CSS): visitors on a laptop almost always came from the website. */}
        <a className="header__site" href="/">
          Naar de website
        </a>
        {section && <SectionSwitch current={section} tone={tone} />}
      </div>
    </header>
  )
}
