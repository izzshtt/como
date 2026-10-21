import { useEffect, useState } from "react"
import { Header } from "./components/Header"
import { findCategory, findSection, homeHero, sections } from "./data/menu"
import { CategoryPage } from "./pages/CategoryPage"
import { Home } from "./pages/Home"
import { SectionPage } from "./pages/SectionPage"
import { Splash } from "./pages/Splash"
import { loadFile, loadNow, preload, saveData } from "./photoSizes"
import { parseRoute, usePath } from "./router"

const SPLASH_MS = 2200
const SPLASH_FADE_MS = 700
const SPLASH_MAX_MS = 4000

/** Everything Home shows right after the splash. */
const loadHome = () =>
  Promise.all([loadNow([homeHero], "hero"), loadNow(sections.map((s) => s.card), "card")])

function useSplash() {
  const [stage, setStage] = useState<"show" | "leaving" | "done">("show")
  useEffect(() => {
    // `?splash` keeps the splash on screen, handy when reviewing it.
    if (new URLSearchParams(window.location.search).has("splash")) return
    let cancelled = false
    let doneTimer = 0
    const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms))
    // Leave after the minimum time AND once Home's photos are in, but never later than the maximum.
    Promise.race([Promise.all([wait(SPLASH_MS), loadHome()]), wait(SPLASH_MAX_MS)]).then(() => {
      if (cancelled) return
      setStage("leaving")
      doneTimer = window.setTimeout(() => setStage("done"), SPLASH_FADE_MS)
    })
    return () => {
      cancelled = true
      window.clearTimeout(doneTimer)
    }
  }, [])
  return stage
}

export function App() {
  const path = usePath()
  const splash = useSplash()

  // Load order: Home photos, then every category thumbnail, then the white header
  // logo and every category hero. By the time a guest taps a category, its photo is
  // already on the phone.
  useEffect(() => {
    if (saveData()) return
    const thumbs = sections.flatMap((s) => s.categories.map((c) => c.thumb))
    const heroes = sections.flatMap((s) => s.categories.flatMap((c) => c.slides ?? [c.hero ?? c.thumb]))
    loadHome()
      .then(() => loadNow(thumbs, "row"))
      .then(() => {
        void loadFile("/img/logo/como-white.png")
        preload(heroes, "hero", true)
      })
  }, [])

  const route = parseRoute(path)
  const section = route.name !== "home" ? findSection(route.section) : undefined
  const category = route.name === "category" ? findCategory(route.section, route.category) : undefined

  let page = <Home />
  let headerTone: "light" | "photo" = "light"
  if (section && category) {
    page = <CategoryPage section={section} category={category} />
    headerTone = "photo"
  } else if (section && route.name === "section") {
    page = <SectionPage section={section} />
  }
  const isHome = page.type === Home

  useEffect(() => {
    document.title = category
      ? `${category.title} | COMO.`
      : section
        ? `${section.title} | COMO.`
        : "COMO. bakery & brunch | Menu"
  }, [section, category])

  return (
    <div className="site">
      <div className={isHome ? "frame frame--home" : "frame"}>
        <Header tone={headerTone} showBack={route.name === "category"} section={route.name === "section" ? section?.slug : undefined} />
        <div key={path} className="page-transition">
          {page}
        </div>
      </div>
      {splash !== "done" && <Splash leaving={splash === "leaving"} />}
    </div>
  )
}
