import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  // Two separate pages, no single-page fallback: unknown paths get a real 404, like in production.
  appType: "mpa",
  server: { host: true, port: 5173 },
  build: {
    rollupOptions: {
      // The website at / and the menu app at /menu/.
      input: {
        home: resolve(root, "index.html"),
        menu: resolve(root, "menu/index.html"),
      },
    },
  },
})
