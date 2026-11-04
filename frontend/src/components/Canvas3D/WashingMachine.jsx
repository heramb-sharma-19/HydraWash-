// ─────────────────────────────────────────────────────────────────────────────
// src/components/Canvas3D/WashingMachine.jsx
// High-fidelity procedural 3D washing machine inspired by MRITECH Dribbble design
// Features:
//   - Dark luxury titanium/navy metallic finish with subtle chamfers
//   - Multi-layer glass door with chrome bevels & glowing emissive LED ring
//   - Internal illuminated drum with tumbling clothes fragments
//   - Sleek OLED status display & illuminated touch dials
//   - Responsive chapter poses tailored for the split hero layout
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

export default function WashingMachine({ chapter, chapterProgress, mouseRef, isMobile }) {
  const groupRef   = useRef()
  const drumRef    = useRef()
  const doorRef    = useRef()
  const idleAngle  = useRef(0)
  const ringRef    = useRef()

  // Target positions & rotations per chapter
  // Chapter 0 (Hero): offset to the right on desktop to balance left typography
  const heroX = isMobile ? 0 : 1.25
  const heroRotY = isMobile ? 0 : -0.32

  const targetPositionsX = [heroX, -0.6, -0.7, 0, -1.8, 0]
  const targetPositionsY = [0.05, 0.15, 0.1, 0, -0.2, -0.4]
  const targetPositionsZ = [0, 0.4, 0.2, 0.1, -1.2, -2.2]

  const targetRotationsY = [heroRotY, 0.45, -0.35, 0.05, -0.15, 0]
  const targetRotationsX = [0.06, 0.08, -0.05, 0, 0.02, 0]

  // Spin speed of drum varies per cycle
  const targetSpinSpeed = [0.004, 0.025, 0.045, 0.01, 0.004, 0.002][chapter] ?? 0.004

  // Glowing ring color per chapter
  const ringColors = ['#22D3EE', '#00F0FF', '#F59E0B', '#C8D8E8', '#22D3EE', '#22D3EE']
  const ringIntensities = [2.2, 3.5, 3.8, 2.0, 1.8, 2.0]

  // Fabric tumbling particles inside drum
  const clothPieces = useMemo(() => {
    const colors = ['#22D3EE', '#38BDF8', '#F59E0B', '#FFFFFF', '#60A5FA']
    return Array.from({ length: 6 }, (_, i) => ({
      color: colors[i % colors.length],
      radius: 0.28 + Math.random() * 0.12,
      angle: (i / 6) * Math.PI * 2,
      scale: [0.18 + Math.random() * 0.1, 0.12 + Math.random() * 0.08, 0.04],
      speed: 0.8 + Math.random() * 0.4,
    }))
  }, [])

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !drumRef.current) return

    const tX = targetPositionsX[chapter] ?? 0
    const tY = targetPositionsY[chapter] ?? 0
    const tZ = targetPositionsZ[chapter] ?? 0
    const rY = targetRotationsY[chapter] ?? 0
    const rX = targetRotationsX[chapter] ?? 0

    // ── Mouse parallax (subtle reaction in hero) ─────────────────────────
    let mouseOffsetX = 0
    let mouseOffsetY = 0
    if (mouseRef?.current && chapter === 0 && !isMobile) {
      mouseOffsetX = mouseRef.current.x * 0.18
      mouseOffsetY = mouseRef.current.y * 0.12
    }

    // Smooth lerp transformations
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, tX + mouseOffsetX, 0.05)
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, tZ, 0.05)

    // Gentle floating idle bob
    idleAngle.current += delta * 1.2
    const idleY = Math.sin(idleAngle.current) * 0.05
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, tY + idleY + mouseOffsetY, 0.05)

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rY + (mouseOffsetX * 0.4), 0.05)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rX + (-mouseOffsetY * 0.3), 0.05)

    // ── Drum spin ────────────────────────────────────────────────────────
    drumRef.current.rotation.z += targetSpinSpeed

    // ── Door swing (open in Wash & Dry, closed in Hero, Iron, CTA) ────────
    if (doorRef.current) {
      const targetDoorAngle = chapter === 1 || chapter === 2 ? -Math.PI * 0.48 : 0
      doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, targetDoorAngle, 0.06)
    }

    // ── LED Halo ring color transition ───────────────────────────────────
    if (ringRef.current) {
      ringRef.current.color.lerp(new THREE.Color(ringColors[chapter] ?? '#22D3EE'), 0.06)
      ringRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        ringRef.current.emissiveIntensity,
        ringIntensities[chapter] ?? 2,
        0.06
      )
    }
  })

  // Machine body styling
  const bodyBaseColor = '#0B162C'
  const accentMetal = '#1A3258'

  return (
    <group ref={groupRef} position={[heroX, 0.05, 0]}>
      {/* ── Main Chassis (deep navy metallic finish) ───────────────────── */}
      <RoundedBox args={[2.08, 2.45, 1.95]} radius={0.16} smoothness={5}>
        <meshStandardMaterial
          color={bodyBaseColor}
          roughness={0.28}
          metalness={0.78}
          envMapIntensity={1.4}
        />
      </RoundedBox>

      {/* ── Front Face Chamfer Trim (High-end bezel) ──────────────────── */}
      <RoundedBox args={[1.98, 2.35, 0.05]} radius={0.12} position={[0, 0, 0.98]} smoothness={4}>
        <meshStandardMaterial
          color="#060E1E"
          roughness={0.2}
          metalness={0.88}
        />
      </RoundedBox>

      {/* ── Top Dashboard Panel ───────────────────────────────────────── */}
      <group position={[0, 1.34, 0]}>
        <RoundedBox args={[2.04, 0.28, 1.9]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color="#071224" roughness={0.3} metalness={0.8} />
        </RoundedBox>

        {/* OLED status display */}
        <RoundedBox args={[0.76, 0.16, 0.02]} radius={0.04} position={[0, 0, 0.99]}>
          <meshStandardMaterial
            color="#040914"
            emissive="#00F0FF"
            emissiveIntensity={0.3}
            roughness={0.1}
          />
        </RoundedBox>

        {/* Digital cycle text strip / time remaining */}
        <mesh position={[0, 0, 1.005]}>
          <planeGeometry args={[0.45, 0.08]} />
          <meshBasicMaterial color="#22D3EE" opacity={0.85} transparent />
        </mesh>

        {/* Left Rotary Dial with Knurled Bezel */}
        <group position={[-0.68, 0, 0.98]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.06, 32]} />
            <meshStandardMaterial color="#22D3EE" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.035]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.015, 0.07, 0.01]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Right Mode Button */}
        <group position={[0.68, 0, 0.98]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.05, 32]} />
            <meshStandardMaterial color="#1E3A6E" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Glowing power dot */}
          <mesh position={[0, 0, 0.03]}>
            <circleGeometry args={[0.022, 16]} />
            <meshBasicMaterial color="#22D3EE" />
          </mesh>
        </group>
      </group>

      {/* ── Porthole Outer Bezel (Multi-Layer Luxury Rim) ─────────────── */}
      {/* Outer Dark Chrome Frame */}
      <mesh position={[0, 0.08, 0.99]}>
        <torusGeometry args={[0.74, 0.07, 24, 80]} />
        <meshStandardMaterial
          color="#162E52"
          metalness={0.95}
          roughness={0.15}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* Radiant Cyan / Amber Halo Neon Light Ring */}
      <mesh position={[0, 0.08, 1.01]}>
        <torusGeometry args={[0.66, 0.02, 16, 80]} />
        <meshStandardMaterial
          ref={ringRef}
          color="#22D3EE"
          emissive="#22D3EE"
          emissiveIntensity={2.5}
          roughness={0.1}
        />
      </mesh>

      {/* Polished Inner Chrome Accent Ring */}
      <mesh position={[0, 0.08, 1.02]}>
        <torusGeometry args={[0.63, 0.015, 16, 80]} />
        <meshStandardMaterial color="#A5F3FC" metalness={1.0} roughness={0.08} />
      </mesh>

      {/* ── Internal Drum & Tumbling Clothes ──────────────────────────── */}
      <group position={[0, 0.08, 0.72]}>
        {/* Spinning drum cage */}
        <group ref={drumRef}>
          <mesh>
            <cylinderGeometry args={[0.58, 0.58, 0.44, 48, 1, true]} />
            <meshStandardMaterial
              color="#0E2448"
              side={THREE.BackSide}
              roughness={0.4}
              metalness={0.65}
            />
          </mesh>

          {/* Drum Perforations and Rib Baffles */}
          {[0, 120, 240].map((deg, i) => (
            <group key={i} rotation={[0, 0, (deg * Math.PI) / 180]}>
              <mesh position={[0, 0.46, 0]}>
                <boxGeometry args={[0.06, 0.12, 0.38]} />
                <meshStandardMaterial color="#22D3EE" metalness={0.7} roughness={0.3} />
              </mesh>
            </group>
          ))}

          {/* Clothes Fragments Swirling Inside Drum */}
          {clothPieces.map((piece, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(piece.angle) * piece.radius,
                Math.sin(piece.angle) * piece.radius,
                (Math.sin(i) * 0.1),
              ]}
              rotation={[i * 0.4, i * 0.8, i * 0.3]}
              scale={piece.scale}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color={piece.color}
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>
          ))}
        </group>

        {/* Ambient interior drum light */}
        <pointLight position={[0, 0.2, 0.1]} intensity={1.5} color="#22D3EE" distance={1.8} />
      </group>

      {/* ── Curved Porthole Glass (Tinted with Specular Gleam) ────────── */}
      <mesh position={[0, 0.08, 1.03]}>
        <circleGeometry args={[0.62, 64]} />
        <meshPhysicalMaterial
          color="#061A3A"
          transparent
          opacity={0.62}
          roughness={0.04}
          metalness={0.1}
          transmission={0.4}
          thickness={0.2}
          reflectivity={0.9}
        />
      </mesh>

      {/* Dynamic Glass Specular Flare */}
      <mesh position={[-0.2, 0.26, 1.04]}>
        <circleGeometry args={[0.22, 32]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0.14}
        />
      </mesh>

      {/* ── Operable Door Unit ────────────────────────────────────────── */}
      <group ref={doorRef} position={[-0.64, 0.08, 1.02]}>
        <group position={[0.64, 0, 0]}>
          <mesh>
            <ringGeometry args={[0.61, 0.73, 64]} />
            <meshStandardMaterial color="#0A1C38" roughness={0.25} metalness={0.7} />
          </mesh>
          {/* Futuristic Handle Grip */}
          <group position={[-0.08, 0, 0.03]}>
            <mesh>
              <capsuleGeometry args={[0.03, 0.24, 8, 16]} />
              <meshStandardMaterial
                color="#22D3EE"
                metalness={0.9}
                roughness={0.15}
                emissive="#22D3EE"
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* ── Bottom Service / Lint Flap ────────────────────────────────── */}
      <RoundedBox args={[2.04, 0.24, 1.9]} radius={0.06} position={[0, -1.32, 0]} smoothness={4}>
        <meshStandardMaterial color="#060F1E" roughness={0.45} metalness={0.6} />
      </RoundedBox>

      {/* Bottom Service Port / Filter Knob */}
      <mesh position={[0.62, -1.32, 0.98]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 24]} />
        <meshStandardMaterial color="#1E3A6E" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* ── Base Feet (Damped rubber & chrome pads) ───────────────────── */}
      {[[-0.72, -0.2], [0.72, -0.2], [-0.72, 0.6], [0.72, 0.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, -1.26, z]}>
          <cylinderGeometry args={[0.1, 0.12, 0.1, 24]} />
          <meshStandardMaterial color="#040914" roughness={0.8} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}
