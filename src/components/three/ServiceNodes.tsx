import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { nodePosition, type NodeKind, type SystemNode } from "../../data/topology";

const COLORS = {
  base: new THREE.Color("#dbe8f3"),
  baseEmissive: new THREE.Color("#3b5468"),
  focus: new THREE.Color("#4FD8EB"),
  warn: new THREE.Color("#F2B544"),
  crit: new THREE.Color("#FF6B5E"),
  dark: new THREE.Color("#000000"),
};

function useKindGeometries() {
  const geometries = useMemo<Record<NodeKind, THREE.BufferGeometry>>(
    () => ({
      api: new THREE.OctahedronGeometry(0.17, 0),
      service: new THREE.BoxGeometry(0.24, 0.24, 0.24),
      queue: new THREE.CylinderGeometry(0.18, 0.18, 0.08, 6),
      db: new THREE.CylinderGeometry(0.12, 0.12, 0.26, 18),
      agent: new THREE.IcosahedronGeometry(0.17, 0),
    }),
    [],
  );
  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);
  return geometries;
}

interface NodeProps {
  node: SystemNode;
  geometry: THREE.BufferGeometry;
  focused: boolean;
  interactive: boolean;
  animate: boolean;
  onFocus: (id: string) => void;
}

function ServiceNode({ node, geometry, focused, interactive, animate, onFocus }: NodeProps) {
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const position = useMemo(() => nodePosition(node), [node]);
  const invalidate = useThree((s) => s.invalidate);
  const camera = useThree((s) => s.camera);

  const color = focused ? COLORS.focus : node.status === "warn" ? COLORS.warn : node.status === "crit" ? COLORS.crit : COLORS.base;
  const emissive = focused ? COLORS.focus : node.status !== "ok" ? color : COLORS.baseEmissive;

  useEffect(() => {
    if (!animate && group.current) {
      group.current.scale.setScalar(focused ? 1.3 : 1);
      halo.current?.quaternion.copy(camera.quaternion);
      invalidate();
    }
  }, [animate, focused, camera, invalidate]);

  useFrame((_, delta) => {
    if (!animate || !group.current) return;
    const target = focused ? 1.3 : 1;
    const s = THREE.MathUtils.damp(group.current.scale.x, target, 10, delta);
    group.current.scale.setScalar(s);
    group.current.rotation.y += delta * 0.3;
    if (halo.current) halo.current.quaternion.copy(camera.quaternion);
  });

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onFocus(node.id);
    document.body.style.cursor = "pointer";
  };
  const handleOut = () => {
    document.body.style.cursor = "";
  };

  return (
    <group position={position}>
      <group ref={group}>
        <mesh geometry={geometry}>
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={focused ? 0.7 : node.status !== "ok" ? 0.45 : 0.6}
            roughness={0.42}
            metalness={0.25}
            flatShading
          />
        </mesh>
      </group>
      <mesh ref={halo} visible={focused || node.status !== "ok"}>
        <ringGeometry args={[0.3, 0.315, 48]} />
        <meshBasicMaterial color={focused ? COLORS.focus : color} transparent opacity={focused ? 0.9 : 0.5} side={THREE.DoubleSide} />
      </mesh>
      {interactive && (
        <mesh onPointerOver={handleOver} onPointerOut={handleOut}>
          <sphereGeometry args={[0.34, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export function ServiceNodes({
  nodes,
  focusedId,
  interactive,
  animate,
  onFocus,
  labelRef,
}: {
  nodes: SystemNode[];
  focusedId: string | null;
  interactive: boolean;
  animate: boolean;
  onFocus: (id: string) => void;
  labelRef?: RefObject<HTMLDivElement | null>;
}) {
  const geometries = useKindGeometries();
  // Never leave a pointer cursor behind if the scene unmounts mid-hover.
  useEffect(() => () => void (document.body.style.cursor = ""), []);
  const focusedNode = nodes.find((n) => n.id === focusedId);
  const world = useMemo(() => new THREE.Vector3(), []);
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);
  const sceneRoot = useRef<THREE.Group>(null);

  // Position the DOM label next to the focused node without re-rendering React.
  useFrame(() => {
    const el = labelRef?.current;
    if (!el || !focusedNode) return;
    const parent = el.parentElement;
    const group = sceneRoot.current;
    if (!parent || !group) return;
    world.set(...nodePosition(focusedNode));
    group.localToWorld(world);
    world.project(camera);
    const x = (world.x * 0.5 + 0.5) * size.width;
    const y = (-world.y * 0.5 + 0.5) * size.height;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  });

  return (
    <group ref={sceneRoot}>
      {nodes.map((n) => (
        <ServiceNode
          key={n.id}
          node={n}
          geometry={geometries[n.kind]}
          focused={n.id === focusedId}
          interactive={interactive}
          animate={animate}
          onFocus={onFocus}
        />
      ))}
    </group>
  );
}
