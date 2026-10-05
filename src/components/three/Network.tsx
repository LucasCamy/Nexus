import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SIGNAL_LINKS, nodePosition, type SystemNode } from "../../data/topology";
import { curvesToSegments, type LinkCurve } from "./geometry";

const SIGNAL = new THREE.Color("#4FD8EB");

/** All data-flow links in one draw call, plus a highlighted subset for the focused node. */
export function Connections({ curves, focusedId }: { curves: LinkCurve[]; focusedId: string | null }) {
  const base = useMemo(() => curvesToSegments(curves), [curves]);
  const highlight = useMemo(
    () => curvesToSegments(curves.filter((c) => c.from === focusedId || c.to === focusedId)),
    [curves, focusedId],
  );

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[base, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#6f8aa3" transparent opacity={0.34} />
      </lineSegments>
      {highlight.length > 0 && (
        <lineSegments key={focusedId ?? "none"}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[highlight, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={SIGNAL} transparent opacity={0.9} />
        </lineSegments>
      )}
    </group>
  );
}

/** Observation lines: the core sees every node. Very faint on purpose. */
export function ObservationLines({ nodes }: { nodes: SystemNode[] }) {
  const positions = useMemo(() => {
    const out: number[] = [];
    for (const n of nodes) out.push(0, 0, 0, ...nodePosition(n));
    return new Float32Array(out);
  }, [nodes]);
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={SIGNAL} transparent opacity={0.07} />
    </lineSegments>
  );
}

/** Data packets travelling along a subset of links. One instanced mesh. */
export function Signals({ curves }: { curves: LinkCurve[] }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const tracks = useMemo(() => {
    const active = curves.filter((c) => SIGNAL_LINKS.has(c.index));
    return active.flatMap((c, i) => [
      { curve: c.curve, offset: (i * 0.137) % 1, speed: 0.16 + (i % 3) * 0.04 },
      { curve: c.curve, offset: (i * 0.137 + 0.5) % 1, speed: 0.16 + (i % 3) * 0.04 },
    ]);
  }, [curves]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const point = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (mesh.current) mesh.current.count = tracks.length;
  }, [tracks.length]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    tracks.forEach((track, i) => {
      const p = (track.offset + t * track.speed) % 1;
      track.curve.getPoint(p, point);
      // Packets swell slightly mid-flight and shrink near endpoints.
      const s = 0.55 + Math.sin(p * Math.PI) * 0.45;
      dummy.position.copy(point);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, Math.max(tracks.length, 1)]} frustumCulled={false}>
      <sphereGeometry args={[0.032, 8, 8]} />
      <meshBasicMaterial color={SIGNAL} toneMapped={false} />
    </instancedMesh>
  );
}
