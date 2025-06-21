import React, { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Custom shader material for mind-blowing background effects
const FluidShaderMaterial = shaderMaterial(
  // Uniforms
  {
    time: 0,
    resolution: new THREE.Vector2(),
    mouse: new THREE.Vector2(),
    colorA: new THREE.Color('#001122'),
    colorB: new THREE.Color('#ff0066'),
    colorC: new THREE.Color('#00ff88'),
    noiseScale: 1.5,
    timeScale: 0.3,
    distortion: 0.5,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      
      vec3 pos = position;
      
      // Wave distortion
      float wave = sin(position.x * 2.0 + time * 2.0) * 0.1;
      pos.z += wave;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 mouse;
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform vec3 colorC;
    uniform float noiseScale;
    uniform float timeScale;
    uniform float distortion;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
              
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    // Fractal Brownian Motion
    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for (int i = 0; i < 6; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      
      return value;
    }
    
    void main() {
      vec2 st = vUv;
      vec2 mouseInfluence = (mouse - 0.5) * 2.0;
      
      // Create flowing noise patterns
      vec3 noisePos = vec3(st * noiseScale, time * timeScale);
      noisePos.xy += mouseInfluence * distortion;
      
      float noise1 = fbm(noisePos);
      float noise2 = fbm(noisePos + vec3(100.0, 100.0, 0.0));
      float noise3 = fbm(noisePos + vec3(200.0, 200.0, 0.0));
      
      // Create color gradients
      vec3 color = mix(colorA, colorB, noise1);
      color = mix(color, colorC, noise2 * 0.5);
      
      // Add iridescent effect
      float iridescence = sin(noise3 * 10.0 + time * 2.0) * 0.5 + 0.5;
      color += vec3(iridescence * 0.1, iridescence * 0.05, iridescence * 0.15);
      
      // Vignette effect
      float vignette = smoothstep(1.5, 0.5, length(st - 0.5));
      color *= vignette;
      
      // Output
      gl_FragColor = vec4(color, 1.0);
    }
  `
)

// Extend the material for use in JSX
extend({ FluidShaderMaterial })

function ShaderBackground() {
  const meshRef = useRef()
  const materialRef = useRef()
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime
      materialRef.current.uniforms.mouse.value = state.mouse
      materialRef.current.uniforms.resolution.value.set(
        state.size.width,
        state.size.height
      )
    }
  })
  
  return (
    <mesh ref={meshRef} scale={[10, 10, 1]} position={[0, 0, -5]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <fluidShaderMaterial
        ref={materialRef}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  )
}

export default ShaderBackground