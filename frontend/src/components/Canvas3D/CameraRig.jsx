// ─────────────────────────────────────────────────────────────────────────────
// src/components/Canvas3D/CameraRig.jsx
// Scroll-driven camera: lerps between 6 waypoints, one per chapter.
// Uses useFrame so movement is tied to the render loop, not to React state.
// ─────────────────────────────────────────────────────────────────────────────
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ── Camera waypoints per chapter ─────────────────────────────────────────────
//    Adjust these to fine-tune the cinematic path.
const WAYPOINTS = [
  { pos: [0, 0.4,  6.5], look: [0, 0.1, 0] },  // 0 Hero
  { pos: [2.5, 1,  3.8], look: [0, 0.2, 0] },  // 1 Wash  (closer, orbital)
  { pos: [-2, 1.5, 3.4], look: [0, 0.1, 0] },  // 2 Dry   (other side)
  { pos: [0.6, 0.2, 4],  look: [0, 0, 0]   },  // 3 Iron  (settle front)
  { pos: [0, 0,   7.5],  look: [0, 0, 0]   },  // 4 Deliver (pull back)
  { pos: [0, -0.3, 9],   look: [0, 0, 0]   },  // 5 CTA   (wide pull)
]

// Scene background colours per chapter (fog + background)
export const CHAPTER_BG = [
  '#060F1E', // Hero    – deep navy
  '#061828', // Wash    – fresh blue-black
  '#120A00', // Dry     – warm dark amber
  '#0E0E18', // Iron    – neutral cool
  '#060F1E', // Deliver – back to deep navy
  '#030810', // CTA     – near-black
]

export const CHAPTER_FOG = [
  '#0B2040', // Hero
  '#0d3a6a', // Wash
  '#3a1a00', // Dry
  '#1a1a2e', // Iron
  '#0B2040', // Deliver
  '#020510', // CTA
]

export default function CameraRig({ scrollRef, isMobile }) {
  const { camera } = useThree()
  const targetPos   = useRef(new THREE.Vector3(...WAYPOINTS[0].pos))
  const targetLook  = useRef(new THREE.Vector3(...WAYPOINTS[0].look))
  const lerpedLook  = useRef(new THREE.Vector3(...WAYPOINTS[0].look))

  useFrame(({ scene }) => {
    const raw     = scrollRef.current       // 0–1 global progress
    const chapter = Math.min(5, Math.floor(raw * 6))
    const chFrac  = (raw * 6) - chapter     // 0–1 within chapter

    // Interpolate between current and next waypoint
    const curr = WAYPOINTS[chapter]
    const next  = WAYPOINTS[Math.min(5, chapter + 1)]

    // Smooth eased factor (ease in-out cubic)
    const t = chFrac * chFrac * (3 - 2 * chFrac)

    targetPos.current.lerpVectors(
      new THREE.Vector3(...curr.pos),
      new THREE.Vector3(...next.pos),
      t,
    )
    targetLook.current.lerpVectors(
      new THREE.Vector3(...curr.look),
      new THREE.Vector3(...next.look),
      t,
    )

    // Mobile: less dramatic Y movement
    if (isMobile) targetPos.current.y *= 0.5

    // Damp camera towards target (scrub: 1 feel)
    camera.position.lerp(targetPos.current, 0.06)
    lerpedLook.current.lerp(targetLook.current, 0.06)
    camera.lookAt(lerpedLook.current)

    // Update scene background colour
    const bgHex = CHAPTER_BG[chapter]
    if (scene.background) {
      scene.background.set(bgHex)
    } else {
      scene.background = new THREE.Color(bgHex)
    }
    scene.fog = new THREE.FogExp2(CHAPTER_FOG[chapter], isMobile ? 0.06 : 0.04)
  })

  return null
}

