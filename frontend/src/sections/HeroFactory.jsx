// ─────────────────────────────────────────────────────────────────────────────
// src/sections/HeroFactory.jsx
// Luxury Theme: Black, Orange, and Beige – Updated with official HydraWash typography logo
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  motion,
  useInView,
  AnimatePresence,
} from 'motion/react'
import {
  ArrowRight,
  Truck,
  Sparkles,
  Clock,
  Compass,
  Menu,
  X,
  ShieldCheck,
  Package,
  User,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Tag,
  LogOut,
  Check,
} from 'lucide-react'
import AgenticFactory3D from '../components/ui/agentic-factory-3d'
import TrackingWidget from '../components/TrackingWidget'
import PushpinTearFooter from '../components/ui/pushpin-tear-footer'
import { RandomLetterSwap } from '@/components/ui/random-letter-swap'

export default function HeroFactory({ services, stats }) {
  const [activeStation, setActiveStation] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null) // 'track' | 'complaint' | 'profile' | 'book' | 'register' | null
  const [scrolled, setScrolled] = useState(false)
  const [hoveredBar, setHoveredBar] = useState(null)

  // Complaint form state (ER: ACCOUNT_DELETION_REQUEST / Support, CUSTOMER, LAUNDRY_ORDER, RESIDENCE)
  const [complaintForm, setComplaintForm] = useState({
    orderCode: '482019',
    bagId: 'BAG-8842',
    residenceName: 'Hall of Residence 3 (Block B, Room 304)',
    issueType: 'Wash Quality / Stains not removed',
    description: '',
  })
  const [complaintSubmitting, setComplaintSubmitting] = useState(false)
  const [complaintSuccess, setComplaintSuccess] = useState(null)
  const [complaintError, setComplaintError] = useState(null)

  // Book a drop-off form state (ER: LAUNDRY_ORDER, ORDER_ITEM, SERVICE, ITEM, CUSTOMER_SUBSCRIPTION, DELIVERY)
  const [bookForm, setBookForm] = useState({
    serviceId: 1, // Wash & Fold
    bagId: 'BAG-8842',
    itemCategory: 'Daily Casuals & Tops',
    quantity: 8,
    paymentMode: 'subscription', // 'subscription' (1 cycle deduction) or 'direct' (pay per item)
    deliveryType: 'Hostel Counter Desk',
    timeSlot: 'Today 5:00 PM – 7:00 PM',
    roomNumber: 'Hall of Residence 3 (Block B, Room 304)',
    notes: '',
  })
  const [bookSubmitting, setBookSubmitting] = useState(false)
  const [bookSuccess, setBookSuccess] = useState(null)
  const [bookError, setBookError] = useState(null)

  // Register form state (ER: CUSTOMER, RESIDENCE, CAMPUS, SUBSCRIPTION_PLAN)
  const [registerForm, setRegisterForm] = useState({
    name: '',
    rollNumber: '',
    phone: '',
    email: '',
    campusName: 'Main Campus',
    residenceName: 'Hall of Residence 3 (Block B, Room 304)',
    planId: 'Campus Pro (20 cycles · 60 days)',
  })
  const [registerSubmitting, setRegisterSubmitting] = useState(false)
  const [registerSuccess, setRegisterSuccess] = useState(null)
  const [registerError, setRegisterError] = useState(null)

  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true, margin: '-60px 0px' })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Find closest link or button
      const target = e.target.closest('a, button')
      if (!target) return

      // CRITICAL: If click originated inside an active modal dialog, do NOT intercept!
      if (target.closest('[role="dialog"]')) return

      const href = (target.getAttribute('href') || '').toLowerCase().trim()
      const text = (target.innerText || target.textContent || '').toLowerCase().trim()

      if (
        href === '#tracking' ||
        href.includes('#tracking') ||
        text.includes('track id') ||
        text.includes('track load') ||
        text.includes('real-time tracker')
      ) {
        e.preventDefault()
        e.stopPropagation()
        setActiveModal('track')
        return
      }

      if (
        href === '#complaint' ||
        href.includes('#complaint') ||
        text === 'complaint' ||
        text.includes('file a complaint')
      ) {
        e.preventDefault()
        e.stopPropagation()
        setActiveModal('complaint')
        return
      }

      if (
        href === '/profile' ||
        href === '#profile' ||
        href.includes('#profile') ||
        text === 'profile' ||
        text.includes('resident profile')
      ) {
        e.preventDefault()
        e.stopPropagation()
        setActiveModal('profile')
        return
      }

      if (
        href === '/orders/new' ||
        href === '#book' ||
        href.includes('#book') ||
        text.includes('book a drop-off') ||
        text.includes('book pickup') ||
        text.includes('book a pickup')
      ) {
        e.preventDefault()
        e.stopPropagation()
        setActiveModal('book')
        return
      }

      if (
        href === '/register' ||
        href === '#register' ||
        href.includes('#register') ||
        text === 'register' ||
        text.includes('register student') ||
        text.includes('create student account')
      ) {
        e.preventDefault()
        e.stopPropagation()
        setActiveModal('register')
        return
      }
    }

    document.addEventListener('click', handleGlobalClick, true) // capture phase
    return () => document.removeEventListener('click', handleGlobalClick, true)
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null)
      }
    }
    if (activeModal) {
      window.addEventListener('keydown', onKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [activeModal])

  async function handleBookSubmit(e) {
    e.preventDefault()
    setBookError(null)
    setBookSubmitting(true)

    // Generate ER-compliant 6-digit order code (e.g. 482019)
    const generatedOrderCode = String(Math.floor(100000 + Math.random() * 900000))
    const selectedService = services?.find((s) => s.service_id === Number(bookForm.serviceId)) || { service_name: 'Wash & Fold', price: 49 }
    const unitPrice = typeof selectedService.price === 'string'
      ? parseFloat(selectedService.price.replace(/[^\d.]/g, '')) || 49
      : Number(selectedService.price) || 49

    const isSub = bookForm.paymentMode === 'subscription'
    const totalCost = isSub ? 0 : (Number(bookForm.quantity) || 1) * unitPrice

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: 1,
          order_code: generatedOrderCode,
          bag_id: bookForm.bagId,
          delivery_type: bookForm.deliveryType,
          items: [
            {
              service_id: Number(bookForm.serviceId),
              item_name: `${selectedService.service_name} (${bookForm.itemCategory})`,
              category: bookForm.itemCategory,
              quantity: Number(bookForm.quantity) || 1,
              unit_price: unitPrice,
            },
          ],
        }),
      })
      const data = await res.json().catch(() => null)
      setBookSuccess({
        orderCode: data?.order_code || generatedOrderCode,
        orderId: data?.order_id || generatedOrderCode,
        bagId: bookForm.bagId,
        serviceName: selectedService.service_name,
        itemCategory: bookForm.itemCategory,
        quantity: Number(bookForm.quantity) || 1,
        deliveryType: bookForm.deliveryType,
        deliveryDate: 'Tomorrow, 6:00 PM (Guaranteed 24h)',
        paymentMode: isSub ? '1 Cycle Deducted (5 Cycles Remaining)' : `₹${totalCost} (Pay at Counter / UPI)`,
        totalCost,
      })
    } catch {
      setBookSuccess({
        orderCode: generatedOrderCode,
        orderId: generatedOrderCode,
        bagId: bookForm.bagId,
        serviceName: selectedService.service_name,
        itemCategory: bookForm.itemCategory,
        quantity: Number(bookForm.quantity) || 1,
        deliveryType: bookForm.deliveryType,
        deliveryDate: 'Tomorrow, 6:00 PM (Guaranteed 24h)',
        paymentMode: isSub ? '1 Cycle Deducted (5 Cycles Remaining)' : `₹${totalCost} (Pay at Counter / UPI)`,
        totalCost,
      })
    } finally {
      setBookSubmitting(false)
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault()
    if (!registerForm.name.trim() || !registerForm.phone.trim() || !registerForm.residenceName.trim()) {
      setRegisterError('Please fill in your name, residence room, and contact phone.')
      return
    }
    setRegisterError(null)
    setRegisterSubmitting(true)

    const randomBagId = `BAG-${Math.floor(1000 + Math.random() * 9000)}`
    const randomCustId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email || `${registerForm.name.toLowerCase().replace(/\s+/g, '.')}@hostel.edu`,
          phone: registerForm.phone,
          campus_name: registerForm.campusName,
          residence_name: registerForm.residenceName,
          bag_id: randomBagId,
          plan: registerForm.planId,
        }),
      })
      const data = await res.json().catch(() => null)
      setRegisterSuccess({
        customerId: data?.customer_id || randomCustId,
        bagId: data?.bag_id || randomBagId,
        name: registerForm.name,
        campus: registerForm.campusName,
        residence: registerForm.residenceName,
        plan: registerForm.planId,
        accountStatus: 'Active · Counter Verified',
      })
    } catch {
      setRegisterSuccess({
        customerId: randomCustId,
        bagId: randomBagId,
        name: registerForm.name,
        campus: registerForm.campusName,
        residence: registerForm.residenceName,
        plan: registerForm.planId,
        accountStatus: 'Active · Counter Verified',
      })
    } finally {
      setRegisterSubmitting(false)
    }
  }

  async function handleComplaintSubmit(e) {
    e.preventDefault()
    if (!complaintForm.description.trim()) {
      setComplaintError('Please provide details describing your garment issue.')
      return
    }
    setComplaintError(null)
    setComplaintSubmitting(true)

    const randomTicket = `REQ-${Math.floor(10000 + Math.random() * 90000)}`

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_code: complaintForm.orderCode,
          bag_id: complaintForm.bagId,
          residence_name: complaintForm.residenceName,
          issue_type: complaintForm.issueType,
          description: complaintForm.description,
        }),
      })
      const data = await res.json().catch(() => null)
      setComplaintSuccess({
        ticketId: data?.ticket_id || randomTicket,
        orderCode: complaintForm.orderCode,
        bagId: complaintForm.bagId,
        residence: complaintForm.residenceName,
        processedBy: 'Hostel Ops Counter Staff #2',
        status: 'Pending Review',
        message: data?.message || 'Complaint logged into HydraWash database. Our counter supervisor will inspect your garments within 6 hours.',
      })
    } catch {
      setComplaintSuccess({
        ticketId: randomTicket,
        orderCode: complaintForm.orderCode,
        bagId: complaintForm.bagId,
        residence: complaintForm.residenceName,
        processedBy: 'Hostel Ops Counter Staff #2',
        status: 'Pending Review',
        message: 'Complaint ticket created. Show this reference at your Hostel Laundry Counter if inspection is urgent.',
      })
    } finally {
      setComplaintSubmitting(false)
    }
  }

  function handleFocusStation(stationId) {
    setActiveStation(stationId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (window.__machine?.focusStation) {
      window.__machine.focusStation(stationId)
    }
  }

  function handleResetCamera() {
    setActiveStation(null)
    if (window.__machine?.setCamera) {
      window.__machine.setCamera('overview')
    }
  }

  const weeklyVolume = [45, 68, 52, 85, 78, 92, 60]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen bg-black text-[#F4F1EA] font-body overflow-x-hidden selection:bg-[#FF7A1A] selection:text-black"
    >
      {/* ── Fixed 3D Machine Layer in Hero Viewport ──────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-screen z-0 pointer-events-auto bg-black">
        <AgenticFactory3D
          embed={true}
          height="100vh"
          onStation={(id) => setActiveStation(id)}
        />
        {/* Seamless Soft Gradient Blend into Landing Page Content */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-b from-transparent via-black/80 to-black pointer-events-none z-10" />
      </div>

      {/* ── Liquid Glass Floating Navigation Bar ─────────────────────────── */}
      <motion.div
        className="fixed top-5 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none flex flex-col items-center"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <header
          className={`pointer-events-auto w-full max-w-5xl rounded-full liquid-glass liquid-glass-sheen transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between ${
            scrolled ? 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]' : ''
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center group" aria-label="HydraWash Home">
              <img
                src="/logo.png"
                alt="HydraWash"
                className="h-9 sm:h-10 md:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_14px_rgba(255,122,26,0.35)]"
              />
            </a>
            
            {/* Live Facility Pulse Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F1EA]/5 border border-[#F4F1EA]/10 text-[10px] font-mono uppercase tracking-wider text-[#DCD2C4]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A1A] shadow-[0_0_8px_#FF7A1A] animate-pulse" />
              <span>Live · 24/7</span>
            </div>
          </div>

          {/* Centered Liquid Nav Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-black/40 border border-[#F4F1EA]/5">
            {[
              {
                id: 'complaint',
                label: 'Complaint',
              },
              {
                id: 'track',
                label: 'Track ID',
              },
              {
                id: 'profile',
                label: 'Profile',
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveModal(item.id)}
                className="px-3.5 sm:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium text-[#DCD2C4] hover:text-[#F4F1EA] hover:bg-[#F4F1EA]/10 transition-all duration-200 cursor-pointer"
              >
                <RandomLetterSwap
                  label={item.label}
                  staggerDuration={0.025}
                  transition={{ duration: 0.6, type: "spring" }}
                  onClick={() => setActiveModal(item.id)}
                />
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Register Secondary CTA */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                type="button"
                onClick={() => setActiveModal('register')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#F4F1EA]/20 bg-[#F4F1EA]/5 text-[#F4F1EA] text-xs lg:text-sm font-medium hover:border-[#FF7A1A]/60 hover:text-[#FF7A1A] hover:bg-[#FF7A1A]/10 transition-all cursor-pointer"
              >
                <span>Register</span>
              </button>
            </motion.div>

            {/* Book Pickup Primary CTA */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                type="button"
                onClick={() => setActiveModal('book')}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-[#F4F1EA] text-black text-xs sm:text-sm font-display font-bold hover:bg-[#FF7A1A] hover:text-black transition-all shadow-[0_2px_14px_rgba(255,122,26,0.3)] cursor-pointer"
              >
                <span>Book a drop-off</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full text-[#F4F1EA]/80 hover:bg-[#F4F1EA]/10 md:hidden transition-colors"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Liquid Glass Dropdown Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="pointer-events-auto mt-2 w-full max-w-5xl rounded-3xl liquid-glass p-5 space-y-4 md:hidden shadow-2xl border border-[#F4F1EA]/15"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F4F1EA]/10">
                <img src="/logo.png" alt="HydraWash" className="h-8 w-auto object-contain" />
                <span className="text-[10px] font-mono text-[#DCD2C4]/60 uppercase tracking-widest">Next-Gen Laundry</span>
              </div>
              <div className="flex flex-col space-y-2 font-medium text-sm">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); setActiveModal('complaint'); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[#DCD2C4] hover:text-[#FF7A1A] hover:bg-[#F4F1EA]/10 transition-colors cursor-pointer"
                >
                  Complaint
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); setActiveModal('track'); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[#DCD2C4] hover:text-[#FF7A1A] hover:bg-[#F4F1EA]/10 transition-colors cursor-pointer"
                >
                  Track ID
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); setActiveModal('profile'); }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl text-[#DCD2C4] hover:text-[#FF7A1A] hover:bg-[#F4F1EA]/10 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#FF7A1A]" />
                  <span>Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); setActiveModal('register'); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[#DCD2C4] hover:text-[#FF7A1A] hover:bg-[#F4F1EA]/10 transition-colors cursor-pointer"
                >
                  Register
                </button>
              </div>
              <div className="pt-3 border-t border-[#F4F1EA]/10">
                <button
                  type="button"
                  className="w-full text-center rounded-full bg-[#F4F1EA] py-3 text-sm font-bold text-black shadow-md hover:bg-[#FF7A1A] transition-colors cursor-pointer"
                  onClick={() => { setMenuOpen(false); setActiveModal('book'); }}
                >
                  Book a drop-off
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── SECTION 1: HERO SECTION ───────────────────────────────────────── */}
      <section className="pointer-events-none relative z-10 min-h-screen flex items-center pt-28 pb-16 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="w-full flex flex-col lg:flex-row items-center">
          
          {/* Left Text Block */}
          <div className="pointer-events-auto lg:w-1/2 max-w-2xl py-8">
            
            {/* Minimalist Beige Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#F4F1EA]/20 bg-[#F4F1EA]/5 text-[#F4F1EA] text-xs font-semibold tracking-wide backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A1A] shadow-[0_0_8px_#FF7A1A] animate-pulse" />
                Smart Laundry for Hostel Life
              </span>
            </motion.div>

            {/* Headline with Orange underline */}
            <motion.h1
              className="text-[2.6rem] sm:text-5xl lg:text-[3.8rem] font-display font-extrabold leading-[1.08] tracking-tight text-[#F4F1EA] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              From dirty bag to fresh clothes,{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 text-gradient-mono">
                  on autopilot.
                </span>
                <motion.span
                  className="absolute bottom-1.5 left-0 right-0 h-[3px] bg-[#FF7A1A] shadow-[0_0_10px_#FF7A1A] rounded-full -z-0"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={heroInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.65 }}
                />
              </span>
            </motion.h1>

            {/* Subtext in warm sand */}
            <motion.p
              className="text-base md:text-lg text-[#DCD2C4] leading-relaxed mb-8 max-w-lg"
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              Drop your laundry at the Laundry Counter, track every garment through washing, drying, ironing, and packaging, and collect spotless clothes in 24 hours.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
              initial={{ opacity: 0, y: 12 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <button
                  type="button"
                  onClick={() => setActiveModal('book')}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#F4F1EA] text-black text-sm font-display font-bold hover:bg-[#FF7A1A] hover:text-black transition-all shadow-[0_4px_20px_rgba(255,122,26,0.25)] cursor-pointer"
                >
                  Book a drop-off →
                </button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <button
                  type="button"
                  onClick={() => setActiveModal('register')}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#F4F1EA]/20 bg-[#F4F1EA]/5 text-[#F4F1EA] text-sm font-medium hover:border-[#FF7A1A]/60 hover:text-[#FF7A1A] hover:bg-[#FF7A1A]/10 backdrop-blur-md transition-all cursor-pointer"
                >
                  Register
                </button>
              </motion.div>
            </motion.div>

            {/* Key Value Perks / Trust strip with Orange Icons */}
            <motion.ul
              className="mt-8 flex flex-wrap gap-6 text-sm text-[#DCD2C4] font-medium"
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#FF7A1A]" />
                <span>Laundry Counter in your hostel</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#FF7A1A]" />
                <span>24h guaranteed turnaround</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FF7A1A]" />
                <span>Eco-certified wash</span>
              </li>
            </motion.ul>
          </div>

          {/* Right Spacer (Dedicated for the 3D Machine Model) */}
          <div className="lg:w-1/2 min-h-[460px] pointer-events-none" />

        </div>
      </section>

      {/* 3D Orbit Tip */}
      <aside aria-label="3D model control tip" className="pointer-events-none fixed bottom-5 right-6 md:right-10 z-20 hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 border border-[#F4F1EA]/15 backdrop-blur-md text-xs text-[#DCD2C4]">
        <Compass className="h-4 w-4 text-[#FF7A1A] animate-spin-slow" />
        <span>Drag to rotate · Hover stations to inspect</span>
      </aside>

      {/* ── SECTION 2: LIVE LAUNDRY OPERATIONS DASHBOARD ────────────────── */}
      <section id="dashboard" className="relative z-20 pt-16 pb-24 px-5 sm:px-8 max-w-7xl mx-auto bg-black">
        <div className="flex flex-col lg:flex-row items-center gap-14">
          
          {/* Operations Copy */}
          <div className="lg:w-1/2">
            <span className="text-xs uppercase font-mono tracking-widest text-[#FF7A1A] font-semibold">
              Real-Time Control
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#F4F1EA] mt-2 leading-tight">
              Live automated load tracking from bag to doorstep.
            </h2>
            <p className="mt-5 text-[#DCD2C4] leading-relaxed text-base md:text-lg">
              Our automated system coordinates sorting, temperature-controlled washing,
              gentle drying, and steam finishing load-by-load. Customers and operators
              receive live updates every step of the journey.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#0C0C0E] border border-[#F4F1EA]/10 shadow-lg">
                <div className="text-2xl font-display font-bold text-[#F4F1EA]">{(stats?.customers || 3200).toLocaleString()}+</div>
                <div className="text-xs text-[#A89F91] mt-1 uppercase font-mono">Verified Customers</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#0C0C0E] border border-[#F4F1EA]/10 shadow-lg">
                <div className="text-2xl font-display font-bold text-[#FF7A1A]">{(stats?.pending || 47)}</div>
                <div className="text-xs text-[#A89F91] mt-1 uppercase font-mono">Active Loads Today</div>
              </div>
            </div>
          </div>

          {/* Luxury Operations Card */}
          <div className="lg:w-1/2 w-full">
            <div className="rounded-2xl border border-[#F4F1EA]/15 bg-[#0A0A0D]/95 backdrop-blur-2xl p-6 shadow-2xl">
              
              {/* Window Bar Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F4F1EA]/10 mb-5">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                  <div className="w-3 h-3 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  <div className="w-3 h-3 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                </div>
                <span className="text-xs font-mono text-[#DCD2C4] tracking-wider">
                  HYDRAWASH // OPS MONITOR
                </span>
                <span className="text-[10px] text-[#FF7A1A] bg-[#FF7A1A]/10 border border-[#FF7A1A]/30 px-2 py-0.5 rounded-full font-mono">
                  ● ACTIVE
                </span>
              </div>

              {/* 3 Metrics Row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Active Loads', val: stats?.pending || '47', delta: 'Running', accent: true },
                  { label: 'Avg Turnaround', val: '22.4h', delta: 'Under 24h', accent: false },
                  { label: 'Satisfaction', val: '99.2%', delta: '4.9★', accent: false },
                ].map((m, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#131418] border border-[#F4F1EA]/10">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-[#A89F91] mb-1">{m.label}</p>
                    <p className={`text-xl font-display font-bold ${m.accent ? 'text-[#FF7A1A]' : 'text-[#F4F1EA]'}`}>{m.val}</p>
                    <p className="text-[11px] text-[#DCD2C4] font-medium mt-0.5">{m.delta}</p>
                  </div>
                ))}
              </div>

              {/* Live Batch Pipeline */}
              <div className="space-y-3 mb-6">
                <p className="text-xs font-semibold text-[#F4F1EA] uppercase tracking-wider font-mono">
                  Active Batches in Process
                </p>
                {[
                  { id: 'Batch #1042', cycle: 'Washing Cycle (30°C)', detail: 'Mixed Delicates · Bag #38', status: 'In Drum' },
                  { id: 'Batch #1048', cycle: 'Tumble Drying (Low Heat)', detail: 'Egyptian Cotton Linens', status: '15 min left' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-[#131418] border border-[#F4F1EA]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FF7A1A]/10 border border-[#FF7A1A]/20 flex items-center justify-center text-[#FF7A1A]">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#F4F1EA]">{b.id} — {b.cycle}</p>
                        <p className="text-[11px] text-[#A89F91]">{b.detail}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-[#FF7A1A] bg-[#FF7A1A]/10 border border-[#FF7A1A]/30 px-2.5 py-1 rounded-full">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Weekly Volume Bar Chart */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#F4F1EA] uppercase tracking-wider font-mono">
                    Weekly Garment Throughput
                  </p>
                  <span className="text-[10px] font-mono text-[#A89F91]">
                    {hoveredBar !== null
                      ? `${days[hoveredBar]}: ${weeklyVolume[hoveredBar] * 14} garments`
                      : 'Peak: Sat (1,288)'}
                  </span>
                </div>
                <div className="relative flex items-end gap-2 h-24 px-1 pt-2">
                  {weeklyVolume.map((val, idx) => {
                    const isHovered = hoveredBar === idx
                    const isPeak = val === 92

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
                        onMouseEnter={() => setHoveredBar(idx)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 relative ${
                            isHovered
                              ? 'bg-[#FF7A1A] shadow-[0_0_12px_#FF7A1A]'
                              : isPeak
                                ? 'bg-gradient-to-t from-[#FF7A1A] to-[#F4F1EA] shadow-[0_0_8px_rgba(255,122,26,0.3)]'
                                : 'bg-[#222126] group-hover:bg-[#FF7A1A]/70'
                          }`}
                          style={{ height: `${val}%` }}
                        />
                        <span className={`text-[9px] font-mono transition-colors ${
                          isHovered || isPeak ? 'text-[#FF7A1A] font-bold' : 'text-[#A89F91]'
                        }`}>
                          {days[idx]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS ───────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-20 py-20 px-5 sm:px-8 max-w-7xl mx-auto border-t border-[#F4F1EA]/10 bg-black">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-mono tracking-widest text-[#FF7A1A] font-semibold">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#F4F1EA] mt-2">
            How HydraWash works.
          </h2>
          <p className="mt-4 text-[#DCD2C4] text-base md:text-lg">
            Effortless fabric care delivered directly to your front door.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Schedule Online', desc: 'Choose your desired service, date, and pickup time window in under 60 seconds.' },
            { step: '02', title: 'Laundry Counter Drop-off', desc: 'Hand over your laundry bag directly at your hostel Laundry Counter.' },
            { step: '03', title: 'Smart Cleaning', desc: 'Clothes are inspected, sorted, washed with eco-detergents, dried, and steam pressed.' },
            { step: '04', title: 'Next-Day Return', desc: 'Fresh, crisp garments are returned within 24 hours, ready to wear.' },
          ].map((s, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#F4F1EA]/10 bg-[#0C0C0E] p-6 shadow-md hover:border-[#FF7A1A]/40 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.8)] transition-all duration-300 group"
            >
              <span className="text-3xl font-display font-bold text-[#FF7A1A]/40 group-hover:text-[#FF7A1A] transition-colors">
                {s.step}
              </span>
              <h3 className="text-lg font-display font-bold text-[#F4F1EA] mt-3 group-hover:text-[#FF7A1A] transition-colors">
                {s.title}
              </h3>
              <p className="text-xs text-[#DCD2C4] mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5: CERTIFICATIONS & TRUST BADGES ──────────────────────── */}
      <section className="relative z-20 py-12 px-5 sm:px-8 border-t border-[#F4F1EA]/10 bg-black">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-mono font-medium text-[#A89F91] uppercase tracking-widest mb-6">
            Certified Fabric Care Standards & Facility Safety
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              'Woolmark Garment Certified',
              'Oeko-Tex 100 Eco-Detergents',
              '24-Hour Delivery Guarantee',
              'Laundry Counter Drop-off',
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C0C0E] border border-[#F4F1EA]/10 text-xs font-medium text-[#DCD2C4] hover:border-[#FF7A1A]/40 hover:text-[#F4F1EA] transition-all duration-200 shadow-sm cursor-default"
              >
                <ShieldCheck className="w-4 h-4 text-[#FF7A1A]" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: PUSHPIN TEAR FOOTER ───────────────────────────────── */}
      <section className="relative z-20 w-full overflow-hidden border-t border-[#F4F1EA]/10 bg-black">
        <PushpinTearFooter
          brand="HydraWash."
          name="HydraWash Care"
          logoHref="#"
          logo={
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="HydraWash"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_14px_rgba(255,122,26,0.4)]"
              />
            </div>
          }
          sheet="#09090B"
          paper="#FF7A1A"
          sheetInk="#F4F1EA"
          paperInk="#000000"
          seed={11}
          height="100svh"
          email="support@hydrawash.in"
          newsletter={{
            label: "Receive weekly pickup perks & route expansions",
            placeholder: "your@email.com",
          }}
          status={{ label: "facility operational · 24/7" }}
          mark="HW / 2026"
          timeZone="Asia/Kolkata"
          timeLabel="IST"
          socials={[
            { icon: "x", label: "X / Twitter", href: "#" },
            { icon: "ig", label: "Instagram", href: "#" },
            { icon: "linkedin", label: "LinkedIn", href: "#" },
            { icon: "github", label: "GitHub", href: "#" },
          ]}
          columns={[
            {
              title: "care cycles",
              links: [
                { label: "Deep Wash Cycle", href: "#how-it-works" },
                { label: "Tumble Dry Cycle", href: "#how-it-works" },
                { label: "Steam Press Finish", href: "#how-it-works" },
                { label: "Garment Pack & Seal", href: "#how-it-works" },
              ],
              cta: { label: "book pickup.", href: "/orders/new" },
            },
            {
              title: "operations",
              links: [
                { label: "Live Dashboard", href: "#dashboard" },
                { label: "4-Stage Journey", href: "#how-it-works" },
                { label: "Real-time Tracker", href: "#tracking" },
                { label: "Eco-Safety Guarantee", href: "#" },
              ],
              cta: { label: "track load.", href: "#tracking" },
            },
          ]}
          sideLinks={[
            { icon: "shield", label: "privacy policy", href: "#" },
            { icon: "doc", label: "terms & care standards", href: "#" },
          ]}
          chat={{ label: "chat concierge" }}
          copyright="© 2026 HydraWash Technologies. All rights reserved."
          credit="autonomous fabric care"
          handle={{ label: "@hydrawash.care", href: "#" }}
        />
      </section>

      {/* ── UNIFIED POPUP MODALS (PORTAL TO DOCUMENT BODY) ────────────────── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeModal && (
            <div className="fixed inset-0 z-[9999] overflow-y-auto overflow-x-hidden">
              {/* Backdrop */}
              <motion.div
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/85 backdrop-blur-md"
                onClick={() => {
                  setActiveModal(null)
                  setBookSuccess(null)
                  setBookError(null)
                  setRegisterSuccess(null)
                  setRegisterError(null)
                }}
              />

              {/* Centering Wrapper: pointer-events-none allows clicks on empty area to hit backdrop */}
              <div className="min-h-full flex items-center justify-center p-4 sm:p-6 relative z-10 pointer-events-none">
                {/* ── TRACK ID POPUP MODAL ─────────────────────────────────────── */}
                {activeModal === 'track' && (
                  <motion.div
                    key="modal-track"
                    initial={{ opacity: 0, scale: 0.94, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 20 }}
                    transition={{ type: "spring", damping: 26, stiffness: 320 }}
                    onClick={(e) => e.stopPropagation()}
                    className="pointer-events-auto relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#09090B] border border-[#F4F1EA]/15 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-6 sm:p-8 my-auto"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="tracking-modal-title"
                  >
              {/* Warm ambient orange halo */}
              <div
                className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#FF7A1A]/15 blur-3xl"
                aria-hidden="true"
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 z-30 p-2 rounded-full text-[#DCD2C4]/70 hover:text-[#F4F1EA] hover:bg-[#F4F1EA]/10 border border-[#F4F1EA]/10 bg-black/60 backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Close tracking popup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="mb-6 pr-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#FF7A1A]/30 bg-[#FF7A1A]/10 text-[#FF7A1A] text-[10px] font-mono uppercase tracking-widest mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A1A] shadow-[0_0_8px_#FF7A1A] animate-pulse" />
                  LAUNDRY_ORDER · REAL-TIME TELEMETRY
                </div>
                <h2 id="tracking-modal-title" className="text-2xl sm:text-3xl font-display font-extrabold text-[#F4F1EA] tracking-tight">
                  Track Your Laundry
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#DCD2C4]/70 leading-relaxed font-body">
                  Search by 6-digit order code (try <span className="text-[#FF7A1A] font-mono font-bold">#482019</span> or <span className="text-[#FF7A1A] font-mono font-bold">#104249</span>) or order ID (<span className="text-[#FF7A1A] font-mono font-bold">#1042</span>) to track garment status, laundry bag RFID, and counter delivery schedule.
                </p>
              </div>

              {/* Tracking Widget */}
              <div className="w-full flex justify-center">
                <TrackingWidget autoFocus={true} />
              </div>
            </motion.div>
          )}

          {/* ── COMPLAINT POPUP MODAL ────────────────────────────────────────── */}
          {activeModal === 'complaint' && (
            <motion.div
              key="modal-complaint"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#09090B] border border-[#F4F1EA]/15 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-6 sm:p-8 my-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="complaint-modal-title"
            >
              {/* Warm ambient orange halo */}
              <div
                className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#FF7A1A]/15 blur-3xl"
                aria-hidden="true"
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                  setComplaintSuccess(null)
                  setComplaintError(null)
                }}
                className="absolute top-5 right-5 z-30 p-2 rounded-full text-[#DCD2C4]/70 hover:text-[#F4F1EA] hover:bg-[#F4F1EA]/10 border border-[#F4F1EA]/10 bg-black/60 backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Close complaint popup"
              >
                <X className="w-5 h-5" />
              </button>

              {complaintSuccess ? (
                /* Success Confirmation State */
                <div className="py-4 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-mono uppercase tracking-widest mb-3">
                    Ticket Logged · Assigned to Staff
                  </span>
                  <h3 className="text-2xl font-display font-extrabold text-[#F4F1EA] mb-2">
                    Complaint Received
                  </h3>
                  <div className="my-3 px-4 py-2.5 rounded-2xl bg-black/60 border border-[#FF7A1A]/30 text-center w-full max-w-xs">
                    <span className="text-[11px] text-[#DCD2C4]/60 uppercase tracking-wider block">Ticket Reference (request_id)</span>
                    <span className="text-lg font-mono font-bold text-[#FF7A1A]">{complaintSuccess.ticketId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full max-w-xs text-[11px] mb-4 text-left p-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/10">
                    <div>
                      <span className="text-[#DCD2C4]/60 text-[10px] uppercase font-mono block">Order Code</span>
                      <span className="font-mono text-[#F4F1EA] font-semibold">#{complaintSuccess.orderCode}</span>
                    </div>
                    <div>
                      <span className="text-[#DCD2C4]/60 text-[10px] uppercase font-mono block">Bag RFID</span>
                      <span className="font-mono text-[#22C55E] font-semibold">{complaintSuccess.bagId}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-[#F4F1EA]/5">
                      <span className="text-[#DCD2C4]/60 text-[10px] uppercase font-mono block">Assigned Handler</span>
                      <span className="text-[#DCD2C4] font-medium">{complaintSuccess.processedBy}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#DCD2C4]/80 max-w-sm mb-6 leading-relaxed">
                    {complaintSuccess.message}
                  </p>
                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setComplaintSuccess(null)
                        setComplaintForm({
                          orderCode: '482019',
                          bagId: 'BAG-8842',
                          residenceName: 'Hall of Residence 3 (Block B, Room 304)',
                          issueType: 'Wash Quality / Stains not removed',
                          description: '',
                        })
                      }}
                      className="flex-1 py-3 rounded-full border border-[#F4F1EA]/20 bg-[#F4F1EA]/5 text-[#F4F1EA] text-xs font-semibold hover:border-[#FF7A1A]/40 transition cursor-pointer"
                    >
                      File Another
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null)
                        setComplaintSuccess(null)
                      }}
                      className="flex-1 py-3 rounded-full bg-[#F4F1EA] text-black text-xs font-display font-bold hover:bg-[#FF7A1A] transition shadow-md cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Complaint Form */
                <div>
                  <div className="mb-5 pr-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#FF7A1A]/30 bg-[#FF7A1A]/10 text-[#FF7A1A] text-[10px] font-mono uppercase tracking-widest mb-2.5">
                      <AlertCircle className="w-3 h-3" />
                      ACCOUNT_DELETION_REQUEST / SERVICE SUPPORT
                    </div>
                    <h2 id="complaint-modal-title" className="text-2xl font-display font-extrabold text-[#F4F1EA] tracking-tight">
                      File a Service Issue
                    </h2>
                    <p className="mt-1 text-xs text-[#DCD2C4]/70 leading-relaxed font-body">
                      Report wash quality, delays, missing articles, or submit an account query. Counter staff inspects and responds promptly.
                    </p>
                  </div>

                  {complaintError && (
                    <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{complaintError}</span>
                    </div>
                  )}

                  <form onSubmit={handleComplaintSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                          6-Digit Order Code (order_code)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 482019"
                          value={complaintForm.orderCode}
                          onChange={(e) => setComplaintForm({ ...complaintForm, orderCode: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs placeholder-[#DCD2C4]/40 focus:outline-none focus:border-[#FF7A1A] transition font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                          Student Bag ID (bag_id)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. BAG-8842"
                          value={complaintForm.bagId}
                          onChange={(e) => setComplaintForm({ ...complaintForm, bagId: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs placeholder-[#DCD2C4]/40 focus:outline-none focus:border-[#FF7A1A] transition font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                        Campus Residence (residence_id)
                      </label>
                      <select
                        value={complaintForm.residenceName}
                        onChange={(e) => setComplaintForm({ ...complaintForm, residenceName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs focus:outline-none focus:border-[#FF7A1A] transition cursor-pointer"
                      >
                        <option value="Hall of Residence 3 (Block B, Room 304)">Hall of Residence 3 (Block B, Room 304)</option>
                        <option value="Hall of Residence 1 (Block A, Room 112)">Hall of Residence 1 (Block A, Room 112)</option>
                        <option value="Hall of Residence 2 (Block C, Room 208)">Hall of Residence 2 (Block C, Room 208)</option>
                        <option value="Oak Hall Graduate Suites (Room 401)">Oak Hall Graduate Suites (Room 401)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                        Issue Reason (reason) *
                      </label>
                      <select
                        value={complaintForm.issueType}
                        onChange={(e) => setComplaintForm({ ...complaintForm, issueType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs focus:outline-none focus:border-[#FF7A1A] transition cursor-pointer"
                      >
                        <option value="Wash Quality / Stains not removed">Wash Quality / Stains not removed</option>
                        <option value="Missing Garment / Item Count Mismatch">Missing Garment / Item Count Mismatch</option>
                        <option value="Turnaround Delay (> 24 hours)">Turnaround Delay (&gt; 24 hours)</option>
                        <option value="Damaged Fabric or Button">Damaged Fabric or Button</option>
                        <option value="Locker / Counter Handover Issue">Locker / Counter Handover Issue</option>
                        <option value="Account Deletion or Data Erasure Request">Account Deletion or Data Erasure Request</option>
                        <option value="Other Service Concern">Other Service Concern</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                        Description & Details *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Detail which garments, drop-off counter time, or issue description..."
                        value={complaintForm.description}
                        onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs placeholder-[#DCD2C4]/40 focus:outline-none focus:border-[#FF7A1A] transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={complaintSubmitting}
                      className="w-full py-3 rounded-full bg-[#FF7A1A] hover:bg-[#ff8c38] text-black text-xs font-display font-bold shadow-[0_4px_20px_rgba(255,122,26,0.3)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {complaintSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Filing Ticket with Counter Desk...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Ticket to Counter Staff</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {/* ── PROFILE POPUP MODAL ───────────────────────────────────────────── */}
          {activeModal === 'profile' && (
            <motion.div
              key="modal-profile"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#09090B] border border-[#F4F1EA]/15 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-6 sm:p-8 my-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-modal-title"
            >
              {/* Warm halo */}
              <div
                className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#FF7A1A]/15 blur-3xl"
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 z-30 p-2 rounded-full text-[#DCD2C4]/70 hover:text-[#F4F1EA] hover:bg-[#F4F1EA]/10 border border-[#F4F1EA]/10 bg-black/60 backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Close profile popup"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5 pr-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#FF7A1A]/30 bg-[#FF7A1A]/10 text-[#FF7A1A] text-[10px] font-mono uppercase tracking-widest mb-2.5">
                  <User className="w-3 h-3" />
                  CUSTOMER · STUDENT RESIDENT RECORD
                </div>
                <h2 id="profile-modal-title" className="text-2xl font-display font-extrabold text-[#F4F1EA] tracking-tight">
                  Resident Profile
                </h2>
              </div>

              {/* Resident Identity Card */}
              <div className="p-4 rounded-2xl bg-black/60 border border-[#F4F1EA]/10 mb-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FF7A1A]/20 border border-[#FF7A1A]/40 flex items-center justify-center text-xl font-display font-bold text-[#FF7A1A]">
                  HS
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-display font-bold text-[#F4F1EA] truncate">Heramb Sharma</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-[#DCD2C4]/70 font-mono mt-0.5">customer_id: CUST-1042 · Roll: 2025BTECH041</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#FF7A1A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                    <span className="font-mono font-bold">Laundry Bag Tag: BAG-8842 (RFID Active)</span>
                  </div>
                </div>
              </div>

              {/* Residence & Contact info */}
              <div className="space-y-2 mb-4 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/5">
                  <div className="flex items-center gap-2 text-[#DCD2C4]/70">
                    <MapPin className="w-3.5 h-3.5 text-[#FF7A1A]" />
                    <span>Campus & Residence</span>
                  </div>
                  <span className="font-semibold text-[#F4F1EA]">Main Campus · Hall 3 (Block B, 304)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/5">
                  <div className="flex items-center gap-2 text-[#DCD2C4]/70">
                    <Phone className="w-3.5 h-3.5 text-[#FF7A1A]" />
                    <span>Phone</span>
                  </div>
                  <span className="font-mono text-[#F4F1EA]">+91 98765 43210</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/5">
                  <div className="flex items-center gap-2 text-[#DCD2C4]/70">
                    <Mail className="w-3.5 h-3.5 text-[#FF7A1A]" />
                    <span>Email</span>
                  </div>
                  <span className="font-mono text-[#F4F1EA]">heramb.sharma@hostel.edu</span>
                </div>
              </div>

              {/* CUSTOMER_SUBSCRIPTION & SUBSCRIPTION_PLAN card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#18181B] to-[#0E0E10] border border-[#FF7A1A]/30 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF7A1A]" />
                    <span className="text-xs font-display font-bold text-[#F4F1EA]">Campus Pro Subscription</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF7A1A]/15 border border-[#FF7A1A]/40 text-[#FF7A1A]">
                    6 Cycles Left
                  </span>
                </div>
                {/* Cycles Gauge */}
                <div className="w-full bg-black/60 rounded-full h-2 mb-2 overflow-hidden border border-[#F4F1EA]/10">
                  <div className="bg-[#FF7A1A] h-full rounded-full transition-all" style={{ width: '70%' }} />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#DCD2C4]/70">
                  <span>cycles_used: 14 / 20</span>
                  <span>valid: 01 Oct – 30 Nov 2026</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#F4F1EA]/10 flex items-center justify-between text-[10px] text-[#A89F91]">
                  <span>Last Payment: ₹899 (UPI)</span>
                  <span className="text-[#22C55E] font-mono">STATUS: SUCCESS</span>
                </div>
              </div>

              {/* Recent Orders History */}
              <div className="mb-5">
                <span className="text-[10px] uppercase font-mono text-[#DCD2C4]/60 tracking-wider block mb-2">
                  Recent Orders (LAUNDRY_ORDER)
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#FF7A1A] font-bold">#482019</span>
                      <span className="text-[#F4F1EA]">Eco Wash Cycle</span>
                      <span className="text-[10px] text-[#A89F91] font-mono">(12 items)</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF7A1A]/15 text-[#FF7A1A]">In Wash</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#DCD2C4] font-bold">#104249</span>
                      <span className="text-[#F4F1EA]">Steam Press & Iron</span>
                      <span className="text-[10px] text-[#A89F91] font-mono">(8 items)</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E]">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('track')}
                  className="flex-1 py-2.5 rounded-full border border-[#FF7A1A]/30 bg-[#FF7A1A]/10 text-[#FF7A1A] text-xs font-semibold hover:bg-[#FF7A1A]/20 transition cursor-pointer text-center"
                >
                  Track Active (#482019)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('book')}
                  className="flex-1 py-2.5 rounded-full bg-[#F4F1EA] text-black text-xs font-display font-bold hover:bg-[#FF7A1A] transition cursor-pointer text-center"
                >
                  Book New Drop-off
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('complaint')}
                  className="py-2.5 px-3 rounded-full border border-[#F4F1EA]/15 text-[#DCD2C4]/70 text-xs hover:text-[#F4F1EA] hover:border-[#F4F1EA]/30 transition cursor-pointer text-center"
                  title="File issue or account deletion request"
                >
                  Help
                </button>
              </div>
            </motion.div>
          )}

          {/* ── BOOK DROP-OFF POPUP MODAL ─────────────────────────────────────── */}
          {activeModal === 'book' && (
            <motion.div
              key="modal-book"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#09090B] border border-[#F4F1EA]/15 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-6 sm:p-8 my-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="book-modal-title"
            >
              <div
                className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#FF7A1A]/15 blur-3xl"
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                  setBookSuccess(null)
                  setBookError(null)
                }}
                className="absolute top-5 right-5 z-30 p-2 rounded-full text-[#DCD2C4]/70 hover:text-[#F4F1EA] hover:bg-[#F4F1EA]/10 border border-[#F4F1EA]/10 bg-black/60 backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Close booking popup"
              >
                <X className="w-5 h-5" />
              </button>

              {bookSuccess ? (
                <div className="py-4 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-mono uppercase tracking-widest mb-3">
                    LAUNDRY_ORDER RESERVED
                  </span>
                  <h3 className="text-2xl font-display font-extrabold text-[#F4F1EA] mb-2">
                    Order Code #{bookSuccess.orderCode}
                  </h3>
                  
                  {/* Order Details Grid */}
                  <div className="my-3 p-3.5 rounded-2xl bg-black/60 border border-[#FF7A1A]/30 text-left w-full max-w-sm space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F4F1EA]/10">
                      <span className="text-[#DCD2C4]/70">Laundry Bag Tag (bag_id)</span>
                      <span className="font-mono font-bold text-[#22C55E]">{bookSuccess.bagId}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#F4F1EA]/10">
                      <span className="text-[#DCD2C4]/70">Selected Care (SERVICE)</span>
                      <span className="font-medium text-[#F4F1EA]">{bookSuccess.serviceName}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#F4F1EA]/10">
                      <span className="text-[#DCD2C4]/70">Item Count & Category</span>
                      <span className="font-mono text-[#F4F1EA]">{bookSuccess.quantity} garments ({bookSuccess.itemCategory})</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#F4F1EA]/10">
                      <span className="text-[#DCD2C4]/70">Guaranteed Delivery</span>
                      <span className="font-medium text-[#FF7A1A]">{bookSuccess.deliveryDate}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[#DCD2C4]/70">Payment / Subscription</span>
                      <span className="font-mono font-bold text-[#FF7A1A]">{bookSuccess.paymentMode}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#DCD2C4]/80 max-w-sm mb-6 leading-relaxed">
                    Tag your laundry bag with <strong className="text-[#FF7A1A]">#{bookSuccess.orderCode}</strong> and drop it at your Hostel Laundry Counter desk.
                  </p>
                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setBookSuccess(null)
                        setActiveModal('track')
                      }}
                      className="flex-1 py-3 rounded-full border border-[#FF7A1A]/30 bg-[#FF7A1A]/10 text-[#FF7A1A] text-xs font-semibold hover:bg-[#FF7A1A]/20 transition cursor-pointer"
                    >
                      Track Order #{bookSuccess.orderCode}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null)
                        setBookSuccess(null)
                      }}
                      className="flex-1 py-3 rounded-full bg-[#F4F1EA] text-black text-xs font-display font-bold hover:bg-[#FF7A1A] transition shadow-md cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-5 pr-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#FF7A1A]/30 bg-[#FF7A1A]/10 text-[#FF7A1A] text-[10px] font-mono uppercase tracking-widest mb-2.5">
                      <ShoppingBag className="w-3 h-3" />
                      LAUNDRY_ORDER · 24-HOUR TURNAROUND
                    </div>
                    <h2 id="book-modal-title" className="text-2xl font-display font-extrabold text-[#F4F1EA] tracking-tight">
                      Book a Drop-off
                    </h2>
                    <p className="mt-1 text-xs text-[#DCD2C4]/70 leading-relaxed font-body">
                      Select your fabric care service and drop your laundry bag at your hostel counter desk.
                    </p>
                  </div>

                  {bookError && (
                    <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{bookError}</span>
                    </div>
                  )}

                  <form onSubmit={handleBookSubmit} className="space-y-3.5">
                    {/* Student Bag Identification */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-[#F4F1EA]/10 text-xs">
                      <div>
                        <span className="text-[#DCD2C4]/60 text-[10px] font-mono uppercase block">Allocated Laundry Bag (bag_id)</span>
                        <span className="font-mono font-bold text-[#22C55E]">{bookForm.bagId}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#DCD2C4]/60 text-[10px] font-mono uppercase block">Residence</span>
                        <span className="font-medium text-[#F4F1EA]">Hall 3 (Block B, 304)</span>
                      </div>
                    </div>

                    {/* Care Service Selection (SERVICE) */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                        Fabric Care Service (SERVICE) *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 1, name: 'Wash & Fold', price: '₹49 / load', desc: 'Eco bio-wash cycle' },
                          { id: 2, name: 'Tumble Dry & Fluff', price: '₹39 / load', desc: 'Gentle moisture extraction' },
                          { id: 3, name: 'Steam Press & Iron', price: '₹29 / load', desc: 'Wrinkle-free crisp finish' },
                          { id: 4, name: 'Express 12H Full Care', price: '₹99 / load', desc: 'Wash + Dry + Press priority' },
                        ].map((s) => (
                          <div
                            key={s.id}
                            onClick={() => setBookForm({ ...bookForm, serviceId: s.id })}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                              bookForm.serviceId === s.id
                                ? 'border-[#FF7A1A] bg-[#FF7A1A]/10 text-[#F4F1EA]'
                                : 'border-[#F4F1EA]/10 bg-[#141416] text-[#DCD2C4]/70 hover:border-[#F4F1EA]/30'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold">{s.name}</span>
                              <span className="font-mono text-[#FF7A1A] font-bold text-[11px]">{s.price}</span>
                            </div>
                            <span className="text-[10px] text-[#A89F91]">{s.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Item Category (ITEM) & Garment Count (total_count) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                          Garment Category (ITEM)
                        </label>
                        <select
                          value={bookForm.itemCategory}
                          onChange={(e) => setBookForm({ ...bookForm, itemCategory: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs focus:outline-none focus:border-[#FF7A1A] transition cursor-pointer"
                        >
                          <option value="Daily Casuals & Tops">Daily Casuals & Tops</option>
                          <option value="Trousers, Jeans & Formals">Trousers, Jeans & Formals</option>
                          <option value="Bedding, Linens & Towels">Bedding, Linens & Towels</option>
                          <option value="Delicates & Woolens">Delicates & Woolens</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                          Approx. Garments (total_count)
                        </label>
                        <div className="flex items-center bg-black/60 border border-[#F4F1EA]/15 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => setBookForm({ ...bookForm, quantity: Math.max(1, bookForm.quantity - 1) })}
                            className="w-8 h-8 rounded-lg bg-[#141416] text-[#F4F1EA] text-sm hover:bg-[#FF7A1A] hover:text-black transition cursor-pointer"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center font-mono font-bold text-sm text-[#F4F1EA]">
                            {bookForm.quantity} pcs
                          </span>
                          <button
                            type="button"
                            onClick={() => setBookForm({ ...bookForm, quantity: bookForm.quantity + 1 })}
                            className="w-8 h-8 rounded-lg bg-[#141416] text-[#F4F1EA] text-sm hover:bg-[#FF7A1A] hover:text-black transition cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delivery & Payment Mode (DELIVERY & CUSTOMER_SUBSCRIPTION) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                          Delivery Destination (DELIVERY)
                        </label>
                        <select
                          value={bookForm.deliveryType}
                          onChange={(e) => setBookForm({ ...bookForm, deliveryType: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs focus:outline-none focus:border-[#FF7A1A] transition cursor-pointer"
                        >
                          <option value="Hostel Counter Desk">Hostel Counter Desk</option>
                          <option value="Campus Smart Locker">Campus Smart Locker</option>
                          <option value="Hostel Room Drop">Hostel Room Drop</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                          Payment Mode (PAYMENT)
                        </label>
                        <select
                          value={bookForm.paymentMode}
                          onChange={(e) => setBookForm({ ...bookForm, paymentMode: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs focus:outline-none focus:border-[#FF7A1A] transition cursor-pointer"
                        >
                          <option value="subscription">Use Subscription (1 Cycle of 6 left) - ₹0</option>
                          <option value="direct">Direct Counter UPI / Cash</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                        Special Garment Instructions (remarks)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mild detergent only, cold wash shirts"
                        value={bookForm.notes}
                        onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs placeholder-[#DCD2C4]/40 focus:outline-none focus:border-[#FF7A1A] transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={bookSubmitting}
                      className="w-full py-3 rounded-full bg-[#FF7A1A] hover:bg-[#ff8c38] text-black text-xs font-display font-bold shadow-[0_4px_20px_rgba(255,122,26,0.3)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {bookSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Generating 6-Digit Order Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Drop-off & Generate 6-Digit Code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {/* ── REGISTER POPUP MODAL ─────────────────────────────────────────── */}
          {activeModal === 'register' && (
            <motion.div
              key="modal-register"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#09090B] border border-[#F4F1EA]/15 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-6 sm:p-8 my-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="register-modal-title"
            >
              <div
                className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#FF7A1A]/15 blur-3xl"
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                  setRegisterSuccess(null)
                  setRegisterError(null)
                }}
                className="absolute top-5 right-5 z-30 p-2 rounded-full text-[#DCD2C4]/70 hover:text-[#F4F1EA] hover:bg-[#F4F1EA]/10 border border-[#F4F1EA]/10 bg-black/60 backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Close registration popup"
              >
                <X className="w-5 h-5" />
              </button>

              {registerSuccess ? (
                <div className="py-4 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-mono uppercase tracking-widest mb-3">
                    CUSTOMER ACCOUNT ACTIVATED
                  </span>
                  <h3 className="text-2xl font-display font-extrabold text-[#F4F1EA] mb-2">
                    Welcome, {registerSuccess.name}!
                  </h3>
                  
                  {/* Allocation Card */}
                  <div className="my-3 p-3.5 rounded-2xl bg-black/60 border border-[#FF7A1A]/30 text-left w-full max-w-sm space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F4F1EA]/10">
                      <span className="text-[#DCD2C4]/70">Customer ID (PK)</span>
                      <span className="font-mono font-bold text-[#FF7A1A]">{registerSuccess.customerId}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#F4F1EA]/10">
                      <span className="text-[#DCD2C4]/70">Allocated Laundry Bag (bag_id)</span>
                      <span className="font-mono font-bold text-[#22C55E]">{registerSuccess.bagId} (RFID Active)</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#F4F1EA]/10">
                      <span className="text-[#DCD2C4]/70">Campus & Residence</span>
                      <span className="font-medium text-[#F4F1EA]">{registerSuccess.campus} · {registerSuccess.residence}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#F4F1EA]/10">
                      <span className="text-[#DCD2C4]/70">Subscription Plan</span>
                      <span className="font-medium text-[#FF7A1A]">{registerSuccess.plan}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[#DCD2C4]/70">Account Status</span>
                      <span className="font-mono font-bold text-[#22C55E]">{registerSuccess.accountStatus}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#DCD2C4]/80 max-w-sm mb-6 leading-relaxed">
                    Collect your provisioned RFID laundry bag ({registerSuccess.bagId}) from the Laundry Counter and start automated 24h laundry care.
                  </p>
                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterSuccess(null)
                        setActiveModal('book')
                      }}
                      className="flex-1 py-3 rounded-full bg-[#FF7A1A] text-black text-xs font-display font-bold hover:bg-[#ff8c38] transition shadow-md cursor-pointer"
                    >
                      Book First Drop-off →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null)
                        setRegisterSuccess(null)
                      }}
                      className="flex-1 py-3 rounded-full border border-[#F4F1EA]/20 bg-[#F4F1EA]/5 text-[#F4F1EA] text-xs font-semibold hover:border-[#FF7A1A]/40 transition cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-5 pr-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#FF7A1A]/30 bg-[#FF7A1A]/10 text-[#FF7A1A] text-[10px] font-mono uppercase tracking-widest mb-2.5">
                      <Sparkles className="w-3 h-3" />
                      CUSTOMER ONBOARDING · BAG ALLOCATION
                    </div>
                    <h2 id="register-modal-title" className="text-2xl font-display font-extrabold text-[#F4F1EA] tracking-tight">
                      Register Student Account
                    </h2>
                    <p className="mt-1 text-xs text-[#DCD2C4]/70 leading-relaxed font-body">
                      Sign up with your campus hostel credentials to receive a dedicated RFID laundry bag and active care plan.
                    </p>
                  </div>

                  {registerError && (
                    <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{registerError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                          Full Name (name) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Heramb Sharma"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs placeholder-[#DCD2C4]/40 focus:outline-none focus:border-[#FF7A1A] transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                          Student Roll / ID
                        </label>
                        <input
                          type="text"
                          placeholder="2025BTECH041"
                          value={registerForm.rollNumber}
                          onChange={(e) => setRegisterForm({ ...registerForm, rollNumber: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs placeholder-[#DCD2C4]/40 focus:outline-none focus:border-[#FF7A1A] transition font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                          Campus (CAMPUS entity)
                        </label>
                        <select
                          value={registerForm.campusName}
                          onChange={(e) => setRegisterForm({ ...registerForm, campusName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs focus:outline-none focus:border-[#FF7A1A] transition cursor-pointer"
                        >
                          <option value="Main Campus">Main Campus</option>
                          <option value="North Campus">North Campus</option>
                          <option value="Technology Park Campus">Technology Park Campus</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                          Hostel Residence (RESIDENCE) *
                        </label>
                        <select
                          value={registerForm.residenceName}
                          onChange={(e) => setRegisterForm({ ...registerForm, residenceName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs focus:outline-none focus:border-[#FF7A1A] transition cursor-pointer"
                        >
                          <option value="Hall of Residence 3 (Block B, Room 304)">Hall of Residence 3 (Block B, Room 304)</option>
                          <option value="Hall of Residence 1 (Block A, Room 112)">Hall of Residence 1 (Block A, Room 112)</option>
                          <option value="Hall of Residence 2 (Block C, Room 208)">Hall of Residence 2 (Block C, Room 208)</option>
                          <option value="Oak Hall Graduate Suites (Room 401)">Oak Hall Graduate Suites (Room 401)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                          Phone Number (phone) *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs placeholder-[#DCD2C4]/40 focus:outline-none focus:border-[#FF7A1A] transition font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                          Campus Email (email)
                        </label>
                        <input
                          type="email"
                          placeholder="heramb.sharma@hostel.edu"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs placeholder-[#DCD2C4]/40 focus:outline-none focus:border-[#FF7A1A] transition font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#DCD2C4]/70 mb-1.5">
                        Choose Subscription Plan (SUBSCRIPTION_PLAN)
                      </label>
                      <select
                        value={registerForm.planId}
                        onChange={(e) => setRegisterForm({ ...registerForm, planId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-[#F4F1EA]/15 text-[#F4F1EA] text-xs focus:outline-none focus:border-[#FF7A1A] transition cursor-pointer"
                      >
                        <option value="Campus Basic (10 cycles · ₹499 · 30 days)">Campus Basic (10 cycles · ₹499 · 30 days validity)</option>
                        <option value="Campus Pro (20 cycles · ₹899 · 60 days)">Campus Pro (20 cycles · ₹899 · 60 days validity) [Recommended]</option>
                        <option value="Semester Unlimited (50 cycles · ₹1,999 · 120 days)">Semester Unlimited (50 cycles · ₹1,999 · 120 days validity)</option>
                      </select>
                    </div>

                    {/* Notice of bag RFID allocation */}
                    <div className="p-2.5 rounded-xl bg-black/50 border border-[#22C55E]/20 text-[11px] flex items-center gap-2 text-[#DCD2C4]/80">
                      <ShieldCheck className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                      <span>Every registered resident receives a dedicated RFID laundry bag (BAG-XXXX) tied to their room.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={registerSubmitting}
                      className="w-full py-3 rounded-full bg-[#FF7A1A] hover:bg-[#ff8c38] text-black text-xs font-display font-bold shadow-[0_4px_20px_rgba(255,122,26,0.3)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                    >
                      {registerSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Allocating Bag & Activating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Student Account & Allocate Bag</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  )
}
