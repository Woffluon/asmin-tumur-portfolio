import { Suspense, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Text, Float, MeshTransmissionMaterial, Environment } from '@react-three/drei'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import * as THREE from 'three'
import '../styles/NotFound.css'

function ShardsModel() {
  const { viewport } = useThree()
  const gltf = useGLTF('/medias/shards.glb')

  const materialProps = useMemo(
    () => ({
      thickness: 0.275,
      ior: 1.8,
      chromaticAberration: 0.75,
      resolution: 300,
      roughness: 0,
      transmission: 0.99,
    }),
    []
  )

  const scale = useMemo(() => {
    return Math.min(viewport.width / 1.5, 1.2)
  }, [viewport.width])

  const fontSrc = '/fonts/ppneuemontreal-bold.otf'

  const textOption = {
    color: 'white',
    anchorX: 'center' as const,
    anchorY: 'middle' as const,
  }

  const meshes = useMemo(() => {
    const sceneGroup = gltf.nodes?.Scene as THREE.Group | undefined
    if (!sceneGroup?.children) return []
    return sceneGroup.children.filter(
      (child): child is THREE.Mesh => child instanceof THREE.Mesh
    )
  }, [gltf.nodes])

  return (
    <group scale={scale}>
      {meshes.map((mesh) => (
        <Float
          key={mesh.uuid || mesh.name}
          speed={1.5}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <mesh
            geometry={mesh.geometry}
            position={mesh.position}
            rotation={mesh.rotation}
            scale={mesh.scale}
          >
            <MeshTransmissionMaterial {...materialProps} />
          </mesh>
        </Float>
      ))}
      <group>
        <Text font={fontSrc} position={[0, 0.05, -0.1]} fontSize={0.35} {...textOption}>
          404
        </Text>
        <Text font={fontSrc} position={[0, -0.12, -0.1]} fontSize={0.035} {...textOption}>
          SAYFA BULUNAMADI — PAGE NOT FOUND
        </Text>
      </group>
    </group>
  )
}

function ResponsiveCanvas() {
  const { size } = useThree()
  const zoom = size.width < 768 ? 450 : 800

  return (
    <>
      <ShardsModel />
      <directionalLight intensity={3} position={[0, 0.1, 1]} />
      <Environment preset="city" />
      <group key={zoom} />
    </>
  )
}

useGLTF.preload('/medias/shards.glb')

export default function NotFound() {
  return (
    <div className="notfound-page-container">
      <Helmet>
        <title>404 — Sayfa Bulunamadı | Asmin Tumur</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="notfound-static-header" aria-live="polite">
        <h1 style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          404 Sayfa Bulunamadı
        </h1>
      </div>

      <Suspense fallback={<div className="notfound-fallback">404</div>}>
        <Canvas orthographic className="notfound-canvas" camera={{ position: [0, 0, 1], zoom: 800 }}>
          <ResponsiveCanvas />
        </Canvas>
      </Suspense>

      <div className="notfound-action-wrapper">
        <Link to="/" className="notfound-home-btn">
          Ana Sayfaya Dön ↗
        </Link>
      </div>
    </div>
  )
}
