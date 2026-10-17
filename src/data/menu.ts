import manifest from "./photo-manifest.json"

// Menu content. Shaped like the documents a CMS (e.g. Sanity) will deliver later:
// section → categories → items. The visual components only read these fields.

export type Photo = {
  /** Fallback file (a mid-size variant). */
  src: string
  /** All generated widths, so the browser picks the smallest that is sharp enough. */
  srcSet: string
  /** Hero variants, capped at 960px: the layout is at most 480px wide. */
  heroSrc: string
  heroSrcSet: string
  /** Tiny blurred preview as a data URL, painted behind the photo while it loads. */
  blur: string
  /** CSS object-position: keeps the subject in frame when the image is cropped. */
  position?: string
}

export type MenuItem = {
  name: string
  description?: string
  /** Price in euros. Omitted when not yet known. */
  price?: number
  /** Small label under the name, e.g. "Favoriet". */
  label?: string
}

/** A titled block of items inside a category page, e.g. "Loaded Crêpes". */
export type MenuGroup = {
  title: string
  intro?: string
  items: MenuItem[]
}

export type Category = {
  slug: string
  title: string
  intro: string
  /** Photo used in the category list. */
  thumb: Photo
  /** Large photo at the top of the category page. Falls back to `thumb`. */
  hero?: Photo
  items: MenuItem[]
  /** Extra titled groups shown after the main items. */
  groups?: MenuGroup[]
  /** Extra info shown below the items, e.g. supplements. */
  notes?: string[]
}

export type Section = {
  slug: "eten" | "drankjes"
  title: string
  intro: string
  card: Photo
  categories: Category[]
}

// Variants are generated from photos-src/ by `npm run images`.
type ManifestEntry = { widths: number[]; blur: string }

const photo = (file: string, position = "50% 50%"): Photo => {
  const name = file.replace(/\.[a-z]+$/i, "")
  const entry = (manifest as Record<string, ManifestEntry>)[name]
  if (!entry) throw new Error(`Photo "${name}" missing: add it to photos-src/ and run npm run images`)
  const { widths, blur } = entry
  const url = (w: number) => `/img/photos/${name}-${w}.webp`
  const set = (ws: number[]) => ws.map((w) => `${url(w)} ${w}w`).join(", ")
  const mid = widths.find((w) => w >= 640) ?? widths[widths.length - 1]
  const heroWidths = widths.filter((w) => w <= 960)
  if (!heroWidths.length) heroWidths.push(widths[0])
  return {
    src: url(mid),
    srcSet: set(widths),
    heroSrc: url(heroWidths[heroWidths.length - 1]),
    heroSrcSet: set(heroWidths),
    blur,
    position,
  }
}

export const homeHero = photo("pancakes-hero", "50% 55%")

export const sections: Section[] = [
  {
    slug: "eten",
    title: "Eten",
    intro: "Ontdek onze verse gerechten, bereid met de beste ingrediënten.",
    card: photo("eten-card", "50% 55%"),
    categories: [
      {
        slug: "bowls",
        title: "Bowls",
        intro: "Fris, kleurrijk en vol goede ingrediënten.",
        thumb: photo("bowls", "50% 60%"),
        hero: photo("bowls", "50% 65%"),
        items: [
          {
            name: "Açaí Dream Bowl",
            description: "Açaí, vers fruit, crunchy granola & pindakaas",
            price: 11.5,
          },
          {
            name: "Granola Bowl",
            description: "Magere kwark, huisgemaakte granola, vers fruit & honing",
            price: 9.5,
          },
        ],
      },
      {
        slug: "panini",
        title: "Panini",
        intro: "Knapperig gegrild en royaal belegd.",
        thumb: photo("panini.webp", "50% 40%"),
        hero: photo("panini.webp", "50% 50%"),
        items: [
          { name: "Panini met Pittige Kip", price: 8 },
          { name: "Panini Pesto, Mozzarella & Tomaat", price: 7.5 },
          { name: "Panini Kaas", price: 7 },
        ],
      },
      {
        slug: "op-toast",
        title: "Op Toast",
        intro: "Geserveerd op een zuurdesembrood.",
        thumb: photo("op-toast", "50% 55%"),
        hero: photo("op-toast", "50% 75%"),
        items: [
          {
            name: "Toast met Gerookte Zalm",
            description: "Gerookte zalm, avocado, roomkaas, rucola & honingmosterdsaus",
            price: 12.5,
          },
          {
            name: "Toast Roerei en Avocado",
            description: "Roerei, avocado, feta, tomaat, rucola & bietenhummus",
            price: 11.5,
          },
          {
            name: "Toast Carpaccio",
            description: "Rucola, Parmezaanse kaas, pijnboompitten & truffelmayonaise",
            price: 13,
          },
          {
            name: "Toast Tunacomo",
            description: "Tonijn, jalapeños & gesmolten cheddar",
            price: 11,
          },
        ],
      },
      {
        slug: "french-toast",
        title: "French Toast",
        intro: "Brioche, goudbruin gebakken.",
        thumb: photo("french-toast", "50% 50%"),
        items: [
          {
            name: "French Toast",
            description: "Brioche, vers fruit, Nutella & poedersuiker",
            price: 14,
          },
        ],
        notes: ["+ Bolletje vanille-ijs € 1,50"],
      },
      {
        slug: "pastas",
        title: "Pasta’s",
        intro: "Keuze uit roomsaus of tomatensaus.",
        thumb: photo("pastas.webp", "50% 50%"),
        hero: photo("pastas.webp", "50% 50%"),
        items: [
          { name: "Penne Scampi", price: 15.5 },
          { name: "Penne Chicken Royal", price: 14 },
        ],
      },
      {
        slug: "pancakes",
        title: "Pancake’s",
        intro: "Luchtige pancakes met verse ingrediënten.",
        thumb: photo("pancakes.webp", "50% 50%"),
        hero: photo("pancakes-hero.webp", "50% 40%"),
        items: [
          {
            name: "Pancake Nutella",
            description: "Nutella, vers fruit & poedersuiker",
            price: 13,
          },
          {
            name: "Como’s Speculoos Pancake",
            description: "Lotus speculoos, vers fruit & koek crumbs",
            price: 14,
          },
          {
            name: "Pancake Maple",
            description: "Maple siroop, vers fruit & poedersuiker",
            price: 12,
          },
        ],
        notes: ["+ Bolletje vanille-ijs € 1,50"],
      },
      {
        slug: "crepes",
        title: "Crêpes",
        intro: "Dun, goudbruin en rijk gevuld.",
        thumb: photo("crepes", "50% 65%"),
        hero: photo("crepes", "50% 70%"),
        items: [
          { name: "Crêpe Nutella", price: 9 },
          { name: "Crêpe Witte Chocola, Aardbei & Banaan", price: 11 },
          { name: "Crêpe Dubai", label: "Favoriet", price: 13.75 },
        ],
        groups: [
          {
            title: "Loaded Crêpes",
            items: [
              { name: "M&M's" },
              { name: "Bueno" },
              { name: "KitKat" },
              { name: "Nutella, Aardbei & Banaan" },
              { name: "Lotus" },
            ],
          },
          {
            title: "Crêpe Rolls",
            items: [
              { name: "Lotus Lava Roll" },
              { name: "Oreo Brunch" },
              { name: "Kinder Bueno Cream" },
              { name: "KitKat Crust" },
              { name: "Dubai Dream Roll" },
            ],
          },
        ],
        notes: ["+ Bolletje vanille-ijs € 1,50"],
      },
      {
        slug: "churros",
        title: "Churros",
        intro: "Krokant van buiten, zacht van binnen.",
        thumb: photo("churros", "40% 50%"),
        items: [
          { name: "Churros Kaneelsuiker", price: 8 },
          { name: "Churros Nutella", price: 9.5 },
          { name: "Churros Witte Chocola", price: 9.5 },
        ],
        notes: ["+ Extra Nutella € 1,50"],
      },
      {
        slug: "desserts",
        title: "Desserts",
        intro: "Elke dag iets anders. Vraag het personeel of kijk in de koelvitrine wat we vandaag hebben.",
        // Placeholder photo until COMO supplies a desserts photo (add desserts.png to photos-src/).
        thumb: photo("crepes", "50% 65%"),
        hero: photo("crepes", "50% 70%"),
        items: [{ name: "Dubai Cups", label: "Altijd verkrijgbaar" }],
        notes: ["Ons dessertaanbod wisselt met de seizoenen en trends. Vraag gerust wat er vandaag in de vitrine staat."],
      },
    ],
  },
  {
    slug: "drankjes",
    title: "Drankjes",
    intro: "Van verse koffie tot verfrissende smoothies en mocktails.",
    card: photo("drankjes-card", "50% 70%"),
    categories: [
      {
        slug: "smoothies",
        title: "Smoothies",
        intro: "Reset your mind: vers geblend met echt fruit.",
        thumb: photo("smoothies.webp", "50% 40%"),
        hero: photo("smoothies.webp", "50% 35%"),
        items: [
          { name: "Smoothie Strawberry Banaan", price: 6.5 },
          {
            name: "Smoothie Exotic Mix",
            description: "Papaya, mango, ananas & meloen",
            price: 7.5,
          },
          {
            name: "Smoothie Berry Mix",
            description: "Zwarte bessen, rode bessen, blauwe bessen & bramen",
            price: 7.5,
          },
          { name: "Smoothie Blueberry", price: 7 },
          { name: "Smoothie Sour Cherries", price: 7 },
        ],
      },
      {
        slug: "mocktails",
        title: "Mocktails",
        intro: "Verfrissend, kleurrijk en alcoholvrij.",
        thumb: photo("mocktails", "50% 58%"),
        hero: photo("mocktails", "50% 60%"),
        items: [
          { name: "Mocktail Mojito", price: 7 },
          { name: "Mocktail Strawberry", price: 7 },
          {
            name: "Mocktail Tropical",
            description: "Passion fruit juice, Tropical Red Bull, munt & limoen",
            price: 8,
          },
        ],
      },
      {
        slug: "iced-matcha",
        title: "Iced Matcha",
        intro: "Romige matcha, ijskoud geserveerd.",
        thumb: photo("iced-matcha", "50% 62%"),
        hero: photo("iced-matcha", "50% 55%"),
        items: [
          { name: "Iced Matcha Latte", price: 6.5 },
          { name: "Iced Matcha Strawberry", price: 7 },
          { name: "Iced Matcha Mango", price: 7 },
          { name: "Iced Matcha Passionfruit", price: 7 },
          { name: "Iced Matcha Witte Chocola", price: 7 },
        ],
        notes: [
          "Melk naar keuze: soja, kokos, haver, amandel, vanille of koemelk",
          "Siroop naar keuze + € 0,50",
        ],
      },
      {
        slug: "iced-coffee",
        title: "Iced Coffee",
        intro: "Onze espresso, koud en verfrissend.",
        thumb: photo("iced-coffee", "50% 64%"),
        hero: photo("iced-coffee", "50% 75%"),
        items: [
          { name: "Iced Latte", price: 6 },
          { name: "Iced Caramel Latte", price: 6.5 },
          { name: "Iced Vanilla Latte", price: 6.5 },
          { name: "Iced Witte Chocola", price: 7 },
        ],
        notes: ["Siroop naar keuze + € 0,50"],
      },
      {
        slug: "warme-dranken",
        title: "Warme Dranken",
        intro: "Van espresso tot verse muntthee.",
        thumb: photo("warme-dranken", "50% 64%"),
        hero: photo("warme-dranken", "50% 62%"),
        items: [
          { name: "Espresso", price: 3.3 },
          { name: "Espresso Doppio", price: 3.75 },
          { name: "Koffie", price: 3.2 },
          { name: "Cappuccino", price: 4.25 },
          { name: "Latte Macchiato", price: 4.25 },
          { name: "Thee", price: 2.5 },
          { name: "Verse Muntthee", price: 3.5 },
          { name: "Marokkaanse Thee", description: "Kleine theepot", price: 4.5 },
          { name: "Marokkaanse Thee To Go", price: 3.5 },
          { name: "Verse Gemberthee", price: 3.5 },
          { name: "Warme Chocolademelk", price: 3.5 },
        ],
      },
      {
        slug: "koude-dranken",
        title: "Koude Dranken",
        intro: "Frisdranken, sappen en meer.",
        thumb: photo("koude-dranken", "50% 45%"),
        items: [
          { name: "Coca-Cola / Coca-Cola Zero", price: 3.25 },
          { name: "Fanta", price: 3.25 },
          { name: "Ice Tea", description: "Green of peach", price: 3.25 },
          { name: "Spa Blauw / Spa Rood", price: 3.25 },
          { name: "Ginger Ale", price: 3.25 },
          { name: "Sprite", price: 3.25 },
          { name: "Cassis", price: 3.25 },
          { name: "Bitter Lemon", price: 3.25 },
          { name: "Appelsap", price: 3.25 },
          { name: "Chocomel / Fristi", price: 3.4 },
          { name: "Red Bull", description: "Ook verkrijgbaar als light", price: 3.5 },
        ],
      },
    ],
  },
]

export const findSection = (slug: string) => sections.find((s) => s.slug === slug)

export const findCategory = (sectionSlug: string, categorySlug: string) =>
  findSection(sectionSlug)?.categories.find((c) => c.slug === categorySlug)
