import { WaveformIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useRef, useState, type PointerEvent } from "react";
import { EASE_IN_OUT } from "../../../lib/motion";
import { useInViewOnce } from "../../../lib/useInViewOnce";

/* DADOS DEMONSTRATIVOS: latência p95 do search-svc, 60 min observados + 30 min de previsão. */
const OBSERVED = [
  212, 208, 215, 210, 218, 214, 221, 216, 219, 224, 220, 227, 223, 229, 226, 232, 236, 233, 241, 238, 246, 251, 255, 262,
  266, 271, 279, 284, 291, 298, 302, 312,
];
const FORECAST = [312, 318, 326, 331, 339, 344, 352, 358, 364, 371, 377, 383, 390, 396, 402, 408];
const SLO = 340;
const MAX = 440;
const MIN = 160;

const W = 480;
const H = 200;
const PAD = { l: 34, r: 12, t: 16, b: 26 };
const total = OBSERVED.length + FORECAST.length - 1;
const x = (i: number) => PAD.l + (i / total) * (W - PAD.l - PAD.r);
const y = (v: number) => PAD.t + (1 - (v - MIN) / (MAX - MIN)) * (H - PAD.t - PAD.b);
const toPath = (vals: number[], start: number) =>
  vals.map((v, i) => `${i ? "L" : "M"}${x(start + i).toFixed(1)},${y(v).toFixed(1)}`).join("");

const forecastStart = OBSERVED.length - 1;
const bandUpper = FORECAST.map((v, i) => v + i * 3.2);
const bandLower = FORECAST.map((v, i) => v - i * 2.6);
const bandPath =
  toPath(bandUpper, forecastStart) +
  bandLower
    .map((v, i) => [i, v] as const)
    .reverse()
    .map(([i, v]) => `L${x(forecastStart + i).toFixed(1)},${y(v).toFixed(1)}`)
    .join("") +
  "Z";
const breachIndex = forecastStart + FORECAST.findIndex((v) => v >= SLO);
const ALL = [...OBSERVED, ...FORECAST.slice(1)];

function minuteLabel(i: number) {
  const m = i * 2 - 62;
  return m === 0 ? "agora" : m < 0 ? `${m} min` : `+${m} min`;
}

export function AnomalyForecast() {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.4);
  const svgRef = useRef<SVGSVGElement>(null);
  const [scrub, setScrub] = useState<number | null>(null);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((vx - PAD.l) / (W - PAD.l - PAD.r)) * total);
    setScrub(Math.max(0, Math.min(total, i)));
  };

  const shown = scrub ?? breachIndex;
  const value = ALL[shown];
  const isForecast = shown >= forecastStart;

  return (
    <article className="panel flex h-full flex-col p-6 md:p-8" aria-labelledby="cap-anomaly">
      <div className="flex items-start justify-between gap-4">
        <div>
          <WaveformIcon aria-hidden weight="light" className="size-6 text-signal" />
          <h3 id="cap-anomaly" className="font-display mt-4 text-2xl text-text">
            Detecte anomalias antes do impacto
          </h3>
        </div>
      </div>
      <p className="mt-3 text-muted">As previsões comparam a tendência com seus SLOs, para o alerta chegar enquanto ainda há tempo de agir.</p>

      <figure ref={ref} className="mt-6">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="label-mono text-dim">search-svc · p95</p>
          <p className="label-mono" aria-live="polite">
            <span className="text-dim">{minuteLabel(shown)} </span>
            <span className={value >= SLO ? "text-warn" : "text-text"}>{value} ms</span>
            {isForecast && <span className="text-dim"> previsão</span>}
          </p>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-pan-y"
          onPointerMove={onMove}
          onPointerLeave={() => setScrub(null)}
          role="img"
          aria-label="Gráfico de latência. O p95 observado sobe de 212 para 312 milissegundos na última hora. A previsão cruza o SLO de 340 milissegundos em cerca de 10 minutos."
        >
          {[200, 300, 400].map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--line)" />
              <text x={PAD.l - 6} y={y(v) + 3} textAnchor="end" className="fill-[var(--text-dim)] font-mono text-[9px]">
                {v}
              </text>
            </g>
          ))}
          <line x1={x(forecastStart)} x2={x(forecastStart)} y1={PAD.t} y2={H - PAD.b} stroke="var(--line-strong)" />
          <text x={x(forecastStart)} y={H - 8} textAnchor="middle" className="fill-[var(--text-dim)] font-mono text-[9px]">
            agora
          </text>
          <text x={W - PAD.r} y={H - 8} textAnchor="end" className="fill-[var(--text-dim)] font-mono text-[9px]">
            +30 min
          </text>
          <text x={PAD.l} y={H - 8} className="fill-[var(--text-dim)] font-mono text-[9px]">
            -60 min
          </text>

          {/* SLO threshold */}
          <line x1={PAD.l} x2={W - PAD.r} y1={y(SLO)} y2={y(SLO)} stroke="var(--warn)" strokeDasharray="4 4" strokeOpacity={0.8} />
          <text x={PAD.l + 4} y={y(SLO) - 5} className="fill-[var(--warn)] font-mono text-[9px]">
            SLO 340 ms
          </text>

          {/* Forecast band + line */}
          <motion.path
            d={bandPath}
            fill="var(--warn)"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 0.1 } : undefined}
            transition={{ duration: 0.6, delay: 1.1 }}
          />
          <motion.path
            d={toPath(OBSERVED, 0)}
            fill="none"
            stroke="var(--signal)"
            strokeWidth={1.6}
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : undefined}
            transition={{ duration: 1.1, ease: EASE_IN_OUT }}
          />
          <motion.path
            d={toPath(FORECAST, forecastStart)}
            fill="none"
            stroke="var(--warn)"
            strokeWidth={1.6}
            strokeDasharray="3 4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: 1.0 }}
          />

          {/* Predicted breach marker */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ duration: 0.4, delay: 1.4 }}
          >
            <line x1={x(breachIndex)} x2={x(breachIndex)} y1={PAD.t} y2={H - PAD.b} stroke="var(--warn)" strokeOpacity={0.5} />
            <rect x={x(breachIndex) - 4} y={y(SLO) - 4} width={8} height={8} fill="var(--warn)" transform={`rotate(45 ${x(breachIndex)} ${y(SLO)})`} />
          </motion.g>

          {scrub !== null && (
            <g>
              <line x1={x(scrub)} x2={x(scrub)} y1={PAD.t} y2={H - PAD.b} stroke="var(--text-muted)" strokeOpacity={0.6} />
              <circle cx={x(scrub)} cy={y(value)} r={3.5} fill="var(--bg)" stroke={value >= SLO ? "var(--warn)" : "var(--signal)"} strokeWidth={1.5} />
            </g>
          )}
        </svg>
        <figcaption className="mt-4 flex items-center gap-2 rounded-sm border border-[rgba(242,181,68,0.3)] bg-[var(--warn-soft)] px-3 py-2.5 text-sm text-text">
          <span aria-hidden className="inline-block size-2 shrink-0 bg-warn [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
          Violação de SLO prevista em 10 min. Causa: taxa de acerto do cache caindo no search-svc.
        </figcaption>
      </figure>
    </article>
  );
}
