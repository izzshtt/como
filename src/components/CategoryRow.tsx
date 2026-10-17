import type { Category } from "../data/menu"
import { photoStyle, preload, SIZES } from "../photoSizes"
import { ArrowRight } from "./Icons"
import { Link } from "./Link"

type Props = { sectionSlug: string; category: Category; /** Rows visible on open load right away. */ eager?: boolean }

/** Row in the Eten / Drankjes overview: photo · name · arrow. */
export function CategoryRow({ sectionSlug, category, eager = false }: Props) {
  // Start fetching the hero the moment the guest touches (or hovers) this row.
  // The page transition takes 420ms, so the photo is usually ready on arrival.
  const warmHero = () => preload(category.slides ?? [category.hero ?? category.thumb], "hero", true)

  return (
    <Link
      to={`/${sectionSlug}/${category.slug}`}
      className="category-row"
      onPointerDown={warmHero}
      onPointerEnter={warmHero}
      onFocus={warmHero}
    >
      <span className="category-row__media">
        <img
          src={category.thumb.src}
          srcSet={category.thumb.srcSet}
          sizes={SIZES.row}
          alt=""
          style={photoStyle(category.thumb)}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      </span>
      <span className="category-row__title">{category.title}</span>
      <ArrowRight className="category-row__arrow" />
    </Link>
  )
}
