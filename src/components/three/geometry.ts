import * as THREE from "three";
import { LINKS, nodeById, nodePosition } from "../../data/topology";

/**
 * Curves for every data-flow link. Each curve bends toward the vertical
 * axis so links read as routed through the system, not as straight wires.
 */
export function buildCurves(visibleIds: Set<string>) {
  return LINKS.map(([from, to], index) => {
    if (!visibleIds.has(from) || !visibleIds.has(to)) return null;
    const a = new THREE.Vector3(...nodePosition(nodeById[from]));
    const b = new THREE.Vector3(...nodePosition(nodeById[to]));
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const control = new THREE.Vector3(mid.x * 0.45, mid.y + 0.15, mid.z * 0.45);
    return { index, from, to, curve: new THREE.QuadraticBezierCurve3(a, control, b) };
  }).filter((c): c is NonNullable<typeof c> => c !== null);
}

export type LinkCurve = ReturnType<typeof buildCurves>[number];

/** Flattens curves into a LineSegments position buffer. */
export function curvesToSegments(curves: LinkCurve[], samples = 28): Float32Array {
  const out: number[] = [];
  for (const { curve } of curves) {
    const pts = curve.getPoints(samples);
    for (let i = 0; i < pts.length - 1; i++) {
      out.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
    }
  }
  return new Float32Array(out);
}

export function circleSegments(radius: number, y: number, segments = 128): Float32Array {
  const out: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    out.push(Math.cos(a0) * radius, y, Math.sin(a0) * radius, Math.cos(a1) * radius, y, Math.sin(a1) * radius);
  }
  return new Float32Array(out);
}
