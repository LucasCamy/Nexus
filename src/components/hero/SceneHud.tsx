import { CaretLeftIcon, CaretRightIcon, CubeIcon, DatabaseIcon, PlugsIcon, QueueIcon, RobotIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { KIND_LABEL, NODES, TIER_LABEL, nodeById, type NodeKind } from "../../data/topology";
import { cn } from "../../lib/cn";
import { DUR, EASE_OUT } from "../../lib/motion";
import { StatusBadge } from "../ui/StatusBadge";
import { Sparkline } from "../ui/Sparkline";

export const KIND_ICON: Record<NodeKind, typeof CubeIcon> = {
  api: PlugsIcon,
  service: CubeIcon,
  queue: QueueIcon,
  db: DatabaseIcon,
  agent: RobotIcon,
};

/** Deterministic pseudo-series so each node has a stable latency trace. */
function seriesFor(id: string, p95: number, degraded: boolean) {
  let seed = [...id].reduce((s, c) => s + c.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: 24 }, (_, i) => {
    const base = p95 * (0.72 + rand() * 0.22);
    return degraded && i > 16 ? base * (1 + (i - 16) * 0.09) : base;
  });
}

export function NodeInspector({
  focusedId,
  onFocus,
  interactiveHint,
  className,
}: {
  focusedId: string;
  onFocus: (id: string) => void;
  interactiveHint: string;
  className?: string;
}) {
  const node = nodeById[focusedId];
  const index = NODES.findIndex((n) => n.id === focusedId);
  const step = (dir: 1 | -1) => onFocus(NODES[(index + dir + NODES.length) % NODES.length].id);
  const Icon = KIND_ICON[node.kind];

  return (
    <div className={cn("glass w-full rounded-md border border-line-strong p-4 shadow-[var(--shadow-2)]", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="label-mono uppercase text-dim">Inspetor de nó</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Inspecionar nó anterior"
            className="grid size-11 place-items-center rounded-sm text-muted transition-colors duration-[var(--d-fast)] hover:bg-surface-3 hover:text-text lg:size-8"
          >
            <CaretLeftIcon aria-hidden className="size-4" />
          </button>
          <span className="num w-12 text-center text-xs text-dim" aria-hidden>
            {String(index + 1).padStart(2, "0")}/{NODES.length}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Inspecionar próximo nó"
            className="grid size-11 place-items-center rounded-sm text-muted transition-colors duration-[var(--d-fast)] hover:bg-surface-3 hover:text-text lg:size-8"
          >
            <CaretRightIcon aria-hidden className="size-4" />
          </button>
        </div>
      </div>

      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
          >
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="num truncate text-[0.95rem] text-text">{node.label}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <Icon aria-hidden className="size-3.5 shrink-0" />
                  {KIND_LABEL[node.kind]}
                  <span aria-hidden className="text-dim">/</span>
                  <span className="truncate text-dim">{TIER_LABEL[node.tier]}</span>
                </p>
              </div>
              <StatusBadge status={node.status} />
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3">
              <div>
                <dt className="label-mono text-dim">p95</dt>
                <dd className={cn("num mt-0.5 text-sm", node.status === "warn" ? "text-warn" : "text-text")}>{node.p95} ms</dd>
              </div>
              <div>
                <dt className="label-mono text-dim">{node.kind === "queue" ? "msg/s" : "req/s"}</dt>
                <dd className="num mt-0.5 text-sm text-text">{node.rps.toLocaleString("pt-BR")}</dd>
              </div>
              <div>
                <dt className="label-mono text-dim">região</dt>
                <dd className="num mt-0.5 text-sm text-text">{node.region}</dd>
              </div>
            </dl>
            <Sparkline
              className="mt-3 h-8 w-full"
              width={280}
              height={32}
              data={seriesFor(node.id, node.p95, node.status === "warn")}
              stroke={node.status === "warn" ? "var(--warn)" : "var(--signal)"}
              label={`Tendência de latência de ${node.label} nas últimas 2 horas`}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-2 text-xs text-dim">{interactiveHint}</p>
    </div>
  );
}

export function KindLegend({ className }: { className?: string }) {
  const kinds: NodeKind[] = ["api", "service", "queue", "agent", "db"];
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-2", className)} aria-label="Tipos de nó no mapa">
      {kinds.map((k) => {
        const Icon = KIND_ICON[k];
        return (
          <li key={k} className="flex items-center gap-1.5 text-xs text-muted">
            <Icon aria-hidden className="size-3.5 text-dim" />
            {KIND_LABEL[k]}
          </li>
        );
      })}
    </ul>
  );
}
