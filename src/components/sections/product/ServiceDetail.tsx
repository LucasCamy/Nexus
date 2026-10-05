import { XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { KIND_LABEL } from "../../../data/topology";
import { SERVICES, type ProductEvent, type ServiceReading } from "../../../data/product";
import { cn } from "../../../lib/cn";
import { DUR, EASE_OUT } from "../../../lib/motion";
import { KIND_ICON } from "../../hero/SceneHud";
import { Sparkline } from "../../ui/Sparkline";
import { StatusBadge } from "../../ui/StatusBadge";

export function ServiceDetail({
  serviceId,
  reading,
  events,
  onSelect,
  onClear,
}: {
  serviceId: string;
  reading: ServiceReading;
  events: ProductEvent[];
  onSelect: (id: string) => void;
  onClear?: () => void;
}) {
  const svc = SERVICES.find((s) => s.id === serviceId)!;
  const Icon = KIND_ICON[svc.kind];
  const callers = SERVICES.filter((s) => s.deps.includes(svc.id));
  const recent = events.filter((e) => e.service === svc.id).slice(0, 2);
  const latencyColor = reading.status === "ok" ? "var(--signal)" : reading.status === "warn" ? "var(--warn)" : "var(--crit)";

  return (
    <aside aria-label={`Detalhes de ${svc.label}`} aria-live="polite" className="flex h-full flex-col">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={svc.id + reading.status}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0, transition: { duration: DUR.base, ease: EASE_OUT } }}
          exit={{ opacity: 0, transition: { duration: DUR.micro } }}
          className="flex h-full flex-col"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="num truncate text-text">{svc.label}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                <Icon aria-hidden className="size-3.5" />
                {KIND_LABEL[svc.kind]} do time {svc.owner}
              </p>
            </div>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                aria-label="Fechar detalhes"
                className="-mt-2 -mr-2 grid size-11 place-items-center rounded-sm text-muted hover:bg-surface-3 hover:text-text"
              >
                <XIcon aria-hidden className="size-4" />
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={reading.status} />
            <span className="label-mono rounded-xs border border-line px-2 py-1 text-dim">{svc.version}</span>
          </div>

          {reading.note && <p className="mt-4 text-sm leading-relaxed text-muted">{reading.note}</p>}

          <dl className="mt-5 grid grid-cols-3 gap-3">
            <div>
              <dt className="label-mono text-dim">p95</dt>
              <dd className={cn("num text-lg", reading.status === "ok" ? "text-text" : reading.status === "warn" ? "text-warn" : "text-crit")}>
                {reading.p95.toLocaleString("pt-BR")}
                <span className="text-xs text-dim"> ms</span>
              </dd>
            </div>
            <div>
              <dt className="label-mono text-dim">erros</dt>
              <dd className="num text-lg text-text">
                {reading.errorRate.toLocaleString("pt-BR")}
                <span className="text-xs text-dim"> %</span>
              </dd>
            </div>
            <div>
              <dt className="label-mono text-dim">{svc.kind === "queue" ? "msg/s" : "req/s"}</dt>
              <dd className="num text-lg text-text">{reading.rps.toLocaleString("pt-BR")}</dd>
            </div>
          </dl>

          <div className="mt-5 space-y-4">
            <div>
              <p className="label-mono mb-1.5 flex justify-between text-dim">
                <span>latência, 1h</span>
                <span>p95</span>
              </p>
              <Sparkline data={reading.latency} width={260} height={44} stroke={latencyColor} className="h-11 w-full" label={`Latência na última hora de ${svc.label}`} />
            </div>
            <div>
              <p className="label-mono mb-1.5 flex justify-between text-dim">
                <span>taxa de erro, 1h</span>
                <span>%</span>
              </p>
              <Sparkline
                data={reading.errors}
                width={260}
                height={32}
                stroke={reading.status === "crit" ? "var(--crit)" : "var(--text-muted)"}
                area={false}
                className="h-8 w-full"
                label={`Taxa de erro na última hora de ${svc.label}`}
              />
            </div>
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <p className="label-mono text-dim">dependências</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {svc.deps.length === 0 && <span className="text-sm text-dim">Nenhuma, este é um armazenamento final.</span>}
              {svc.deps.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onSelect(d)}
                  className="num inline-flex min-h-8 items-center rounded-xs border border-line-strong px-2 text-xs text-muted transition-colors hover:border-signal hover:text-signal"
                >
                  {SERVICES.find((s) => s.id === d)!.label}
                </button>
              ))}
            </div>
            {callers.length > 0 && (
              <p className="mt-3 text-xs text-dim">
                Chamado por {callers.map((c) => c.label).join(", ")}
              </p>
            )}
          </div>

          {recent.length > 0 && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="label-mono text-dim">eventos recentes</p>
              <ul className="mt-2 space-y-2">
                {recent.map((e) => (
                  <li key={e.id} className="text-sm">
                    <span className="num text-xs text-dim">{e.time}</span>
                    <p className="text-text">{e.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
