import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float liquidWave(vec2 p, float time, vec2 mouse) {
    vec2 coord = p * 1.7;
    
    // Autonomous liquid flow vectors
    coord.x += sin(coord.y * 3.0 + time * 0.45 + mouse.x * 2.2) * 0.28;
    coord.y += cos(coord.x * 2.6 - time * 0.38 + mouse.y * 2.2) * 0.24;

    float waveA = sin(coord.x * 4.2 + coord.y * 2.4 + time * 0.55);
    float waveB = cos(coord.y * 5.0 - coord.x * 3.2 - time * 0.4);
    float n = noise(coord * 2.2 + vec2(time * 0.15, time * 0.1));

    return smoothstep(-0.8, 0.85, waveA * 0.55 + waveB * 0.45 + n * 0.25);
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 st = (vUv - 0.5) * aspect;
    vec2 mouse = (uMouse - 0.5) * 0.35;

    float t = uTime * 0.22;
    float wave = liquidWave(st, t, mouse);

    // Deep dark silk liquid palette
    vec3 baseInk = vec3(0.068, 0.064, 0.058);
    vec3 waveDepth = vec3(0.125, 0.118, 0.108);
    vec3 silkHighlight = vec3(0.225, 0.215, 0.198);
    vec3 warmGlow = vec3(0.82, 0.36, 0.22);

    vec3 color = mix(baseInk, waveDepth, wave * 0.82);
    color = mix(color, silkHighlight, pow(wave, 2.4) * 0.36);
    color = mix(color, warmGlow, pow(wave, 4.2) * 0.08);

    // Radial vignette
    float dist = length(vUv - 0.5);
    float vignette = smoothstep(0.78, 0.2, dist);
    color *= (0.7 + vignette * 0.3);

    // Micro noise grain
    float grain = (hash(vUv * 950.0 + uTime * 8.0) - 0.5) * 0.024;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`

const FluidField = () => {
  const { size } = useThree()
  const mouseTargetRef = useRef<[number, number]>([0.5, 0.5])
  const mouseCurrentRef = useRef<[number, number]>([0.5, 0.5])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uResolution: { value: new THREE.Vector2(size.width, size.height) },
        },
        vertexShader,
        fragmentShader,
      }),
    []
  )

  useEffect(() => {
    material.uniforms.uResolution.value.set(size.width, size.height)
  }, [size, material])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseTargetRef.current = [e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight]
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    return () => material.dispose()
  }, [material])

  useFrame(({ clock }) => {
    mouseCurrentRef.current[0] += (mouseTargetRef.current[0] - mouseCurrentRef.current[0]) * 0.06
    mouseCurrentRef.current[1] += (mouseTargetRef.current[1] - mouseCurrentRef.current[1]) * 0.06

    material.uniforms.uTime.value = clock.getElapsedTime()
    material.uniforms.uMouse.value.set(mouseCurrentRef.current[0], mouseCurrentRef.current[1])
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

const StoryCanvas = () => (
  <div className="story-canvas" aria-hidden="true">
    <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance' }}>
      <FluidField />
    </Canvas>
  </div>
)

export default StoryCanvas




