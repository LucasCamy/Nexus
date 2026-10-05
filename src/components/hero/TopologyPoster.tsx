import { memo, useMemo } from "react";
import { LINKS, NODES, TIER_GEOMETRY, nodeById, nodePosition, type NodeKind, type SystemNode } from "../../data/topology";

/**
 * 2D projection of the same topology the 3D scene renders.
 * Used as loading poster (same composition, so no layout shift) and as the
 * fallback when WebGL is unavailable.
 */

const THETA = -0.35;
const TILT = 0.22;
const K = 100;

function project([x, y, z]: [number, number, number]) {
  const xr = x * Math.cos(THETA) + z * Math.sin(THETA);
  const zr = -x * Math.sin(THETA) + z * Math.cos(THETA);
  return { x: xr * K, y: (-y + zr * TILT) * K, depth: zr };
}

function Shape({ kind, size, fill, stroke }: { kind: NodeKind; size: number; fill: string; stroke: string }) {
  const s = size;
  switch (kind) {
    case "api":
      return <polygon points={`0,${-s} ${s},0 0,${s} ${-s},0`} fill={fill} stroke={stroke} />;
    case "service":
      return <rect x={-s * 0.75} y={-s * 0.75} width={s * 1.5} height={s * 1.5} rx={1.5} fill={fill} stroke={stroke} />;
    case "queue": {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return `${(Math.cos(a) * s).toFixed(1)},${(Math.sin(a) * s * 0.6).toFixed(1)}`;
      }).join(" ");
      return <polygon points={pts} fill={fill} stroke={stroke} />;
    }
    case "db":
      return (
        <g fill={fill} stroke={stroke}>
          <rect x={-s * 0.7} y={-s * 0.8} width={s * 1.4} height={s * 1.6} rx={s * 0.7} />
        </g>
      );
    case "agent":
      return <polygon points={`0,${-s} ${s * 0.95},${s * 0.7} ${-s * 0.95},${s * 0.7}`} fill={fill} stroke={stroke} />;
  }
}

export const TopologyPoster = memo(function TopologyPoster({
  focusedId,
  className,
}: {
  focusedId: string | null;
  className?: string;
}) {
  const nodes = NODES;
  const ids = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);

  const projected = useMemo(
    () =>
      nodes
        .map((n) => ({ node: n, ...project(nodePosition(n)) }))
        .sort((a, b) => a.depth - b.depth),
    [nodes],
  );

  const links = useMemo(
    () =>
      LINKS.filter(([a, b]) => ids.has(a) && ids.has(b)).map(([a, b]) => {
        const pa = project(nodePosition(nodeById[a]));
        const pb = project(nodePosition(nodeById[b]));
        const cx = ((pa.x + pb.x) / 2) * 0.45;
        const cy = (pa.y + pb.y) / 2 - 12;
        return { a, b, d: `M${pa.x.toFixed(1)},${pa.y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${pb.x.toFixed(1)},${pb.y.toFixed(1)}` };
      }),
    [ids],
  );

  const color = (n: SystemNode) =>
    n.id === focusedId ? "var(--signal)" : n.status === "warn" ? "var(--warn)" : n.status === "crit" ? "var(--crit)" : "#c9dae8";

  return (
    <svg viewBox="-420 -260 840 560" className={className} aria-hidden preserveAspectRatio="xMidYMid meet">
      {/* Polar grid */}
      <g stroke="rgba(147,164,182,0.09)" fill="none">
        {[1, 2, 3, 4, 5].map((r) => (
          <ellipse key={r} cx={0} cy={245} rx={r * K} ry={r * K * TILT} />
        ))}
      </g>

      {/* Tier orbits */}
      <g fill="none" stroke="rgba(79,216,235,0.18)">
        {TIER_GEOMETRY.map(({ r, y }) => (
          <ellipse key={y} cx={0} cy={-y * K} rx={r * K} ry={r * K * TILT} />
        ))}
      </g>

      {/* Observation lines */}
      <g stroke="rgba(79,216,235,0.08)">
        {projected.map(({ node, x, y }) => (
          <line key={node.id} x1={0} y1={0} x2={x} y2={y} />
        ))}
      </g>

      {/* Data-flow links */}
      <g fill="none" strokeWidth={1}>
        {links.map((l) => {
          const hot = l.a === focusedId || l.b === focusedId;
          return (
            <path
              key={`${l.a}-${l.b}`}
              d={l.d}
              stroke={hot ? "var(--signal)" : "rgba(111,138,163,0.4)"}
              strokeOpacity={hot ? 0.9 : 1}
            />
          );
        })}
      </g>

      {/* Core */}
      <g>
        <circle r={78} fill="none" stroke="rgba(79,216,235,0.75)" />
        <ellipse rx={98} ry={36} fill="none" stroke="rgba(79,216,235,0.45)" transform="rotate(-24)" />
        <ellipse rx={116} ry={60} fill="none" stroke="rgba(228,237,245,0.22)" transform="rotate(32)" />
        <circle r={40} fill="#0c2830" stroke="var(--signal)" strokeOpacity={0.6} />
        <circle r={18} fill="var(--signal)" fillOpacity={0.55} />
      </g>

      {/* Nodes, back to front */}
      {projected.map(({ node, x, y, depth }) => {
        const focused = node.id === focusedId;
        const scale = 1 + depth * 0.06;
        const c = color(node);
        return (
          <g key={node.id} transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${scale.toFixed(2)})`} opacity={0.65 + (depth + 3.4) * 0.05}>
            {(focused || node.status !== "ok") && <circle r={26} fill="none" stroke={c} strokeOpacity={focused ? 0.9 : 0.5} />}
            <Shape kind={node.kind} size={focused ? 14 : 11} fill={c} stroke="rgba(5,8,12,0.6)" />
          </g>
        );
      })}
    </svg>
  );
});
