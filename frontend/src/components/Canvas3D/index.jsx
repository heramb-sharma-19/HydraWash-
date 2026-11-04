// ─────────────────────────────────────────────────────────────────────────────
// src/components/Canvas3D/index.jsx
// R3F Canvas wrapper: performance settings, Suspense, DPR cap
// ─────────────────────────────────────────────────────────────────────────────
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import Scene         from './Scene'
import LoadingScreen from '../LoadingScreen'

export default function Canvas3D({ scrollRef, chapter, chapterProgress, mouseRef, isMobile }) {
  return (
    <Canvas
      // ── Fixed full-screen canvas, sits behind all HTML ─────────────
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}

      // ── Cap pixel ratio at 2 for performance ────────────────────────
      dpr={[1, 2]}

      // ── Camera: fov 55, near/far tuned for our scene ─────────────────
      camera={{ fov: 55, near: 0.1, far: 200, position: [0, 0.4, 6.5] }}

      // ── Render config ────────────────────────────────────────────────
      gl={{
        antialias       : !isMobile,   // skip AA on mobile for perf
        powerPreference : 'high-performance',
        stencil         : false,
        depth           : true,
      }}

      // ── Shadows ──────────────────────────────────────────────────────
      shadows
      aria-hidden="true"   // canvas is purely decorative; text is in HTML
    >
      {/* Adaptive DPR: drops resolution when FPS < 60 */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      <Suspense fallback={<LoadingFallback />}>
        <Scene
          scrollRef={scrollRef}
          chapter={chapter}
          chapterProgress={chapterProgress}
          mouseRef={mouseRef}
          isMobile={isMobile}
        />
        <Preload all />
      </Suspense>
    </Canvas>
  )
}

/* A tiny Three.js-side fallback rendered while Suspense waits */
function LoadingFallback() {
  return null
}

