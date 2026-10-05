import { SERVICES, type ProductEvent } from "../../../data/product";
import { cn } from "../../../lib/cn";

const SEVERITY = {
  crit: { label: "Crítico", cls: "text-crit", glyph: "rounded-[1px]" },
  warn: { label: "Alerta", cls: "text-warn", glyph: "[clip-path:polygon(50%_0,100%_100%,0_100%)]" },
  ok: { label: "Recuperado", cls: "text-ok", glyph: "rounded-full" },
  info: { label: "Info", cls: "text-info", glyph: "rounded-full border border-current bg-transparent" },
} as const;

export function EventsView({
  events,
  selectedId,
  onSelect,
}: {
  events: ProductEvent[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ol className="divide-y divide-line" aria-label="Feed de eventos">
      {events.map((e) => {
        const svc = SERVICES.find((s) => s.id === e.service)!;
        const sev = SEVERITY[e.severity];
        const isSel = e.service === selectedId;
        return (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onSelect(e.service)}
              className={cn(
                "grid w-full grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 px-3 py-3 text-left transition-colors sm:grid-cols-[76px_96px_1fr] sm:px-4",
                isSel ? "bg-surface-3" : "hover:bg-surface-2",
              )}
            >
              <span className="num pt-0.5 text-xs text-dim">{e.time}</span>
              <span className={cn("label-mono flex items-center gap-1.5 pt-0.5", sev.cls)}>
                <span aria-hidden className={cn("inline-block size-2 shrink-0 bg-current", sev.glyph)} />
                {sev.label}
              </span>
              <span className="col-span-2 min-w-0 sm:col-span-1">
                <span className="num block truncate text-xs text-muted">{svc.label}</span>
                <span className="block text-sm text-text">{e.text}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
