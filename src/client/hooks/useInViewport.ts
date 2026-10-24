/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'

/**
 * Returns true once the referenced element enters the viewport.
 * After first intersection, stays true (never unmounts the consumer).
 * Falls back to true immediately if IntersectionObserver is unavailable.
 */
export function useInViewport<T extends Element>(
  ref: React.RefObject<T>,
  rootMargin = '200px'
): boolean {
  const [inViewport, setInViewport] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInViewport(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInViewport(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return inViewport
}

/**
 * Viewport-aware loop gate — returns true only while the element is
 * actively intersecting. Use this when the effect should pause (not just
 * defer) when the element leaves the viewport.
 */
export function useActiveViewport<T extends Element>(
  ref: React.RefObject<T>,
  threshold = 0.1
): boolean {
  const [active, setActive] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setActive(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return active
}
