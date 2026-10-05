import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { NODES } from "../../data/topology";
import type { SceneQuality } from "../../lib/webgl";
import { buildCurves } from "./geometry";
import { Connections, ObservationLines, Signals } from "./Network";
import { ServiceNodes } from "./ServiceNodes";
import { CoreRings, PolarGrid, TierOrbits } from "./Structure";

export interface SystemCanvasProps {
  quality: SceneQuality;
  reducedMotion: boolean;
  active: boolean;
  focusedId: string | null;
  onFocus: (id: string) => void;
  onContextLost: () => void;
  onReady: () => void;
  labelRef?: RefObject<HTMLDivElement | null>;
}

/** Keeps the whole system in frame for any container aspect ratio. */
function CameraFit() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const distance = Math.max(3 / tan, 3.7 / (tan * aspect));
    camera.position.set(0, distance * 0.22, distance);
    // Wide hero layers leave room for the HUD below the system; narrow bands center it.
    camera.lookAt(0, aspect > 1.3 ? -0.55 : -0.3, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

/** Slow drift plus damped pointer parallax. Pointer lives in a ref, never in React state. */
function Rig({ animate, children }: { animate: boolean; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const drift = useRef(0);

  useEffect(() => {
    if (!animate) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [animate]);

  useFrame((_, delta) => {
    if (!animate || !group.current) return;
    drift.current += delta * 0.035;
    const g = group.current;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, drift.current + pointer.current.x * 0.18, 2.4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, pointer.current.y * 0.08, 2.4, delta);
  });

  return (
    <group ref={group} rotation={[0, -0.35, 0]}>
      {children}
    </group>
  );
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    onReady();
  });
  return null;
}

export default function SystemCanvas({
  quality,
  reducedMotion,
  active,
  focusedId,
  onFocus,
  onContextLost,
  onReady,
  labelRef,
}: SystemCanvasProps) {
  const lite = quality === "lite";
  const animate = !reducedMotion;
  // Lite keeps every node (the inspector can reach all of them) and drops signals, hover and antialiasing.
  const nodes = NODES;
  const curves = useMemo(() => buildCurves(new Set(NODES.map((n) => n.id))), []);

  const frameloop = !active ? "never" : reducedMotion ? "demand" : "always";

  return (
    <Canvas
      aria-hidden
      dpr={[1, lite ? 1.25 : 1.75]}
      frameloop={frameloop}
      camera={{ fov: 34, near: 0.1, far: 60, position: [0, 2.4, 11] }}
      gl={{ antialias: !lite, alpha: true, powerPreference: "default" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.NoToneMapping;
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
      style={{ touchAction: "pan-y" }}
    >
      <fog attach="fog" args={["#05080C", 9, 19]} />
      <ambientLight intensity={0.45} color="#9fc7ff" />
      <directionalLight position={[4, 7, 5]} intensity={1.3} color="#e8f4ff" />
      <pointLight position={[0, 0, 0]} intensity={3} distance={4.5} color="#4FD8EB" />
      <CameraFit />
      <ReadySignal onReady={onReady} />
      <Rig animate={animate}>
        <CoreRings animate={animate} />
        <TierOrbits />
        <ObservationLines nodes={nodes} />
        <Connections curves={curves} focusedId={focusedId} />
        {!lite && animate && <Signals curves={curves} />}
        <ServiceNodes
          nodes={nodes}
          focusedId={focusedId}
          interactive={!lite}
          animate={animate}
          onFocus={onFocus}
          labelRef={labelRef}
        />
        <PolarGrid />
      </Rig>
    </Canvas>
  );
}
