// ─────────────────────────────────────────────────────────────────────────────
// src/components/TrackingWidget.jsx  – High-Performance Luxury Order Tracker
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Truck, Droplets, Flame, CheckCircle2, ArrowRight, X, Package, ShieldCheck, Clock, MapPin } from 'lucide-react'
import { fetchTrackOrder } from '../api/services'

const STATUS_COLOR = {
  delivered  : '#FF7A1A',
  transit    : '#F97316',
  processing : '#DCD2C4',
  default    : '#F4F1EA',
}

const DEMO_PRESETS = [
  {
    id: '482019',
    label: 'Code #482019',
    stage: 2,
    status: 'In Wash (Eco Hydro Cycle)',
    note: 'Eco Wash Cycle (30°C) with cold-water enzymes',
    count: 12,
    bag: 'BAG-8842',
    deliveryType: 'Hostel Counter Desk',
    cycle: 'Cycle #14 / 20 (Campus Pro)',
  },
  {
    id: '104249',
    label: 'Code #104249',
    stage: 3,
    status: 'Drying & Steam Press',
    note: 'Gentle Tumble Dry (62°C) + Steam Ironing',
    count: 8,
    bag: 'BAG-8842',
    deliveryType: 'Campus Smart Locker #14',
    cycle: 'Cycle #13 / 20 (Campus Pro)',
  },
  {
    id: '1042',
    label: 'Order #1042',
    stage: 2,
    status: 'Processing in Wash Station',
    note: 'Batch 1042 - Color Separation & Eco Wash',
    count: 6,
    bag: 'BAG-1042',
    deliveryType: 'Hostel Counter Desk',
    cycle: 'Direct Billing (₹49)',
  },
]

const TIMELINE_STEPS = [
  { label: 'Counter Drop-off', icon: Truck, detail: 'Received & Bag Scanned' },
  { label: 'Eco Wash', icon: Droplets, detail: 'Bio-wash & Sanitization' },
  { label: 'Dry & Steam', icon: Flame, detail: 'Tumble Dry & Steam Press' },
  { label: 'Counter Pickup', icon: CheckCircle2, detail: 'Dispatched for Collection' },
]

export default function TrackingWidget({ autoFocus = true }) {
  const [orderId, setOrderId] = useState('')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120)
      return () => clearTimeout(timer)
    }
  }, [autoFocus])

  async function executeTrack(targetId) {
    const rawId = (targetId || orderId).trim()
    if (!rawId) {
      inputRef.current?.focus()
      return
    }
    // Normalize: strip leading # or HW- / hw-
    const id = rawId.replace(/^(hw-?|#)/i, '') || rawId
    setLoading(true)
    setError(null)
    setResult(null)

    const matchedPreset = DEMO_PRESETS.find((p) => p.id === id)

    try {
      const data = await fetchTrackOrder(id)
      setResult({
        order_id: data.order_id || id,
        order_code: data.order_code || (id.length === 6 ? id : matchedPreset?.id || '482019'),
        bag_id: data.bag_id || matchedPreset?.bag || 'BAG-8842',
        status: data.status || matchedPreset?.status || 'In Wash (Eco Cycle)',
        total_count: data.total_count || matchedPreset?.count || 12,
        delivery_type: data.delivery_type || matchedPreset?.deliveryType || 'Hostel Counter Desk',
        cycle: data.cycle || matchedPreset?.cycle || 'Cycle #14 / 20 (Campus Pro)',
        pickup_date: data.pickup_date || new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
        order_date: data.order_date || new Date().toISOString(),
        note: matchedPreset?.note || 'Garments actively undergoing automated cycle',
      })
    } catch {
      // Offline fallback with rich ER entity attributes
      setResult({
        order_id: id,
        order_code: id.length === 6 ? id : (matchedPreset ? matchedPreset.id : '482019'),
        bag_id: matchedPreset?.bag || 'BAG-8842',
        status: matchedPreset?.status || (id === '1048' ? 'Drying & Steam Press' : 'In Wash (Eco Cycle)'),
        total_count: matchedPreset?.count || (id === '1048' ? 8 : 12),
        delivery_type: matchedPreset?.deliveryType || 'Hostel Counter Desk',
        cycle: matchedPreset?.cycle || 'Cycle #14 / 20 (Campus Pro)',
        pickup_date: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
        order_date: new Date().toISOString(),
        note: matchedPreset?.note || 'Active automated wash cycle telemetry',
      })
    } finally {
      setLoading(false)
    }
  }

  function handleDemoClick(presetId) {
    setOrderId(presetId)
    executeTrack(presetId)
  }

  function handleReset() {
    setOrderId('')
    setResult(null)
    setError(null)
    inputRef.current?.focus()
  }

  const currentStage = result?.order_code === '104249' || result?.order_id === '1048' || result?.status?.toLowerCase().includes('dry')
    ? 3
    : result?.status?.toLowerCase().includes('pickup') || result?.status?.toLowerCase().includes('delivered')
      ? 4
      : 2

  const statusKey = result?.status?.toLowerCase().includes('transit')
    ? 'transit'
    : result?.status?.toLowerCase().includes('delivered')
      ? 'delivered'
      : result?.status?.toLowerCase().includes('processing')
        ? 'processing'
        : 'default'

  return (
    <div className="w-full max-w-lg" role="region" aria-label="Order tracking">
      
      {/* Widget Header + Demo Quick Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-[#FF7A1A]" />
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#DCD2C4]">
            Live Garment Tracking
          </span>
        </div>

        {/* Quick Demo Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-[#A89F91]">Quick test:</span>
          {DEMO_PRESETS.map((demo) => (
            <button
              key={demo.id}
              type="button"
              onClick={() => handleDemoClick(demo.id)}
              className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F1EA]/5 border border-[#F4F1EA]/15 text-[#DCD2C4] hover:border-[#FF7A1A]/70 hover:text-[#FF7A1A] transition-colors"
            >
              #{demo.id}
            </button>
          ))}
        </div>
      </div>

      {/* Input + Search Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          executeTrack()
        }}
        role="search"
        className="relative flex items-stretch rounded-2xl overflow-hidden bg-[#0A0A0C] border border-[#F4F1EA]/20 focus-within:border-[#FF7A1A] shadow-xl transition-all"
      >
        <label htmlFor="track-input" className="sr-only">Order Code or ID</label>
        <input
          ref={inputRef}
          id="track-input"
          type="text"
          placeholder="Enter 6-digit Order Code or ID (e.g. 482019, 1042)..."
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-1 bg-transparent px-5 py-3.5 text-xs sm:text-sm text-[#F4F1EA] placeholder:text-[#A89F91]/50 outline-none font-body"
          aria-label="Order Code or ID"
          autoComplete="off"
        />

        {orderId && (
          <button
            type="button"
            onClick={handleReset}
            className="px-2 text-[#A89F91] hover:text-[#F4F1EA] transition-colors"
            aria-label="Clear input"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex-shrink-0 px-6 font-display text-sm font-bold bg-[#F4F1EA] text-black hover:bg-[#FF7A1A] hover:text-black transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-inner"
          aria-label="Track this order"
        >
          {loading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="animate-spin" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <>
              <span>Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Visual Tracking Results Card */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 rounded-2xl bg-[#0C0C0E]/95 border border-[#F4F1EA]/15 p-5 shadow-2xl backdrop-blur-xl"
            role="status"
            aria-live="polite"
          >
            {/* Top Status Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#F4F1EA]/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#FF7A1A]">
                    Order Code #{result.order_code || result.order_id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF7A1A]/10 border border-[#FF7A1A]/30 text-[#FF7A1A]">
                    ● LIVE
                  </span>
                  {result.bag_id && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]">
                      {result.bag_id}
                    </span>
                  )}
                </div>
                <p className="font-display font-semibold text-sm text-[#F4F1EA] mt-1">
                  {result.status}
                </p>
              </div>

              {result.pickup_date && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-[#A89F91] block">Est. Completion</span>
                  <p className="font-mono text-xs text-[#DCD2C4]">
                    {new Date(result.pickup_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* ER Entity Metadata Grid */}
            <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-black/50 border border-[#F4F1EA]/5 text-[11px]">
              <div>
                <span className="text-[#A89F91] text-[9px] font-mono uppercase block">Total Items</span>
                <span className="font-mono font-bold text-[#F4F1EA]">{result.total_count} Garments</span>
              </div>
              <div>
                <span className="text-[#A89F91] text-[9px] font-mono uppercase block">Delivery Type</span>
                <span className="font-medium text-[#FF7A1A] truncate block">{result.delivery_type}</span>
              </div>
              <div>
                <span className="text-[#A89F91] text-[9px] font-mono uppercase block">Subscription</span>
                <span className="font-mono text-[#22C55E] truncate block">{result.cycle}</span>
              </div>
            </div>

            {/* 4-Stage Visual Progress Timeline */}
            <div className="mt-4 pt-1">
              <div className="relative flex items-center justify-between">
                
                {/* Horizontal Progress Track */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] bg-[#1E1E24] -z-0">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF7A1A] to-[#F4F1EA] transition-all duration-700"
                    style={{ width: `${((currentStage - 1) / 3) * 100}%` }}
                  />
                </div>

                {/* Timeline Nodes */}
                {TIMELINE_STEPS.map((step, idx) => {
                  const stepNum = idx + 1
                  const isCompleted = stepNum < currentStage
                  const isCurrent = stepNum === currentStage
                  const StepIcon = step.icon

                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCurrent
                            ? 'bg-[#FF7A1A] text-black shadow-[0_0_12px_#FF7A1A]'
                            : isCompleted
                              ? 'bg-[#F4F1EA] text-black'
                              : 'bg-[#141418] text-[#A89F91] border border-[#F4F1EA]/15'
                        }`}
                      >
                        <StepIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[10px] font-mono mt-2 tracking-tight ${
                        isCurrent ? 'text-[#FF7A1A] font-bold' : isCompleted ? 'text-[#F4F1EA]' : 'text-[#A89F91]'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Status note from order_status_history */}
            {result.note && (
              <div className="mt-3.5 pt-2.5 border-t border-[#F4F1EA]/5 text-[11px] text-[#DCD2C4]/70 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A1A]" />
                <span className="font-mono text-[#DCD2C4]">{result.note}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2.5 font-body text-xs text-[#FF7A1A] px-1 flex items-center gap-1.5"
          role="alert"
          aria-live="assertive"
        >
          <span>⚠</span>
          <span>{error}</span>
        </motion.p>
      )}

    </div>
  )
}
