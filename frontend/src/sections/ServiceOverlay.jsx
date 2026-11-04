// ─────────────────────────────────────────────────────────────────────────────
// src/sections/ServiceOverlay.jsx  –  Chapters 1-3 (Wash / Dry / Iron)
// Design matches Dribbble: tall glass panel on the right, asymmetric,
// with large chapter number, icon, spec rows, micro-animation on entry
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/* ── Per-chapter visual config ──────────────────────────────────────────── */
const CFG = {
  1: {
    num      : '01',
    name     : 'Wash',
    accent   : '#22D3EE',
    accentDim: 'rgba(34,211,238,0.12)',
    icon     : (
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="20" stroke="#22D3EE" strokeWidth="1.5" opacity="0.4"/>
        <circle cx="24" cy="24" r="12" stroke="#22D3EE" strokeWidth="1.5"/>
        <path d="M14 28c2-4 5-6 10-6s8 2 10 6" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="24" cy="20" r="2.5" fill="#22D3EE"/>
      </svg>
    ),
    tag    : 'Deep Clean Cycle',
    specs  : [
      { key: 'Cycle time',    val: '45 min' },
      { key: 'Temperature',   val: '30–60°C' },
      { key: 'Detergent',     val: 'Eco-certified' },
    ],
    bg: 'radial-gradient(ellipse at 80% 50%, rgba(34,211,238,0.06) 0%, transparent 60%)',
  },
  2: {
    num      : '02',
    name     : 'Dry',
    accent   : '#F59E0B',
    accentDim: 'rgba(245,158,11,0.12)',
    icon     : (
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="20" stroke="#F59E0B" strokeWidth="1.5" opacity="0.4"/>
        <circle cx="24" cy="24" r="10" stroke="#F59E0B" strokeWidth="1.5"/>
        {[0,45,90,135,180,225,270,315].map((a,i) => (
          <line key={i}
            x1={24 + Math.cos((a*Math.PI)/180)*13}
            y1={24 + Math.sin((a*Math.PI)/180)*13}
            x2={24 + Math.cos((a*Math.PI)/180)*16}
            y2={24 + Math.sin((a*Math.PI)/180)*16}
            stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
        ))}
        <circle cx="24" cy="24" r="3" fill="#F59E0B"/>
      </svg>
    ),
    tag    : 'Gentle Tumble Dry',
    specs  : [
      { key: 'Cycle time',  val: '35 min' },
      { key: 'Heat setting', val: 'Low / Med' },
      { key: 'Fabric safe',  val: 'All types' },
    ],
    bg: 'radial-gradient(ellipse at 80% 50%, rgba(245,158,11,0.07) 0%, transparent 60%)',
  },
  3: {
    num      : '03',
    name     : 'Iron',
    accent   : '#C8D8E8',
    accentDim: 'rgba(200,216,232,0.10)',
    icon     : (
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none" aria-hidden="true">
        <path d="M8 30h24l6-12H14L8 30Z" stroke="#C8D8E8" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 30v4h24v-4" stroke="#C8D8E8" strokeWidth="1.5"/>
        <path d="M18 18v-4M24 18v-6M30 18v-4" stroke="#C8D8E8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <rect x="10" y="34" width="20" height="3" rx="1.5" fill="#C8D8E8" opacity="0.3"/>
      </svg>
    ),
    tag    : 'Professional Press',
    specs  : [
      { key: 'Steam press',  val: '200°C' },
      { key: 'Finish',       val: 'Crisp / Soft' },
      { key: 'Fold & pack',  val: 'Included' },
    ],
    bg: 'radial-gradient(ellipse at 80% 50%, rgba(200,216,232,0.05) 0%, transparent 60%)',
  },
}

export default function ServiceOverlay({ chapter, service, visible }) {
  const ref  = useRef()
  const cfg  = CFG[chapter] || CFG[1]

  useEffect(() => {
    if (!ref.current) return
    if (visible) {
      gsap.fromTo(ref.current,
        { opacity: 0, x: 50, pointerEvents: 'none' },
        { opacity: 1, x: 0, duration: 0.75, ease: 'power3.out', pointerEvents: 'auto' }
      )
    } else {
      gsap.to(ref.current, {
        opacity: 0, x: 40, duration: 0.4, ease: 'power2.in', pointerEvents: 'none',
      })
    }
  }, [visible])

  const svcName  = service?.service_name ?? cfg.name
  const svcPrice = service?.price        ?? '—'
  const svcDesc  = service?.description  ?? 'Premium quality, with care.'

  return (
    <div
      ref={ref}
      className="chapter-overlay right opacity-0"
      aria-hidden={!visible}
      style={{ paddingRight: 'clamp(2rem,7vw,7rem)' }}
    >
      {/* Tall card */}
      <div
        className="glass service-card flex flex-col gap-5 w-[300px] md:w-[330px]"
        style={{
          padding        : '2rem 1.75rem',
          background     : `${cfg.accentDim}, rgba(6,13,27,0.7)`,
          borderColor    : `${cfg.accent}25`,
          boxShadow      : `0 0 0 1px ${cfg.accent}18, 0 24px 60px rgba(0,0,0,0.55)`,
        }}
      >
        {/* Top row: chapter number + tag */}
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[0.65rem] tracking-widest"
            style={{ color: cfg.accent, opacity: 0.7 }}
          >
            CH.{cfg.num}
          </span>
          <span
            className="feature-chip text-[0.6rem]"
            style={{
              color      : cfg.accent,
              borderColor: `${cfg.accent}30`,
              background : cfg.accentDim,
            }}
          >
            {cfg.tag}
          </span>
        </div>

        {/* Icon */}
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: cfg.accentDim, border: `1px solid ${cfg.accent}22` }}
          aria-hidden="true"
        >
          {cfg.icon}
        </div>

        {/* Name */}
        <div>
          <h2
            className="font-display font-bold leading-none"
            style={{ fontSize: 'clamp(2.2rem,4vw,3rem)', color: cfg.accent }}
          >
            {svcName}
          </h2>
          <p className="mt-2 font-body text-[0.82rem] text-white/45 leading-relaxed">
            {svcDesc}
          </p>
        </div>

        {/* Divider */}
        <div className="horiz-line" style={{ opacity: 0.15 }} />

        {/* Spec rows */}
        <ul className="flex flex-col gap-2.5">
          {cfg.specs.map(({ key, val }) => (
            <li
              key={key}
              className="flex items-center justify-between font-body text-[0.78rem]"
            >
              <span className="text-white/40">{key}</span>
              <span className="font-medium" style={{ color: cfg.accent }}>{val}</span>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="horiz-line" style={{ opacity: 0.15 }} />

        {/* Price row */}
        <div className="flex items-end justify-between">
          <div>
            <div className="label-tag mb-1" style={{ color: `${cfg.accent}80` }}>
              starting at
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="font-display font-bold"
                style={{ fontSize: '2.2rem', color: cfg.accent, lineHeight: 1 }}
              >
                {svcPrice}
              </span>
              <span className="font-body text-xs text-white/30 mb-0.5">/ load</span>
            </div>
          </div>

          {/* Book CTA */}
          <a
            href="/orders/new"
            className="btn-outline-aqua text-[0.75rem] px-4 py-2"
            style={{
              color: cfg.accent,
              borderColor: `${cfg.accent}40`,
            }}
            aria-label={`Book ${svcName} service`}
          >
            Book →
          </a>
        </div>
      </div>
    </div>
  )
}
