// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useMouseParallax.js
// Tracks normalised mouse position (–1 to 1 on each axis)
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react'

/**
 * @returns {React.MutableRefObject<{x: number, y: number}>}
 * Updated on every mousemove, does NOT cause re-renders.
 */
export function useMouseParallax() {
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e) => {
      mouse.current = {
        x:  (e.clientX / window.innerWidth  - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return mouse
}

