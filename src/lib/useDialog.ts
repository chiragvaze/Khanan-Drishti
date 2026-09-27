import { useEffect, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Accessibility behaviour shared by modal dialogs and side sheets:
 * Escape closes, focus moves into the dialog, Tab is trapped, focus is
 * restored to the trigger on close, and page scroll is locked.
 */
export function useDialog(open: boolean, onClose: () => void, containerRef: RefObject<HTMLElement | null>, options?: { lockScroll?: boolean; closeOnEscape?: boolean; focusContainer?: boolean }) {
  const onCloseRef = useRef(onClose)
  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })
  const lockScroll = options?.lockScroll ?? true
  const closeOnEscape = options?.closeOnEscape ?? true
  const focusContainer = options?.focusContainer ?? false

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const container = containerRef.current

    // Defer so the element is painted before focusing
    const raf = requestAnimationFrame(() => {
      if (!container) return
      if (focusContainer) {
        container.focus({ preventScroll: true })
        return
      }
      const preferred = container.querySelector<HTMLElement>('[data-autofocus]')
      const first = preferred ?? container.querySelector<HTMLElement>(FOCUSABLE)
      ;(first ?? container).focus({ preventScroll: true })
    })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !container) return
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    if (lockScroll) document.body.style.overflow = 'hidden'

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      if (lockScroll) document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [open, containerRef, lockScroll, closeOnEscape, focusContainer])
}
