"use client"

import React from "react"

import { useRef, useState, useEffect, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html, Environment } from "@react-three/drei"
import { Vector3, type Intersection, type Object3D } from "three"
import type { ThreeEvent } from "@react-three/fiber"
import * as THREE from "three"

interface LatLng {
  lat: number
  lng: number
}

interface SimulationParameters {
  r0: number
  incubationPeriod?: number
  mortalityRate?: number
  transmissionMethod?: string
}

interface MitigationMeasures {
  travelRestrictions: boolean
  socialDistancing: boolean
  maskUsage: boolean
  vaccination: number
}

interface InfectionLocation {
  position: Vector3
  day: number
  intensity: number
  radius: number
}

function latLngToVector3(lat: number, lng: number, radius: number): Vector3 {
  const validLat = typeof lat === "number" ? lat : 0
  const validLng = typeof lng === "number" ? lng : 0
  const validRadius = typeof radius === "number" ? radius : 1

  const phi = (90 - validLat) * (Math.PI / 180)
  const theta = (validLng + 180) * (Math.PI / 180)

  const x = -(validRadius * Math.sin(phi) * Math.cos(theta))
  const z = validRadius * Math.sin(phi) * Math.sin(theta)
  const y = validRadius * Math.cos(phi)

  return new Vector3(x, y, z)
}

function vector3ToLatLng(vector: Vector3, radius: number): LatLng {
  if (!vector || typeof vector.x !== "number" || typeof vector.y !== "number" || typeof vector.z !== "number") {
    return { lat: 0, lng: 0 }
  }

  const validRadius = typeof radius === "number" ? radius : 1

  const phi = Math.acos(vector.y / validRadius)
  const theta = Math.atan2(vector.z, -vector.x)

  const lat = 90 - phi * (180 / Math.PI)
  const lng = theta * (180 / Math.PI) - 180

  return { lat, lng }
}

// Separate Earth texture loading to prevent memory leaks
function EarthMesh({ onClick }: { onClick: (event: ThreeEvent<MouseEvent>) => void }) {
  const earthRef = useRef<THREE.Mesh>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true
    const textureLoader = new THREE.TextureLoader()
    textureLoader.setCrossOrigin("anonymous")

    // Create a simple blue sphere while loading
    if (earthRef.current) {
      earthRef.current.material = new THREE.MeshStandardMaterial({ color: "#1e88e5" })
    }

    textureLoader.load(
      // "/3d/texture_earth.jpg", // Updated path to match the standard assets path
      "/3d/final.jpg",
      (loadedTexture) => {
        if (!isMounted) {
          loadedTexture.dispose()
          return
        }

        // Optimize texture
        loadedTexture.minFilter = THREE.LinearFilter
        loadedTexture.generateMipmaps = false
        loadedTexture.anisotropy = 1

        setTexture(loadedTexture)
        setLoading(false)

        // Directly apply texture to the mesh if it exists
        if (earthRef.current) {
          const material = new THREE.MeshStandardMaterial({
            map: loadedTexture,
            roughness: 1.0,
            metalness: 0.0,
          })
          earthRef.current.material = material
        }
      },
      undefined,
      (err) => {
        console.error("Failed to load texture", err)
        setError(true)
        setLoading(false)
      },
    )

    return () => {
      isMounted = false
      if (texture) {
        texture.dispose()
      }
    }
  }, [])

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001
    }
  })

  return (
    <mesh ref={earthRef} onClick={onClick}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={texture ? undefined : "#1e88e5"} />
    </mesh>
  )
}

// Separate component for infection points to improve performance
function InfectionPoints({ infectionLocations }: { infectionLocations: InfectionLocation[] }) {
  // Limit the number of points rendered for performance
  const visibleLocations = infectionLocations.slice(0, 150)

  return (
    <>
      {visibleLocations.map((location, index) =>
        location && location.position ? (
          <mesh key={index} position={location.position}>
            <sphereGeometry args={[location.radius || 0.02, 6, 6]} />
            <meshBasicMaterial color="#ff3333" opacity={location.intensity || 0.5} transparent={true} />
          </mesh>
        ) : null,
      )}
    </>
  )
}

function Globe({
  startLocation = { lat: 0, lng: 0 },
  setStartLocation = () => {},
  parameters = {},
  simulationDay = 0,
  simulationRunning = false,
  mitigationMeasures = {},
}: {
  startLocation?: LatLng
  setStartLocation?: (loc: LatLng) => void
  parameters?: Partial<SimulationParameters>
  simulationDay: number
  simulationRunning: boolean
  mitigationMeasures?: Partial<MitigationMeasures>
}) {
  const [infectedLocations, setInfectedLocations] = useState<InfectionLocation[]>([])
  const { camera, raycaster, mouse } = useThree()
  const frameCount = useRef(0)

  const safeStartLocation = startLocation || { lat: 0, lng: 0 }
  const safeParams = parameters || { r0: 2.0 }
  const safeMeasures: MitigationMeasures = {
    travelRestrictions: mitigationMeasures?.travelRestrictions || false,
    socialDistancing: mitigationMeasures?.socialDistancing || false,
    maskUsage: mitigationMeasures?.maskUsage || false,
    vaccination: mitigationMeasures?.vaccination || 0,
  }

  const handleGlobeClick = (event: ThreeEvent<MouseEvent>) => {
    if (simulationRunning) return

    event.stopPropagation()
    raycaster.setFromCamera(mouse, camera)
    const intersects: Intersection<Object3D>[] = raycaster.intersectObject(event.object)

    if (intersects.length > 0 && intersects[0].point) {
      const point = intersects[0].point.clone()
      const latLng = vector3ToLatLng(point, 1)
      if (typeof setStartLocation === "function") {
        setStartLocation(latLng)
      }
    }
  }

  useEffect(() => {
    if (!simulationRunning) {
      setInfectedLocations([
        {
          position: latLngToVector3(safeStartLocation.lat, safeStartLocation.lng, 1.01),
          day: 0,
          intensity: 1,
          radius: 0.03,
        },
      ])
      return
    }

    if (simulationDay === 0) return

    // Limit the number of infection locations to prevent performance issues
    const MAX_INFECTION_POINTS = 150
    if (infectedLocations.length >= MAX_INFECTION_POINTS) {
      // Only keep the most recent points
      const sortedLocations = [...infectedLocations].sort((a, b) => b.day - a.day)
      setInfectedLocations(sortedLocations.slice(0, MAX_INFECTION_POINTS - 10))
      return
    }

    const newInfections: InfectionLocation[] = []
    const r0 = typeof safeParams.r0 === "number" ? safeParams.r0 : 2.0

    let effectiveR0 = r0
    if (safeMeasures.socialDistancing) effectiveR0 *= 0.7
    if (safeMeasures.maskUsage) effectiveR0 *= 0.8
    effectiveR0 *= 1 - safeMeasures.vaccination / 100

    const spreadFactor = effectiveR0 / 5
    const maxNewLocations = Math.min(
      Math.floor(infectedLocations.length * spreadFactor),
      3, // Reduced from 5 to 3 for better performance
    )
    const spreadDistance = safeMeasures.travelRestrictions ? 20 : 40

    for (let i = 0; i < maxNewLocations; i++) {
      if (infectedLocations.length === 0) break

      const sourceIndex = Math.floor(Math.random() * infectedLocations.length)
      const source = infectedLocations[sourceIndex]
      if (!source?.position) continue

      const sourceLatLng = vector3ToLatLng(source.position, 1.01)
      const newLat = sourceLatLng.lat + (Math.random() - 0.5) * spreadDistance
      const newLng = sourceLatLng.lng + (Math.random() - 0.5) * spreadDistance

      const clampedLat = Math.max(-85, Math.min(85, newLat))
      const clampedLng = Math.max(-180, Math.min(180, newLng))

      newInfections.push({
        position: latLngToVector3(clampedLat, clampedLng, 1.01),
        day: simulationDay,
        intensity: Math.random() * 0.8 + 0.2,
        radius: Math.random() * 0.02 + 0.01,
      })
    }

    setInfectedLocations((prev) => [...(Array.isArray(prev) ? prev : []), ...newInfections])
  }, [simulationDay, simulationRunning, safeParams.r0, safeStartLocation])

  // Use a less frequent update for non-critical animations
  useFrame(() => {
    frameCount.current += 1
    // Only update every 2nd frame to reduce GPU load
    if (frameCount.current % 2 !== 0) return
  })

  return (
    <>
      <EarthMesh onClick={handleGlobeClick} />

      {/*<mesh position={latLngToVector3(safeStartLocation.lat, safeStartLocation.lng, 1.02)}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color="#ff0000" />
        <Html distanceFactor={10}>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            Origin: {safeStartLocation.lat.toFixed(2)}, {safeStartLocation.lng.toFixed(2)}
          </div>
        </Html>
      </mesh>*/}

      {/* Render infection points as a separate component */}
      <InfectionPoints infectionLocations={infectedLocations} />

      {simulationRunning && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-black/80 text-white px-3 py-2 rounded text-sm">
            <div>Day: {simulationDay}</div>
            <div>Infections: {infectedLocations.length}</div>
            <div>R₀: {safeParams.r0?.toFixed(1) || "2.0"}</div>
          </div>
        </Html>
      )}
    </>
  )
}

// Fallback component for when WebGL is not available
function FallbackMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="text-center p-6">
        <h3 className="text-xl font-bold mb-2">3D Visualization Unavailable</h3>
        <p className="text-muted-foreground">{message}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}

export default function GlobeVisualization({
  startLocation = { lat: 30.5928, lng: 114.3055 },
  setStartLocation = () => {},
  parameters = { r0: 2.0 },
  simulationDay = 0,
  simulationRunning = false,
  mitigationMeasures = {
    travelRestrictions: false,
    socialDistancing: false,
    maskUsage: false,
    vaccination: 0,
  },
}: {
  startLocation?: LatLng
  setStartLocation?: (loc: LatLng) => void
  parameters?: Partial<SimulationParameters>
  simulationDay: number
  simulationRunning: boolean
  mitigationMeasures?: Partial<MitigationMeasures>
}) {
  const [webGLSupported, setWebGLSupported] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  // Check for WebGL support on mount
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")

      if (!gl) {
        setWebGLSupported(false)
        setErrorMessage("Your browser or device doesn't support WebGL, which is required for 3D visualizations.")
      }
    } catch (error) {
      setWebGLSupported(false)
      setErrorMessage("There was an error initializing WebGL.")
    }
  }, [])

  // Error boundary for the 3D component
  const handleError = (error: Error) => {
    console.error("Globe visualization error:", error)
    setHasError(true)
    setErrorMessage("There was an error rendering the 3D visualization. Please try refreshing the page.")
  }

  if (!webGLSupported || hasError) {
    return <FallbackMessage message={errorMessage} />
  }

  return (
    <div ref={containerRef} className="h-[600px]">
      <ErrorBoundary onError={handleError}>
        <Suspense fallback={<div className="h-full flex items-center justify-center">Loading 3D visualization...</div>}>
          <Canvas
            camera={{ position: [0, 0, 2.5], fov: 45 }}
            gl={{
              powerPreference: "default",
              antialias: false,
              preserveDrawingBuffer: true,
              alpha: false,
              depth: true,
              stencil: false,
              // Important: Set this to prevent context loss
              failIfMajorPerformanceCaveat: false,
            }}
            dpr={[0.8, 1.2]} // Reduced DPR for better performance
            frameloop="demand" // Only render when needed
            performance={{ min: 0.5 }} // Allow performance scaling
            onCreated={({ gl }) => {
              // Configure WebGL context for stability
              gl.setClearColor(new THREE.Color("#000000"), 0)

              // Disable depth testing for transparent objects
              gl.getContext().getExtension("WEBGL_lose_context")
            }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Environment preset="city" />

            <Globe
              startLocation={startLocation}
              setStartLocation={setStartLocation}
              parameters={parameters}
              simulationDay={simulationDay}
              simulationRunning={simulationRunning}
              mitigationMeasures={mitigationMeasures}
            />

            <OrbitControls
              enablePan={false}
              minDistance={1.5}
              maxDistance={4}
              enableDamping={false}
              rotateSpeed={0.5}
              zoomSpeed={0.7}
            />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

// Simple error boundary component
class ErrorBoundary extends React.Component<{
  children: React.ReactNode
  onError: (error: Error) => void
}> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

