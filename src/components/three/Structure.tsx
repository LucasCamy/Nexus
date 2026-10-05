import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { TIER_GEOMETRY } from "../../data/topology";
import { circleSegments } from "./geometry";

const SIGNAL = new THREE.Color("#4FD8EB");

/** NEXUS core: faceted kernel inside three gyroscope rings. */
export function CoreRings({ animate }: { animate: boolean }) {
  const rings = useRef<THREE.Group>(null);
  const kernel = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!animate || !rings.current) return;
    const [a, b, c] = rings.current.children;
    a.rotation.z += delta * 0.18;
    b.rotation.x += delta * 0.12;
    c.rotation.y += delta * 0.22;
    if (kernel.current) kernel.current.rotation.y -= delta * 0.1;
  });

  return (
    <group>
      <mesh ref={kernel}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color="#0c2830"
          emissive={SIGNAL}
          emissiveIntensity={0.28}
          roughness={0.35}
          metalness={0.4}
          flatShading
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.47, 1]} />
        <meshBasicMaterial color={SIGNAL} wireframe transparent opacity={0.22} />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.78, 0.008, 6, 96]} />
          <meshBasicMaterial color={SIGNAL} transparent opacity={0.75} />
        </mesh>
        <mesh rotation={[0, Math.PI / 3, Math.PI / 5]}>
          <torusGeometry args={[0.98, 0.006, 6, 112]} />
          <meshBasicMaterial color={SIGNAL} transparent opacity={0.45} />
        </mesh>
        <mesh rotation={[Math.PI / 1.7, Math.PI / 6, 0]}>
          <torusGeometry args={[1.16, 0.005, 6, 128]} />
          <meshBasicMaterial color="#e4edf5" transparent opacity={0.25} />
        </mesh>
      </group>
    </group>
  );
}

/** Tier orbits plus instrument ticks on the service tier. */
export function TierOrbits() {
  const { orbits, ticks } = useMemo(() => {
    const parts = TIER_GEOMETRY.map(({ r, y }) => circleSegments(r, y, 160));
    const orbitBuffer = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
    let offset = 0;
    for (const p of parts) {
      orbitBuffer.set(p, offset);
      offset += p.length;
    }

    const tickData: number[] = [];
    const { r, y } = TIER_GEOMETRY[1];
    for (let deg = 0; deg < 360; deg += 5) {
      const a = (deg * Math.PI) / 180;
      const len = deg % 30 === 0 ? 0.16 : 0.07;
      tickData.push(Math.cos(a) * r, y, Math.sin(a) * r, Math.cos(a) * (r + len), y, Math.sin(a) * (r + len));
    }
    return { orbits: orbitBuffer, ticks: new Float32Array(tickData) };
  }, []);

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[orbits, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={SIGNAL} transparent opacity={0.16} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[ticks, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#93a4b6" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

/** Polar measurement grid under the system, faded by scene fog. */
export function PolarGrid({ y = -2.45 }: { y?: number }) {
  const positions = useMemo(() => {
    const parts: number[] = [];
    for (let r = 1; r <= 6; r++) parts.push(...circleSegments(r, y, 96));
    for (let deg = 0; deg < 360; deg += 30) {
      const a = (deg * Math.PI) / 180;
      parts.push(Math.cos(a) * 0.6, y, Math.sin(a) * 0.6, Math.cos(a) * 6, y, Math.sin(a) * 6);
    }
    return new Float32Array(parts);
  }, [y]);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#93a4b6" transparent opacity={0.09} />
    </lineSegments>
  );
}
