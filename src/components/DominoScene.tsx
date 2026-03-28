"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
// Emerald primary: #10b981 → RGB normalized
const ACCENT_RGB: [number, number, number] = [0.063, 0.725, 0.506];

const tileVertexShader = `
  varying vec2 vScreenPos;
  varying vec3 vNormal;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vScreenPos = gl_Position.xy / gl_Position.w;
    vNormal = normalMatrix * normal;
  }
`;

const tileFragmentShader = `
  uniform vec2 uMouse;
  uniform vec3 uAccent;
  uniform float uRadius;
  varying vec2 vScreenPos;
  varying vec3 vNormal;
  void main() {
    float dist = distance(vScreenPos, uMouse);
    float strength = 1.0 - smoothstep(0.0, uRadius, dist);
    vec3 base = vec3(0.5, 0.5, 0.5);
    float baseAlpha = 0.12;
    vec3 color = mix(base, uAccent, strength);
    float alpha = mix(baseAlpha, 0.9, strength);
    gl_FragColor = vec4(color, alpha);
  }
`;

function MouseTracker({
  mouse,
}: {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  useFrame((state) => {
    mouse.current.x = state.pointer.x;
    mouse.current.y = state.pointer.y;
  });
  return null;
}

function DominoDot({
  position,
  accent,
}: {
  position: [number, number, number];
  accent: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const scale =
      1 + Math.sin(t * 2 + position[0] * 5 + position[1] * 3) * 0.05;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        color={new THREE.Color(...accent)}
        emissive={new THREE.Color(...accent)}
        emissiveIntensity={0.3}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

function DotPattern({
  value,
  offsetY,
  accent,
  white,
}: {
  value: number;
  offsetY: number;
  accent: [number, number, number];
  white?: boolean;
}) {
  const color: [number, number, number] = white ? [0.85, 0.85, 0.85] : accent;
  const s = 0.32;

  const layouts: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [
      [-s, s],
      [s, -s],
    ],
    3: [
      [-s, s],
      [0, 0],
      [s, -s],
    ],
    4: [
      [-s, s],
      [s, s],
      [-s, -s],
      [s, -s],
    ],
    5: [
      [-s, s],
      [s, s],
      [0, 0],
      [-s, -s],
      [s, -s],
    ],
    6: [
      [-s, s],
      [s, s],
      [-s, 0],
      [s, 0],
      [-s, -s],
      [s, -s],
    ],
  };

  const dots = layouts[value] || [];

  return (
    <group position={[0, offsetY, 0.14]}>
      {dots.map(([x, y], i) => (
        <DominoDot key={i} position={[x, y, 0]} accent={color} />
      ))}
    </group>
  );
}

function DominoTile3D({
  mouse,
  hovered,
  accent,
}: {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  hovered: boolean;
  accent: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const tileRef = useRef<THREE.Mesh>(null);

  const uniforms = useRef({
    uMouse: { value: new THREE.Vector2(0, 0) },
    uAccent: { value: new THREE.Vector3(...accent) },
    uRadius: { value: 1.0 },
  });

  const wireGeo = useMemo(() => {
    return new THREE.BoxGeometry(1.4, 2.6, 0.25, 8, 14, 2);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const targetRotY = mouse.current.x * 0.3;
    const targetRotX = mouse.current.y * -0.2;

    groupRef.current.rotation.y +=
      (targetRotY - 0.5 - groupRef.current.rotation.y) * 0.03;
    groupRef.current.rotation.x +=
      (targetRotX - 0.3 - groupRef.current.rotation.x) * 0.03;
    groupRef.current.rotation.z +=
      (0.15 - groupRef.current.rotation.z) * 0.03;

    groupRef.current.position.y = Math.sin(t * 0.8) * 0.08;

    if (hovered && Math.random() > 0.95) {
      groupRef.current.rotation.z += (Math.random() - 0.5) * 0.03;
    }

    uniforms.current.uMouse.value.set(mouse.current.x, mouse.current.y);
    uniforms.current.uAccent.value.set(...accent);
  });

  return (
    <group ref={groupRef}>
      <mesh ref={tileRef}>
        <boxGeometry args={[1.4, 2.6, 0.25, 1, 1, 1]} />
        <meshStandardMaterial
          color="#080808"
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh geometry={wireGeo}>
        <shaderMaterial
          vertexShader={tileVertexShader}
          fragmentShader={tileFragmentShader}
          uniforms={uniforms.current}
          wireframe
          transparent
        />
      </mesh>

      <mesh position={[0, 0, 0.13]}>
        <planeGeometry args={[1.2, 0.02]} />
        <meshBasicMaterial
          color={new THREE.Color(...accent)}
          transparent
          opacity={0.5}
        />
      </mesh>

      <DotPattern value={5} offsetY={0.65} accent={accent} />
      <DotPattern value={4} offsetY={-0.65} accent={accent} white />

      <mesh>
        <boxGeometry args={[1.44, 2.64, 0.29]} />
        <meshBasicMaterial
          color={new THREE.Color(...accent)}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function FloatingParticles({
  count = 300,
  mouse,
}: {
  count?: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 3;
      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);
      vel[i3] = (Math.random() - 0.5) * 0.001;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.001;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.001;
    }
    return [pos, vel];
  }, [count]);

  const bufferAttr = useMemo(
    () => new THREE.BufferAttribute(positions, 3),
    [positions]
  );

  useFrame(() => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    for (let i = 0; i < count * 3; i++) {
      pos[i] += velocities[i];
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += 0.0003 + mouse.current.x * 0.0005;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <primitive object={bufferAttr} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#ffffff"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

function OrbitalRing({
  radius,
  opacity,
  speed,
  mouse,
}: {
  radius: number;
  opacity: number;
  speed: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime;
    ringRef.current.rotation.x =
      Math.PI / 2 + Math.sin(t * speed) * 0.3 + mouse.current.y * 0.2;
    ringRef.current.rotation.z = t * speed * 0.5 + mouse.current.x * 0.1;
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.003, 16, 100]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={opacity} />
    </mesh>
  );
}

function Scene({ accent }: { accent: [number, number, number] }) {
  const mouse = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <MouseTracker mouse={mouse} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <directionalLight position={[-3, -2, 4]} intensity={0.2} />
      <group
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh>
          <boxGeometry args={[2, 3, 0.5]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <DominoTile3D mouse={mouse} hovered={hovered} accent={accent} />
      </group>
      <FloatingParticles mouse={mouse} />
      <OrbitalRing radius={2.8} opacity={0.05} speed={0.25} mouse={mouse} />
      <OrbitalRing radius={3.4} opacity={0.03} speed={-0.18} mouse={mouse} />
    </>
  );
}

export default function DominoScene() {
  const accent = ACCENT_RGB;

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene accent={accent} />
      </Canvas>
    </div>
  );
}
