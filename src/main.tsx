import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
// Self-hosted fonts: no request to Google, served from our own domain.
import "@fontsource/montserrat/500.css"
import "@fontsource/montserrat/600.css"
import "@fontsource/dm-sans/400.css"
import "@fontsource/dm-sans/500.css"
import "./styles.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
