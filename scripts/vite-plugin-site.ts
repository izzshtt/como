// Build-time helpers for the website pages (index.html and menukaart/index.html) and the
// menu shell (menu/index.html). Everything here runs while Vite builds; the pages that reach
// visitors stay plain HTML and CSS.
//
// Markers it fills in (an HTML comment in the page source):
//   <!-- site:seo -->      canonical, Open Graph url/image; or noindex when SITE_URL is not set
//   <!-- site:jsonld -->   structured data (business on the homepage, full menu on the menukaart)
//   <!-- site:header -->   shared header
//   <!-- site:footer -->   shared footer with name, address, phone and opening hours
//   <!-- menu:overview --> sentence listing the categories (homepage FAQ)
//   <!-- menu:prices -->   sentence with the price ranges (homepage FAQ)
//   <!-- menu:full -->     the complete menu with prices (menukaart)
// It also writes robots.txt, and sitemap.xml when SITE_URL is set.

import { relative } from "node:path"
import type { Plugin } from "vite"
import { business } from "../src/data/business"
import { sections, type Category, type MenuItem, type Section } from "../src/data/menu"

type Options = {
  /** The live address without a trailing slash, e.g. https://www.example.nl. Unset = demo, noindex. */
  siteUrl?: string
}

const PAGES: Record<string, string> = {
  "index.html": "/",
  "menu/index.html": "/menu/",
  "menukaart/index.html": "/menukaart/",
}

const SHARE_IMAGE = { path: "/img/share/como-og.jpg", width: 1200, height: 630 }
const SCHEMA_IMAGES = ["/img/share/como-1x1.jpg", "/img/share/como-4x3.jpg", "/img/share/como-16x9.jpg"]

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const euro = (value: number) => (Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(".", ","))

/** "a, b en c" */
const listNl = (items: string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} en ${items[items.length - 1]}`

const allItems = (category: Category): MenuItem[] => [
  ...category.items,
  ...(category.groups ?? []).flatMap((group) => group.items),
]

const priceRange = (section: Section) => {
  const prices = section.categories.flatMap(allItems).flatMap((item) => (item.price === undefined ? [] : [item.price]))
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

const jsonLd = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data, null, 2).replace(/</g, "\\u003c")}</script>`

/* ------------------------------------------------------------------------ */

function seoHead(siteUrl: string | undefined, pagePath: string) {
  if (!siteUrl) return `<meta name="robots" content="noindex" />`
  const url = siteUrl + pagePath
  return [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${siteUrl}${SHARE_IMAGE.path}" />`,
    `<meta property="og:image:width" content="${SHARE_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${SHARE_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="Iced matcha, mocktail, taart en pancakes bij COMO. in Arnhem" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join("\n    ")
}

function businessJsonLd(siteUrl: string | undefined) {
  return {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "CafeOrCoffeeShop"],
    "@id": siteUrl ? `${siteUrl}/#business` : undefined,
    name: business.name,
    description: business.description,
    url: siteUrl ? `${siteUrl}/` : undefined,
    menu: siteUrl ? `${siteUrl}/menukaart/` : undefined,
    image: siteUrl ? SCHEMA_IMAGES.map((path) => siteUrl + path) : undefined,
    logo: siteUrl ? `${siteUrl}/icon-512.png` : undefined,
    telephone: business.telephone,
    priceRange: business.priceRange,
    servesCuisine: business.servesCuisine,
    address: { "@type": "PostalAddress", ...business.address },
    geo: business.geo ? { "@type": "GeoCoordinates", ...business.geo } : undefined,
    openingHoursSpecification: business.openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.days,
      opens: hours.opens,
      closes: hours.closes,
    })),
    sameAs: business.sameAs,
  }
}

function menuJsonLd(siteUrl: string | undefined) {
  const item = (menuItem: MenuItem) => ({
    "@type": "MenuItem",
    name: menuItem.name,
    description: menuItem.description,
    offers:
      menuItem.price === undefined
        ? undefined
        : { "@type": "Offer", price: menuItem.price.toFixed(2), priceCurrency: "EUR" },
  })
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": siteUrl ? `${siteUrl}/menukaart/#menu` : undefined,
    name: `Menukaart ${business.name}`,
    inLanguage: "nl",
    url: siteUrl ? `${siteUrl}/menukaart/` : undefined,
    hasMenuSection: sections.map((section) => ({
      "@type": "MenuSection",
      name: section.title,
      hasMenuSection: section.categories.map((category) => ({
        "@type": "MenuSection",
        name: category.title,
        description: category.intro,
        hasMenuItem: category.items.map(item),
        hasMenuSection: category.groups?.map((group) => ({
          "@type": "MenuSection",
          name: group.title,
          description: group.intro,
          hasMenuItem: group.items.map(item),
        })),
      })),
    })),
  }
}

/* ------------------------------------------------------------------------ */

function header(onHome: boolean) {
  const base = onHome ? "" : "/"
  return `<header class="site-header">
      <div class="container site-header__inner">
        <a class="site-header__logo" href="/" aria-label="COMO., naar de homepage">
          <img src="/img/logo/como-black.png" width="1400" height="437" alt="COMO. bakery &amp; brunch" />
        </a>
        <nav class="site-nav" aria-label="Hoofdmenu">
          <a class="site-nav__link" href="${base}#over">Over COMO</a>
          <a class="site-nav__link" href="${base}#bezoek">Bezoek ons</a>
          <a class="btn btn--dark btn--small" href="/menu/">
            <span class="only-mobile">Menu</span>
            <span class="only-desktop">Bekijk het menu</span>
          </a>
        </nav>
      </div>
    </header>`
}

function footer(onHome: boolean) {
  const base = onHome ? "" : "/"
  const a = business.address
  return `<footer class="site-footer">
      <div class="container site-footer__inner">
        <img class="site-footer__logo" src="/img/logo/como-black.png" width="1400" height="437" alt="COMO. bakery &amp; brunch" loading="lazy" />
        <nav class="site-footer__nav" aria-label="Footer">
          <a href="/menu/">Menu</a>
          <a href="/menukaart/">Menukaart met prijzen</a>
          <a href="${base}#over">Over COMO</a>
          <a href="${base}#bezoek">Bezoek ons</a>
        </nav>
        <div class="site-footer__contact">
          <address>${esc(a.streetAddress)}, ${esc(a.postalCode)} ${esc(a.addressLocality)}</address>
          <span><a href="tel:${business.telephone}">${business.telephoneDisplay}</a> · ${esc(business.hoursShort)}</span>
        </div>
        <p class="site-footer__meta">
          <span>KvK ${business.kvk}</span>
          <span>Designed by <a href="https://altevo.nl" target="_blank" rel="noopener">Altevo</a></span>
        </p>
      </div>
    </footer>`
}

function menuOverview() {
  const titles = (slug: Section["slug"]) => sections.find((s) => s.slug === slug)?.categories.map((c) => c.title) ?? []
  return `Om te eten: ${esc(listNl(titles("eten")))}. Om te drinken: ${esc(listNl(titles("drankjes")))}.`
}

function menuPrices() {
  const food = sections.find((s) => s.slug === "eten")
  const drinks = sections.find((s) => s.slug === "drankjes")
  const parts: string[] = []
  if (food) {
    const r = priceRange(food)
    parts.push(`Gerechten kosten tussen €&nbsp;${euro(r.min)} en €&nbsp;${euro(r.max)}.`)
  }
  if (drinks) {
    const r = priceRange(drinks)
    parts.push(`Drankjes kosten tussen €&nbsp;${euro(r.min)} en €&nbsp;${euro(r.max)}.`)
  }
  return parts.join(" ")
}

function menuItemHtml(item: MenuItem) {
  const label = item.label ? ` <span class="mk-item__label">${esc(item.label)}</span>` : ""
  const description = item.description ? `<p class="mk-item__desc">${esc(item.description)}</p>` : ""
  const price = item.price === undefined ? "" : `<span class="mk-item__price">€&nbsp;${euro(item.price)}</span>`
  return `<li class="mk-item"><div><span class="mk-item__name">${esc(item.name)}</span>${label}${description}</div>${price}</li>`
}

function menuFull() {
  const nav = sections
    .flatMap((section) => section.categories)
    .map((category) => `<li><a href="#${category.slug}">${esc(category.title)}</a></li>`)
    .join("")
  const body = sections
    .map((section) => {
      const categories = section.categories
        .map((category) => {
          const groups = (category.groups ?? [])
            .map(
              (group) =>
                `<h4 class="mk-group__title">${esc(group.title)}</h4>${group.intro ? `<p class="mk-cat__intro">${esc(group.intro)}</p>` : ""}<ul class="mk-list">${group.items.map(menuItemHtml).join("")}</ul>`,
            )
            .join("")
          const notes = (category.notes ?? []).map((note) => `<p class="mk-note">${esc(note)}</p>`).join("")
          return `<div class="mk-cat" id="${category.slug}">
          <h3 class="mk-cat__title">${esc(category.title)}</h3>
          <p class="mk-cat__intro">${esc(category.intro)}</p>
          <ul class="mk-list">${category.items.map(menuItemHtml).join("")}</ul>${groups}${notes}
        </div>`
        })
        .join("\n        ")
      return `<section class="mk-section" aria-labelledby="mk-${section.slug}">
        <h2 class="mk-section__title" id="mk-${section.slug}">${esc(section.title)}</h2>
        <div class="mk-section__cats">
        ${categories}
        </div>
      </section>`
    })
    .join("\n      ")
  return `<nav aria-label="Categorieën"><ul class="mk-nav">${nav}</ul></nav>
      ${body}`
}

/* ------------------------------------------------------------------------ */

export function sitePlugin({ siteUrl }: Options): Plugin {
  let root = process.cwd()
  return {
    name: "como-site",
    configResolved(config) {
      root = config.root
    },
    buildStart() {
      if (!siteUrl) {
        this.warn("SITE_URL is not set: pages are marked noindex and no sitemap.xml is written (fine for a demo).")
      }
    },
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const file = relative(root, ctx.filename).split("\\").join("/")
        const pagePath = PAGES[file]
        if (!pagePath) return html
        const onHome = pagePath === "/"
        const structured =
          pagePath === "/" ? jsonLd(businessJsonLd(siteUrl)) : pagePath === "/menukaart/" ? jsonLd(menuJsonLd(siteUrl)) : ""
        return html
          .replace("<!-- site:seo -->", seoHead(siteUrl, pagePath))
          .replace("<!-- site:jsonld -->", structured)
          .replace("<!-- site:header -->", header(onHome))
          .replace("<!-- site:footer -->", footer(onHome))
          .replace("<!-- menu:overview -->", menuOverview())
          .replace("<!-- menu:prices -->", menuPrices())
          .replace("<!-- menu:full -->", menuFull())
      },
    },
    generateBundle() {
      const robots = ["User-agent: *", "Allow: /", ...(siteUrl ? ["", `Sitemap: ${siteUrl}/sitemap.xml`] : [])]
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots.join("\n") + "\n" })
      if (!siteUrl) return
      const today = new Date().toISOString().slice(0, 10)
      const urls = ["/", "/menukaart/", "/menu/"]
        .map((path) => `  <url>\n    <loc>${siteUrl}${path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
        .join("\n")
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
  }
}
