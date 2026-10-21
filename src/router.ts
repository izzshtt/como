import { useEffect, useState } from "react"

// Tiny hash router: works on any static host, and the browser's own back button
// behaves like on a normal website.

export type Route =
  | { name: "home" }
  | { name: "section"; section: string }
  | { name: "category"; section: string; category: string }

const scrollPositions = new Map<string, number>()

const currentPath = () => window.location.hash.replace(/^#/, "") || "/"

export function parseRoute(path: string): Route {
  const [section, category] = path.split("/").filter(Boolean)
  if (section && category) return { name: "category", section, category }
  if (section) return { name: "section", section }
  return { name: "home" }
}

export function parentPath(path: string) {
  const parts = path.split("/").filter(Boolean)
  return parts.length > 1 ? `/${parts[0]}` : "/"
}

function emit() {
  window.dispatchEvent(new Event("como:navigate"))
}

type NavigateOptions = { replace?: boolean }

export function navigate(to: string, { replace = false }: NavigateOptions = {}) {
  const from = currentPath()
  if (to === from) {
    window.scrollTo({ top: 0, behavior: "smooth" })
    return
  }
  scrollPositions.set(from, window.scrollY)
  if (replace) {
    // Same history slot: keep where this entry originally came from.
    window.history.replaceState({ como: true, from: window.history.state?.from }, "", `#${to}`)
  } else {
    window.history.pushState({ como: true, from }, "", `#${to}`)
  }
  emit()
  window.scrollTo(0, 0)
}

/** Back arrow: always one level up (category -> overview -> Home), never through earlier switches. */
export function goBack() {
  const parent = parentPath(currentPath())
  if (window.history.state?.from === parent) {
    // We came straight from the parent: a real back restores its scroll position.
    window.history.back()
  } else {
    navigate(parent, { replace: true })
  }
}

export function usePath() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual"
    const onNavigate = () => setPath(currentPath())
    const onPop = () => {
      const next = currentPath()
      setPath(next)
      requestAnimationFrame(() => window.scrollTo(0, scrollPositions.get(next) ?? 0))
    }
    window.addEventListener("como:navigate", onNavigate)
    window.addEventListener("popstate", onPop)
    return () => {
      window.removeEventListener("como:navigate", onNavigate)
      window.removeEventListener("popstate", onPop)
    }
  }, [])

  return path
}
