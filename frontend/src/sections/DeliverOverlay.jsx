// ─────────────────────────────────────────────────────────────────────────────
// src/sections/DeliverOverlay.jsx  –  Chapter 4
// Design: dark luxury stat cards + tracking panel, centered layout
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react'
import gsap           from 'gsap'
import StatCounter    from '../components/StatCounter'
import TrackingWidget from '../components/TrackingWidget'

const STAT_CONFIG = [
  {
    key    : 'delivered',
    suffix : '+',
    label  : 'Orders delivered',
    icon   : (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22D3EE"
        strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M5 12l5 5L19 7"/>
      </svg>
    ),
  },
  {
    key    : 'customers',
    suffix : '+',
    label  : 'Happy customers',
    icon   : (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22D3EE"
        strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    key    : 'pending',
    suffix : '',
    label  : 'In progress now',
    icon   : (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22D3EE"
        strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 3"/>
      </svg>
    ),
  },
]

export default function DeliverOverlay({ visible, stats }) {
  const ref     = useRef()
  const statsRef = useRef()

  useEffect(() => {
    if (!ref.current) return
    if (visible) {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 50, pointerEvents: 'none' },
        { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', pointerEvents: 'auto' }
      )
      // Stagger the stat cards
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.querySelectorAll('.stat-card'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.3 }
        )
      }
    } else {
      gsap.to(ref.current, { opacity: 0, y: 20, duration: 0.4, ease: 'power2.in', pointerEvents: 'none' })
    }
  }, [visible])

  return (
    <div
      ref={ref}
      className="chapter-overlay center flex-col gap-8 opacity-0 px-6"
      style={{ pointerEvents: 'none' }}
      aria-hidden={!visible}
    >
      {/* ── Section header */}
      <div className="text-center">
        <div className="feature-chip mx-auto mb-4 w-fit">
          <span className="dot" />
          04 · Deliver
        </div>
        <h2 className="section-headline text-white">
          Numbers that{' '}
          <span className="text-gradient-aqua">speak</span>
        </h2>
        <p className="mt-3 font-body text-sm text-white/40 max-w-xs mx-auto">
          Real-time metrics from our laundry network
        </p>
      </div>

      {/* ── Stat cards row */}
      <div
        ref={statsRef}
        className="flex flex-wrap justify-center gap-4"
        aria-label="Service statistics"
      >
        {STAT_CONFIG.map(({ key, label, suffix, icon }) => (
          <div
            key={key}
            className="stat-card glass flex flex-col items-center gap-3 px-7 py-5 min-w-[140px]"
            style={{ borderColor: 'rgba(34,211,238,0.12)' }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: 'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.15)' }}
            >
              {icon}
            </div>
            {visible
              ? <StatCounter target={stats?.[key] ?? 0} suffix={suffix} label={label} />
              : <div className="stat-num">0</div>
            }
          </div>
        ))}
      </div>

      {/* ── Order tracker */}
      <TrackingWidget />
    </div>
  )
}
