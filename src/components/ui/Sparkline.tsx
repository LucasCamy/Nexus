import { useId } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  area?: boolean;
  threshold?: number;
  max?: number;
  className?: string;
  label: string;
}

export function sparkPath(data: number[], width: number, height: number, max?: number, pad = 2) {
  const hi = max ?? Math.max(...data);
  const lo = Math.min(0, ...data);
  const step = (width - pad * 2) / (data.length - 1);
  const y = (v: number) => height - pad - ((v - lo) / (hi - lo || 1)) * (height - pad * 2);
  const pts = data.map((v, i) => [pad + i * step, y(v)] as const);
  const line = pts.map(([x, yy], i) => `${i ? "L" : "M"}${x.toFixed(1)},${yy.toFixed(1)}`).join("");
  return { line, pts, y };
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  stroke = "var(--signal)",
  area = true,
  threshold,
  max,
  className,
  label,
}: SparklineProps) {
  const id = useId();
  const { line, pts, y } = sparkPath(data, width, height, max);
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={className} role="img" aria-label={label}>
      {area && (
        <>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={stroke} stopOpacity="0.18" />
              <stop offset="1" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line}L${last[0]},${height}L${pts[0][0]},${height}Z`} fill={`url(#${id})`} />
        </>
      )}
      {threshold !== undefined && (
        <line
          x1="0"
          x2={width}
          y1={y(threshold)}
          y2={y(threshold)}
          stroke="var(--warn)"
          strokeDasharray="3 3"
          strokeWidth="1"
        />
      )}
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2" fill={stroke} />
    </svg>
  );
}
