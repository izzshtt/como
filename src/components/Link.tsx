import type { AnchorHTMLAttributes, MouseEvent } from "react"
import { navigate } from "../router"

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string
  /** Replace the current history entry instead of adding one. */
  replace?: boolean
}

/** A real <a href> (long-press, open in new tab still work) with in-app navigation. */
export function Link({ to, replace, onClick, ...rest }: Props) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    navigate(to, { replace })
  }
  return <a href={`#${to}`} onClick={handleClick} {...rest} />
}
