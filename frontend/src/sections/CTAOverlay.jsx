// ─────────────────────────────────────────────────────────────────────────────
// src/sections/CTAOverlay.jsx  –  Chapter 5
// Design: full-bleed centered, huge headline, glowing CTA, footer strip
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const FOOTER_LINKS = [
  { icon: '⏰', text: 'Mon–Sat · 8 AM – 8 PM' },
  { icon: '📞', text: '1800-HYDRA-WS' },
  { icon: '📧', text: 'hello@hydrawash.in' },
  { icon: '📍', text: 'Available in 20+ cities' },
]

export default function CTAOverlay({ visible }) {
  const ref    = useRef()
  const tlRef  = useRef()

  useEffect(() => {
    if (!ref.current) return
    if (visible) {
      tlRef.current = gsap.timeline()
      tlRef.current
        .fromTo(ref.current,
          { opacity: 0, pointerEvents: 'none' },
          { opacity: 1, duration: 0.6, ease: 'power2.out', pointerEvents: 'auto' }
        )
        .fromTo(ref.current.querySelector('.cta-headline'),
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo(ref.current.querySelectorAll('.cta-item'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
          '-=0.5'
        )
    } else {
      gsap.to(ref.current, {
        opacity: 0, duration: 0.35, ease: 'power2.in', pointerEvents: 'none',
      })
    }
  }, [visible])

  return (
    <div
      ref={ref}
      className="chapter-overlay center flex-col gap-8 opacity-0 px-6"
      style={{ pointerEvents: 'none' }}
      aria-hidden={!visible}
    >
      {/* Decorative label */}
      <div className="feature-chip cta-item w-fit">
        <span className="dot animate-pulse" />
        Ready when you are
      </div>

      {/* Main headline */}
      <div className="cta-headline text-center">
        <h2
          className="font-display font-bold text-white"
          style={{ fontSize:'clamp(2.5rem,7vw,6rem)', lineHeight:'0.95', letterSpacing:'-0.03em' }}
        >
          Fresh clothes,
          <br />
          <span className="text-gradient-aqua glow-aqua-text">
            zero effort.
          </span>
        </h2>
      </div>

      {/* Sub-copy */}
      <p className="cta-item max-w-sm text-center font-body text-sm text-white/45 leading-relaxed">
        Schedule your first pickup today. We handle the rest —
        guaranteed 24-hour turnaround, or it's on us.
      </p>

      {/* CTA buttons */}
      <div className="cta-item flex flex-wrap items-center justify-center gap-3">
        <a
          href="/orders/new"
          className="btn-primary text-[1rem] px-8 py-4 glow-aqua"
          aria-label="Book your laundry pickup"
        >
          Book Your Pickup
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </a>
        <button className="btn-ghost" aria-label="Learn more about pricing">
          View Pricing
        </button>
      </div>

      {/* Guarantee badge */}
      <div
        className="cta-item glass-light flex items-center gap-3 px-5 py-3 rounded-full"
        style={{ border:'1px solid rgba(34,211,238,0.12)' }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="#22D3EE" aria-hidden="true">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2Z"/>
        </svg>
        <span className="font-body text-xs text-white/55">
          24-hr turnaround guarantee · eco-certified detergents
        </span>
      </div>

      {/* Divider */}
      <div className="horiz-line cta-item w-full max-w-lg" style={{ opacity: 0.1 }} />

      {/* Footer strip */}
      <footer
        className="cta-item flex flex-wrap items-center justify-center gap-x-8 gap-y-2"
        aria-label="Contact information"
      >
        {FOOTER_LINKS.map(({ icon, text }) => (
          <span
            key={text}
            className="font-body text-[0.72rem] text-white/30 flex items-center gap-1.5"
          >
            <span aria-hidden="true">{icon}</span>
            {text}
          </span>
        ))}
      </footer>

      {/* Copyright */}
      <p className="cta-item font-body text-[0.62rem] text-white/20 tracking-widest uppercase">
        © 2026 HydraWash · All rights reserved
      </p>
    </div>
  )
}
