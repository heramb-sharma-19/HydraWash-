// ─────────────────────────────────────────────────────────────────────────────
// src/components/Canvas3D/Bubbles.jsx
// Instanced soap-bubble particles – appear in chapter 1 (Wash)
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BUBBLE_COUNT = 40

export default function Bubbles({ visible }) {
  const meshRef  = useRef()
  const dataRef  = useRef([])   // per-bubble {pos, vel, phase}

  // Initialise bubble data
  useMemo(() => {
    dataRef.current = Array.from({ length: BUBBLE_COUNT }, () => ({
      pos   : new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3,
      ),
      vel   : new THREE.Vector3(
        (Math.random() - 0.5) * 0.006,
        Math.random() * 0.008 + 0.003,
        (Math.random() - 0.5) * 0.004,
      ),
      phase : Math.random() * Math.PI * 2,
      scale : Math.random() * 0.12 + 0.04,
    }))
  }, [])

  // Animate
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t       = clock.getElapsedTime()
    const opacity = visible ? 1 : 0
    meshRef.current.material.opacity = THREE.MathUtils.lerp(
      meshRef.current.material.opacity, opacity, 0.06
    )

    dataRef.current.forEach((b, i) => {
      b.pos.addScaledVector(b.vel, 1)
      b.pos.x += Math.sin(t * 0.5 + b.phase) * 0.003

      // Reset when off-screen
      if (b.pos.y > 3.5) {
        b.pos.set(
          (Math.random() - 0.5) * 5,
          -3.5,
          (Math.random() - 0.5) * 3,
        )
      }

      dummy.position.copy(b.pos)
      dummy.scale.setScalar(b.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, BUBBLE_COUNT]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshPhysicalMaterial
        color="#22D3EE"
        transparent
        opacity={0}
        roughness={0}
        metalness={0}
        transmission={0.9}
        thickness={0.3}
        side={THREE.FrontSide}
      />
    </instancedMesh>
  )
}

