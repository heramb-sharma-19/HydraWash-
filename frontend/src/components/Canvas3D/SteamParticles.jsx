// ─────────────────────────────────────────────────────────────────────────────
// src/components/Canvas3D/SteamParticles.jsx
// Rising steam effect – active in chapter 3 (Iron)
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STEAM_COUNT = 30

export default function SteamParticles({ visible }) {
  const meshRef = useRef()

  const data = useMemo(() =>
    Array.from({ length: STEAM_COUNT }, () => ({
      pos   : new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1,
      ),
      vel   : new THREE.Vector3(
        (Math.random() - 0.5) * 0.004,
        Math.random() * 0.012 + 0.005,
        0,
      ),
      phase : Math.random() * Math.PI * 2,
      scale : Math.random() * 0.18 + 0.06,
    }))
  , [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()

    const targetOpacity = visible ? 0.45 : 0
    meshRef.current.material.opacity = THREE.MathUtils.lerp(
      meshRef.current.material.opacity, targetOpacity, 0.05
    )

    data.forEach((p, i) => {
      p.pos.addScaledVector(p.vel, 1)
      p.pos.x += Math.sin(t * 0.8 + p.phase) * 0.004

      // Grow scale as steam rises
      const s = p.scale * (1 + p.pos.y * 0.3)

      if (p.pos.y > 3) {
        p.pos.set(
          (Math.random() - 0.5) * 2,
          -0.5,
          (Math.random() - 0.5) * 1,
        )
        p.scale = Math.random() * 0.18 + 0.06
      }

      dummy.position.copy(p.pos)
      dummy.scale.setScalar(Math.max(0.01, s))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, STEAM_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#e8f0ff"
        transparent
        opacity={0}
        roughness={1}
        depthWrite={false}
      />
    </instancedMesh>
  )
}

