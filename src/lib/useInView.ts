import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

/** True once the element has come within `rootMargin` of the viewport (latches, never resets). */
export function useInView(ref: RefObject<Element | null>, rootMargin = '0px') {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin, inView])

  return inView
}
