// ─────────────────────────────────────────────────────────────────────────────
// src/App.jsx
// Root component:
// Clean 3D Interactive Laundry Machine Hero Page powered by Three.js
// Integrates live Express REST API data (services, stats, order tracking).
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo } from 'react'
import { useAPI } from './hooks/useAPI'
import { fetchServices, fetchStats, FALLBACK_SERVICES, FALLBACK_STATS } from './api/services'
import HeroFactory from './sections/HeroFactory'

// ── Detect prefers-reduced-motion ─────────────────────────────────────────────
const reducedMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  // ── Data fetching from Express backend ──────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchServicesMemo = useMemo(() => fetchServices, [])
  const fetchStatsMemo    = useMemo(() => fetchStats, [])

  const { data: services } = useAPI(fetchServicesMemo, FALLBACK_SERVICES)
  const { data: stats    } = useAPI(fetchStatsMemo,    FALLBACK_STATS)

  // ── REDUCED-MOTION: accessible static layout ───────────────────────────────
  if (reducedMotion) {
    return <StaticFallback services={services} stats={stats} />
  }

  // ── MAIN: Interactive 3D Laundry Factory Hero Page ─────────────────────────
  return (
    <div className="relative min-h-screen bg-hero text-hero-foreground">
      <HeroFactory services={services} stats={stats} />
    </div>
  )
}

// ── STATIC FALLBACK (prefers-reduced-motion) ──────────────────────────────────
function StaticFallback({ services, stats }) {
  return (
    <main className="min-h-screen bg-hero text-hero-foreground selection:bg-hero-accent selection:text-hero p-6 md:p-16">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center py-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-hero-accent/30 bg-hero-accent/10 px-4 py-1 text-xs uppercase tracking-widest text-hero-accent mb-6">
          Next-Gen Fabric Care
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight">
          From dirty bag to doorstep,{' '}
          <span className="text-hero-accent">on autopilot.</span>
        </h1>
        <p className="mt-6 max-w-xl text-hero-foreground/70 text-base md:text-lg leading-relaxed">
          Schedule pickups, track every load through washing, drying, ironing and packing,
          and receive spotless garments on delivery — all from one intelligent dashboard.
        </p>

        <a
          href="/orders/new"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-hero-accent px-8 py-4 font-display font-bold text-hero hover:opacity-90 transition"
        >
          Book a pickup →
        </a>

        {/* Services summary */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {services?.map((svc) => (
            <div key={svc.service_id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <h2 className="font-display text-xl font-bold text-hero-accent">{svc.service_name}</h2>
              <p className="mt-2 text-sm text-hero-foreground/60">{svc.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-12 border-t border-white/10 pt-10 w-full">
          <div>
            <div className="font-display text-3xl font-bold text-white">{(stats?.delivered || 12840).toLocaleString()}+</div>
            <div className="text-xs uppercase tracking-wider text-hero-foreground/50 mt-1 font-mono">Orders Delivered</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-white">{(stats?.customers || 3200).toLocaleString()}+</div>
            <div className="text-xs uppercase tracking-wider text-hero-foreground/50 mt-1 font-mono">Happy Customers</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-hero-accent">{stats?.pending || 47}</div>
            <div className="text-xs uppercase tracking-wider text-hero-foreground/50 mt-1 font-mono">Active Loads</div>
          </div>
        </div>
      </div>
    </main>
  )
}
