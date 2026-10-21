// Business facts for search engines and AI assistants (JSON-LD on the website).
// Keep these in sync with the visible text on the website and with the Google Business Profile:
// the same name, address and phone number everywhere helps local search.

export type OpeningHours = {
  days: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday")[]
  opens: string
  closes: string
}

export const business = {
  name: "COMO. bakery & brunch",
  description: "Café in Arnhem voor gebak, matcha, brunch en koffie. Vers en met liefde bereid.",
  telephone: "+31617415682",
  telephoneDisplay: "06 17415682",
  priceRange: "€10-20",
  servesCuisine: ["Brunch", "Gebak", "Desserts", "Koffie", "Matcha"],
  address: {
    streetAddress: "Johan de Wittlaan 277",
    postalCode: "6828 XM",
    addressLocality: "Arnhem",
    addressCountry: "NL",
  },
  // Exact coordinates, at least 5 decimals: in Google Maps right-click the COMO pin and click the
  // coordinates to copy them. Leave null until filled in; the website then leaves `geo` out.
  geo: null as null | { latitude: number; longitude: number },
  openingHours: [
    {
      days: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "10:00",
      closes: "22:00",
    },
  ] as OpeningHours[],
  hoursShort: "Di t/m zo 10:00–22:00",
  sameAs: ["https://www.instagram.com/como.arnhem/", "https://www.tiktok.com/@como.arnhem"],
  kvk: "98095250",
}
