import { TreeStructureIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { KIND_LABEL, LINKS, nodeById } from "../../../data/topology";
import { cn } from "../../../lib/cn";

/* Subset of the shared demonstration topology, laid out in dependency columns. */
const COLUMNS = [
  { title: "Borda", ids: ["gateway", "payments", "graphql"] },
  { title: "Serviços", ids: ["checkout", "catalog", "search", "billing"] },
  { title: "Filas", ids: ["orders-q", "events"] },
  { title: "Dados", ids: ["pg-primary", "cache", "pg-replica", "objects"] },
];
/** Compact labels so four columns stay legible at 375px. */
const shortLabel = (label: string) =>
  label
    .replace(/^(edge|public)-/, "")
    .replace(/^postgres-/, "pg-")
    .replace(/-(svc|api|queue|stream|worker|store)$/, "");

const IDS = new Set(COLUMNS.flatMap((c) => c.ids));
const EDGES = LINKS.filter(([a, b]) => IDS.has(a) && IDS.has(b));

function walk(start: string, dir: "down" | "up"): Set<string> {
  const seen = new Set<string>();
  const stack = [start];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const [a, b] of EDGES) {
      const next = dir === "down" ? (a === cur ? b : null) : b === cur ? a : null;
      if (next && !seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen;
}

// Grid geometry in SVG units (viewBox 400 x 300).
const W = 400;
const H = 300;
function pos(id: string) {
  const col = COLUMNS.findIndex((c) => c.ids.includes(id));
  const row = COLUMNS[col].ids.indexOf(id);
  const n = COLUMNS[col].ids.length;
  const x = 30 + col * ((W - 60) / (COLUMNS.length - 1));
  const y = 40 + (row + 0.5) * ((H - 60) / n);
  return { x, y };
}

export function DependencyTrace() {
  const [focus, setFocus] = useState("checkout");
  const { up, down } = useMemo(() => ({ up: walk(focus, "up"), down: walk(focus, "down") }), [focus]);
  const node = nodeById[focus];

  const edgeState = (a: string, b: string) => {
    if ((a === focus || up.has(a)) && (b === focus || up.has(b))) return "up";
    if ((a === focus || down.has(a)) && (b === focus || down.has(b))) return "down";
    return "idle";
  };

  return (
    <article className="panel flex h-full flex-col overflow-hidden" aria-labelledby="cap-map">
      <div className="p-6 pb-0 md:p-8 md:pb-0">
        <TreeStructureIcon aria-hidden weight="light" className="size-6 text-signal" />
        <h3 id="cap-map" className="font-display mt-4 text-2xl text-text md:text-[1.75rem]">
          Mapeie cada dependência
        </h3>
        <p className="mt-3 max-w-[46ch] text-muted">
          Rastreie qualquer requisição da borda até a linha que ela lê. Selecione um nó para acender quem o chama e do que ele depende.
        </p>
      </div>

      <div className="relative mt-6 flex-1 px-3 md:px-6">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[640px]">
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
            {COLUMNS.map((c, i) => (
              <text
                key={c.title}
                x={30 + i * ((W - 60) / (COLUMNS.length - 1))}
                y={16}
                textAnchor="middle"
                className="fill-[var(--text-dim)] font-mono text-[9px] uppercase tracking-wider"
              >
                {c.title}
              </text>
            ))}
            {EDGES.map(([a, b]) => {
              const pa = pos(a);
              const pb = pos(b);
              const s = edgeState(a, b);
              const mx = (pa.x + pb.x) / 2;
              return (
                <path
                  key={`${a}-${b}`}
                  d={`M${pa.x},${pa.y} C${mx},${pa.y} ${mx},${pb.y} ${pb.x},${pb.y}`}
                  fill="none"
                  stroke={s === "down" ? "var(--signal)" : s === "up" ? "var(--ok)" : "rgba(147,164,182,0.22)"}
                  strokeWidth={s === "idle" ? 1 : 1.6}
                  style={{ transition: "stroke 220ms var(--ease-out)" }}
                />
              );
            })}
          </svg>

          {[...IDS].map((id) => {
            const p = pos(id);
            const n = nodeById[id];
            const isFocus = id === focus;
            const isUp = up.has(id);
            const isDown = down.has(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFocus(id)}
                onMouseEnter={() => setFocus(id)}
                onFocus={() => setFocus(id)}
                aria-pressed={isFocus}
                aria-label={`${n.label}, ${KIND_LABEL[n.kind]}`}
                className="group absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}
              >
                <span
                  className={cn(
                    "block size-3 rounded-[3px] border transition-[background-color,border-color,transform] duration-[var(--d-fast)] ease-[var(--ease-out)]",
                    isFocus
                      ? "scale-125 border-signal bg-signal"
                      : isDown
                        ? "border-signal bg-[var(--signal-soft)]"
                        : isUp
                          ? "border-ok bg-[var(--ok-soft)]"
                          : "border-line-strong bg-surface-2 group-hover:border-[rgba(190,220,255,0.4)]",
                  )}
                />
                <span
                  className={cn(
                    "pointer-events-none absolute top-[calc(50%+10px)] font-mono text-[10px] whitespace-nowrap sm:text-xs",
                    isFocus ? "text-text" : "text-dim",
                  )}
                >
                  {shortLabel(n.label)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <dl
        className="mt-4 grid grid-cols-3 border-t border-line text-sm"
        aria-live="polite"
        aria-label={`Dependências de ${node.label}`}
      >
        <div className="min-w-0 border-r border-line px-3 py-4 sm:px-5 md:px-8">
          <dt className="label-mono text-dim">selecionado</dt>
          <dd className="num mt-1 truncate text-text">{node.label}</dd>
        </div>
        <div className="min-w-0 border-r border-line px-3 py-4 sm:px-5 md:px-8">
          <dt className="label-mono flex items-center gap-1.5 whitespace-nowrap text-dim">
            <span aria-hidden className="h-px w-3 bg-ok" />
            quem chama
          </dt>
          <dd className="num mt-1 text-text">{up.size}</dd>
        </div>
        <div className="min-w-0 px-3 py-4 sm:px-5 md:px-8">
          <dt className="label-mono flex items-center gap-1.5 whitespace-nowrap text-dim">
            <span aria-hidden className="h-px w-3 bg-signal" />
            depende de
          </dt>
          <dd className="num mt-1 text-text">{down.size}</dd>
        </div>
      </dl>
    </article>
  );
}
