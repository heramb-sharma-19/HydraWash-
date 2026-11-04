// ─────────────────────────────────────────────────────────────────────────────
// src/components/LoadingScreen.jsx – refined branded loader (Black / Orange / Beige)
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useProgress }         from '@react-three/drei'

export default function LoadingScreen() {
  const { progress, active } = useProgress()
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (!active && progress >= 99) {
      setFadeOut(true)
      const id = setTimeout(() => setVisible(false), 700)
      return () => clearTimeout(id)
    }
  }, [active, progress])

  if (!visible) return null

  const pct = Math.round(Math.min(progress, 100))

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background   : '#000000',
        opacity      : fadeOut ? 0 : 1,
        transition   : 'opacity 0.7s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
      role="status"
      aria-live="polite"
      aria-label={`Loading HydraWash – ${pct}%`}
    >
      {/* Ambient warm orange glow */}
      <div
        aria-hidden="true"
        style={{
          position:'absolute', width:'480px', height:'480px',
          background:'radial-gradient(circle, rgba(255,122,26,0.14) 0%, transparent 70%)',
          borderRadius:'50%', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          pointerEvents:'none',
        }}
      />

      {/* Branded Complete Logo with Ambient Glow */}
      <div className="relative mb-8 flex flex-col items-center">
        <img
          src="/logo.png"
          alt="HydraWash"
          className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_0_24px_rgba(255,122,26,0.45)]"
        />
      </div>

      {/* Percentage */}
      <p className="font-mono text-xs text-[#DCD2C4]/60 tracking-widest mb-6">
        {String(pct).padStart(3, '0')} %
      </p>

      {/* Progress bar */}
      <div
        className="overflow-hidden rounded-full border border-[#F4F1EA]/10"
        style={{ width:'160px', height:'3px', background:'rgba(255,255,255,0.06)' }}
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#F4F1EA]"
          style={{ width: `${pct}%`, transition: 'width 0.2s ease' }}
        />
      </div>

      {/* Tagline */}
      <p className="mt-6 font-mono text-[0.68rem] text-[#DCD2C4]/40 tracking-widest uppercase">
        Powering Precision Fabric Care…
      </p>
    </div>
  )
}
