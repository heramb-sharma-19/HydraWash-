// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useScrollProgress.js
// Returns a live ref (scrollRef.current ∈ [0,1]) AND a state value
// for components that need to re-render on scroll.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * @param {number} totalVh – total scroll height in vh units (default 600)
 * @returns {{ progress: number, chapter: number, scrollRef: React.MutableRefObject }}
 */
export function useScrollProgress(totalVh = 600) {
  const scrollRef   = useRef(0)        // raw 0-1, updated every rAF (no re-render)
  const [progress, setProgress] = useState(0)

  const onScroll = useCallback(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    if (maxScroll <= 0) return
    const raw = Math.min(1, Math.max(0, window.scrollY / maxScroll))
    scrollRef.current = raw
    setProgress(raw)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initialise
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  // Chapter: 0-5 across 600vh (each chapter ~100vh = 1/6 of progress)
  const chapter = Math.min(5, Math.floor(progress * 6))

  return { progress, chapter, scrollRef }
}

// ── Chapter metadata ──────────────────────────────────────────────────────────
export const CHAPTER_NAMES    = ['hero', 'wash', 'dry', 'iron', 'deliver', 'cta']
export const CHAPTER_COUNT    = 6
export const CHAPTER_FRACTION = 1 / CHAPTER_COUNT   // 1/6 ≈ 0.1667

/** Returns [0,1] progress *within* the current chapter */
export function getChapterProgress(globalProgress, chapter) {
  const start = chapter * CHAPTER_FRACTION
  const end   = start + CHAPTER_FRACTION
  return Math.min(1, Math.max(0, (globalProgress - start) / (end - start)))
}

