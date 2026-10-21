import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import { sitePlugin } from "./scripts/vite-plugin-site"

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // SITE_URL = the live address, e.g. https://www.example.nl (no trailing slash). Set it in the
  // hosting environment or in .env.production.local. Without it the build is a demo: noindex.
  const env = loadEnv(mode, root, "")
  const siteUrl = env.SITE_URL ? env.SITE_URL.trim().replace(/\/+$/, "") : undefined
  if (siteUrl && !/^https:\/\/[^/]+$/.test(siteUrl)) {
    throw new Error(`SITE_URL must look like https://www.example.nl, got "${siteUrl}"`)
  }

  return {
    plugins: [react(), sitePlugin({ siteUrl })],
    // Separate pages, no single-page fallback: unknown paths get a real 404, like in production.
    appType: "mpa",
    server: { host: true, port: 5173 },
    build: {
      rollupOptions: {
        // The website at /, the full menu as text at /menukaart/ and the menu app at /menu/.
        input: {
          home: resolve(root, "index.html"),
          menukaart: resolve(root, "menukaart/index.html"),
          menu: resolve(root, "menu/index.html"),
        },
      },
    },
  }
})
