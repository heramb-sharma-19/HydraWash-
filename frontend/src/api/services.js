// ─────────────────────────────────────────────────────────────────────────────
// src/api/services.js  –  All fetch calls with fallback data
// ─────────────────────────────────────────────────────────────────────────────

/** Base URL – set VITE_API_URL in .env for production.
 *  The Vite dev-proxy rewrites /api → http://localhost:3000 during dev.
 *  ──> SWAP the fallback string to your deployed API URL for production.  */
const BASE = import.meta.env.VITE_API_URL || ''

// ── FALLBACK DATA (shown when API is offline) ────────────────────────────────
export const FALLBACK_SERVICES = [
  { service_id: 1, service_name: 'Wash', price: '₹49 / load',
    description: 'Deep-clean with eco-certified detergents.' },
  { service_id: 2, service_name: 'Dry',  price: '₹39 / load',
    description: 'Gentle tumble-dry, perfectly timed.' },
  { service_id: 3, service_name: 'Iron', price: '₹29 / load',
    description: 'Crisp, wrinkle-free – delivered to your door.' },
]

export const FALLBACK_STATS = {
  delivered: 12_840,
  customers: 3_200,
  pending:   47,
}

// ── Helpers ──────────────────────────────────────────────────────────────────
async function safeFetch(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── API functions ─────────────────────────────────────────────────────────────
/** GET /api/services → [{service_id, service_name, price, description}] */
export async function fetchServices() {
  try {
    return await safeFetch(`${BASE}/api/services`)
  } catch {
    return FALLBACK_SERVICES
  }
}

/** GET /api/stats → {delivered, customers, pending} */
export async function fetchStats() {
  try {
    return await safeFetch(`${BASE}/api/stats`)
  } catch {
    return FALLBACK_STATS
  }
}

/** GET /api/track/:id → {order_id, status, pickup_date} */
export async function fetchTrackOrder(id) {
  const res = await fetch(`${BASE}/api/track/${encodeURIComponent(id)}`, {
    signal: AbortSignal.timeout(5000),
  })
  if (res.status === 404) throw new Error('Order not found')
  if (!res.ok)            throw new Error(`HTTP ${res.status}`)
  return res.json()
}

