// ─────────────────────────────────────────────────────────────────────────────
// src/sections/HeroOverlay.jsx  –  Chapter 0
// Design: asymmetric layout matching Dribbble reference
//   LEFT  — brand nav + huge headline + CTAs + metrics strip
//   RIGHT — 3D canvas occupies this space naturally
//   TOP   — floating navbar with logo + links
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/* ── Navbar ── (always visible, fades with hero) */
function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-30 glass-nav"
      aria-label="Site navigation"
    >
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6 md:px-12">
        {/* Logo */}
        <a href="/" className="flex items-center group" aria-label="HydraWash home">
          <img
            src="/logo.png"
            alt="HydraWash Logo"
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(255,122,26,0.35)]"
          />
        </a>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {['Services', 'How it works', 'Pricing', 'Track order'].map(link => (
            <a
              key={link}
              href="#"
              className="font-body text-sm text-white/50 transition-colors hover:text-white"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Nav CTA */}
        <a
          href="/orders/new"
          className="btn-primary text-[0.8rem] px-5 py-2.5"
          aria-label="Book a pickup"
        >
          Book Pickup
        </a>
      </div>
    </nav>
  )
}

export default function HeroOverlay({ visible }) {
  const wrapRef    = useRef()
  const contentRef = useRef()
  const tlRef      = useRef()

  /* Animate in on mount, out when scrolled away */
  useEffect(() => {
    if (!contentRef.current) return

    if (visible) {
      gsap.to(contentRef.current, {
        opacity : 1,
        y       : 0,
        duration: 0.9,
        ease    : 'power3.out',
        pointerEvents: 'auto',
      })
    } else {
      gsap.to(contentRef.current, {
        opacity : 0,
        y       : -30,
        duration: 0.5,
        ease    : 'power2.in',
        pointerEvents: 'none',
      })
    }
  }, [visible])

  return (
    <>
      {/* Navbar always mounted */}
      <Navbar />

      {/* Ambient decorative glow blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
        <div
          className="glow-blob"
          style={{
            width:'600px', height:'600px',
            background:'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)',
            top:'-100px', left:'-100px',
          }}
        />
        <div
          className="glow-blob"
          style={{
            width:'400px', height:'400px',
            background:'radial-gradient(circle, rgba(11,61,145,0.18) 0%, transparent 70%)',
            bottom:'0', right:'10%',
          }}
        />
      </div>

      {/* ── HERO CONTENT (left-aligned) ──────────────────────────────── */}
      <div
        ref={contentRef}
        className="chapter-overlay left opacity-0"
        style={{ pointerEvents: 'none' }}
        aria-hidden={!visible}
      >
        <div className="flex flex-col gap-7 max-w-[540px] pt-16">

          {/* ── Eyebrow chip */}
          <div className="feature-chip w-fit">
            <span className="dot" />
            Next-Gen Fabric Care · Est. 2024
          </div>

          {/* ── Main headline */}
          <h1 className="hero-headline text-white" style={{ lineHeight: '0.92' }}>
            Laundry<br/>
            <span className="text-gradient-aqua" style={{ display:'block', lineHeight:'1' }}>
              simplified.
            </span>
          </h1>

          {/* ── Thin divider */}
          <div className="horiz-line w-24" />

          {/* ── Sub-copy */}
          <p className="font-body text-[0.95rem] text-white/50 leading-[1.7] max-w-sm">
            Professional pickup, wash, dry, iron — returned spotless within
            24 hrs. Your weekends are yours again.
          </p>

          {/* ── CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/orders/new"
              className="btn-primary"
              aria-label="Book a laundry pickup"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
              Book Pickup
            </a>
            <button className="btn-ghost" aria-label="See how HydraWash works">
              How it works
            </button>
          </div>

          {/* ── Mini metrics strip */}
          <div className="flex items-center gap-6 pt-2">
            {[
              { num: '24h',   label: 'Turnaround' },
              { num: '12K+',  label: 'Orders done' },
              { num: '4.9★',  label: 'Avg. rating' },
            ].map(({ num, label }) => (
              <div key={label} className="flex flex-col">
                <span className="font-display font-bold text-xl text-white leading-none">
                  {num}
                </span>
                <span className="font-body text-[0.65rem] text-white/35 uppercase tracking-widest mt-0.5">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll progress bar */}
      <div
        className="scroll-progress"
        style={{ width: '0%' }}
        id="hw-scroll-bar"
        aria-hidden="true"
      />

      {/* ── Scroll cue (bottom center, always visible on hero) */}
      {visible && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20
                     flex flex-col items-center gap-1.5 animate-bounce"
          aria-label="Scroll to explore"
        >
          <span className="label-tag" style={{ fontSize:'0.6rem', letterSpacing:'0.25em' }}>
            Scroll to explore
          </span>
          <div className="h-8 w-px vert-line" style={{ background:'rgba(34,211,238,0.4)' }} />
        </div>
      )}
    </>
  )
}
