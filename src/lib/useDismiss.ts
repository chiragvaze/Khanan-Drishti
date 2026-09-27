import { useEffect } from 'react'
import type { RefObject } from 'react'

/** Close a popover on outside pointer-down or Escape. */
export function useDismiss(open: boolean, onClose: () => void, refs: RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (refs.some((r) => r.current?.contains(target))) return
      onClose()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose])
}
