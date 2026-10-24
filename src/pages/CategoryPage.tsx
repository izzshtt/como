import { HeroImage } from "../components/HeroImage"
import { HeroSlideshow } from "../components/HeroSlideshow"
import { ArrowLeft } from "../components/Icons"
import { Link } from "../components/Link"
import { MenuItemRow } from "../components/MenuItemRow"
import type { Category, Section } from "../data/menu"

export function CategoryPage({ section, category }: { section: Section; category: Category }) {
  return (
    <main className="page page--category">
      {category.slides && category.slides.length > 1 ? (
        <HeroSlideshow photos={category.slides} alt={category.title} />
      ) : (
        <HeroImage photo={category.hero ?? category.thumb} alt={category.title} variant="category" />
      )}
      <div className="category__body">
        <header className="page-intro page-intro--category">
          <h1 className="page-intro__title">{category.title}</h1>
          <p className="page-intro__text">{category.intro}</p>
        </header>
        <ul className="menu-list">
          {category.items.map((item) => (
            <MenuItemRow key={item.name} item={item} />
          ))}
        </ul>
        {category.groups?.map((group) => (
          <section key={group.title} className="menu-group">
            <h2 className="menu-group__title">{group.title}</h2>
            {group.intro && <p className="menu-group__intro">{group.intro}</p>}
            <ul className="menu-list">
              {group.items.map((item) => (
                <MenuItemRow key={item.name} item={item} />
              ))}
            </ul>
          </section>
        ))}
        {category.notes && (
          <div className="menu-notes">
            {category.notes.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </div>
        )}
        <footer className="menu-footer">
          <p>Onze producten kunnen allergenen bevatten. Heeft u een allergie? Laat het ons weten.</p>
          <p className="menu-footer__social">
            Volg ons:{" "}
            <a href="https://www.instagram.com/como.arnhem/" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>{" "}
            &amp;{" "}
            <a href="https://www.tiktok.com/@como.arnhem" target="_blank" rel="noopener noreferrer">
              TikTok
            </a>{" "}
            @como.arnhem
          </p>
          <p>
            Openingstijden en adres: <a href="/">bekijk onze website</a>
          </p>
        </footer>
        <Link to={`/${section.slug}`} className="back-link">
          <ArrowLeft />
          <span>Terug naar {section.title}</span>
        </Link>
        <p className="site-credit">
          Designed by{" "}
          <a href="https://altevo.nl" target="_blank" rel="noopener">
            Altevo
          </a>
        </p>
      </div>
    </main>
  )
}
