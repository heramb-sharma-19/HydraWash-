// ─────────────────────────────────────────────────────────────────────────────
// src/components/StatCounter.jsx
// Animated count-up number; triggers when visible prop becomes true
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'

export default function StatCounter({ target, label, suffix = '' }) {
  const [count,   setCount]   = useState(0)
  const [started, setStarted] = useState(false)
  const frameRef  = useRef()

  useEffect(() => {
    if (started) return
    setStarted(true)

    const duration  = 1800        // ms
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const t       = Math.min(1, elapsed / duration)
      // ease-out-expo
      const eased   = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setCount(Math.round(eased * target))
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, started])

  return (
    <div className="flex flex-col items-center gap-1" aria-label={`${target}${suffix} ${label}`}>
      <span className="stat-num" aria-hidden="true">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="font-body text-xs uppercase tracking-widest text-white/50">
        {label}
      </span>
    </div>
  )
}

