// ─────────────────────────────────────────────────────────────────────────────
// src/components/Canvas3D/Scene.jsx
// The R3F scene graph: lights, model, particles
// ─────────────────────────────────────────────────────────────────────────────
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, ContactShadows, Stars } from '@react-three/drei'
import * as THREE from 'three'
import WashingMachine from './WashingMachine'
import Bubbles        from './Bubbles'
import SteamParticles from './SteamParticles'
import CameraRig      from './CameraRig'

export default function Scene({ scrollRef, chapter, chapterProgress, mouseRef, isMobile }) {
  const ambientRef  = useRef()
  const pointRef    = useRef()
  const rimLightRef = useRef()

  // Animate lights per chapter
  const AMBIENT_INTENSITIES = [0.7, 0.9, 0.6, 0.75, 0.7, 0.6]
  const POINT_COLOURS       = ['#22D3EE', '#00F0FF', '#F59E0B', '#C8D8E8', '#22D3EE', '#22D3EE']
  const RIM_COLOURS         = ['#0B3D91', '#0E4E9E', '#78350F', '#1E293B', '#0B3D91', '#0B3D91']

  useFrame(() => {
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        AMBIENT_INTENSITIES[chapter] ?? 0.7,
        0.05,
      )
    }
    if (pointRef.current) {
      pointRef.current.color.lerp(
        new THREE.Color(POINT_COLOURS[chapter] ?? '#22D3EE'),
        0.05,
      )
    }
    if (rimLightRef.current) {
      rimLightRef.current.color.lerp(
        new THREE.Color(RIM_COLOURS[chapter] ?? '#0B3D91'),
        0.05,
      )
    }
  })

  return (
    <>
      {/* ── Camera ────────────────────────────────────────────────────── */}
      <CameraRig scrollRef={scrollRef} isMobile={isMobile} />

      {/* ── Ambient & Directional Lighting ────────────────────────────── */}
      <ambientLight ref={ambientRef} intensity={0.7} />

      {/* Primary Key light – top-right */}
      <directionalLight
        position={[5, 7, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Cold Fill light – bottom-left */}
      <directionalLight position={[-5, -2, -2]} intensity={0.6} color="#0B2A58" />

      {/* Dynamic Key Accent light – adjusts colour by chapter */}
      <pointLight ref={pointRef} position={[1, 2.5, 4]} intensity={2.8} color="#22D3EE" />

      {/* Blue Rim light on back edge */}
      <pointLight ref={rimLightRef} position={[-3, 2, -3]} intensity={2.0} color="#0B3D91" />

      {/* ── Environment map (clean studio HDR) ────────────────────────── */}
      <Environment preset="city" />

      {/* ── Stars background (subtle cosmic depth) ────────────────────── */}
      <Stars
        radius={70}
        depth={40}
        count={isMobile ? 500 : 1000}
        factor={2.8}
        saturation={0.4}
        fade
        speed={0.4}
      />

      {/* ── Main 3D object ───────────────────────────────────────────── */}
      <WashingMachine
        chapter={chapter}
        chapterProgress={chapterProgress}
        mouseRef={mouseRef}
        isMobile={isMobile}
      />

      {/* ── Soap bubbles (chapter 1 – Wash) ──────────────────────────── */}
      <Bubbles visible={chapter === 1} />

      {/* ── Steam particles (chapter 3 – Iron) ───────────────────────── */}
      <SteamParticles visible={chapter === 3} />

      {/* ── High-resolution Ground shadow ─────────────────────────────── */}
      <ContactShadows
        position={[0, -1.6, 0]}
        scale={6}
        blur={2.4}
        opacity={0.65}
        far={2.5}
        color="#010612"
      />
    </>
  )
}
