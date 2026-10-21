import { HeroImage } from "../components/HeroImage"
import { SectionCard } from "../components/SectionCard"
import { homeHero, sections } from "../data/menu"

export function Home() {
  return (
    <main className="page page--home">
      <HeroImage photo={homeHero} alt="Iced matcha, aardbeien-mocktail, een punt taart en pancakes met vers fruit" variant="home" />
      <section className="home__choose">
        <h1 className="home__title">Wat wil je bekijken?</h1>
        <div className="home__cards">
          {sections.map((s) => (
            <SectionCard key={s.slug} section={s} />
          ))}
        </div>
      </section>
    </main>
  )
}
