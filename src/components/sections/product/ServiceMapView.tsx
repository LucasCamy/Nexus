import { SERVICES, type ServiceReading } from "../../../data/product";
import { cn } from "../../../lib/cn";
import { useMediaQuery } from "../../../lib/useMediaQuery";
import { KIND_ICON } from "../../hero/SceneHud";
import { HealthGlyph } from "../../ui/StatusBadge";

const W = 640;
const H = 380;
const px = (v: number) => (v / 100) * W;
const py = (v: number) => 24 + (v / 100) * (H - 48);

/** Map chips are small: drop prefixes and suffixes that repeat the node type. */
const shortName = (label: string) => label.replace(/^edge-/, "").replace(/-(svc|api|queue|worker|primary|cache|agent)$/, "");

const tone = {
  ok: "text-ok",
  warn: "text-warn",
  crit: "text-crit",
} as const;

export function ServiceMapView({
  readings,
  selectedId,
  onSelect,
  visibleIds,
}: {
  readings: Record<string, ServiceReading>;
  selectedId: string;
  onSelect: (id: string) => void;
  visibleIds: Set<string>;
}) {
  const roomy = useMediaQuery("(min-width: 640px)");
  const selected = SERVICES.find((s) => s.id === selectedId);
  const hot = new Set([selectedId, ...(selected?.deps ?? []), ...SERVICES.filter((s) => s.deps.includes(selectedId)).map((s) => s.id)]);

  if (visibleIds.size === 0) return null;

  if (!roomy) {
    return (
      <ul className="divide-y divide-line">
        {SERVICES.filter((s) => visibleIds.has(s.id)).map((s) => {
          const r = readings[s.id];
          const Icon = KIND_ICON[s.kind];
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                aria-pressed={s.id === selectedId}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  s.id === selectedId ? "bg-surface-3" : "hover:bg-surface-2",
                )}
              >
                <Icon aria-hidden className="size-4 shrink-0 text-dim" />
                <span className="num min-w-0 flex-1 truncate text-sm text-text">{s.label}</span>
                <span className={cn("num text-xs", r.status === "ok" ? "text-muted" : tone[r.status])}>{r.p95} ms</span>
                <HealthGlyph status={r.status} className={tone[r.status]} />
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
        {SERVICES.flatMap((s) =>
          s.deps.map((d) => {
            const t = SERVICES.find((x) => x.id === d)!;
            const visible = visibleIds.has(s.id) && visibleIds.has(t.id);
            const on = hot.has(s.id) && hot.has(t.id) && (s.id === selectedId || t.id === selectedId);
            const a = { x: px(s.x) + 62, y: py(s.y) };
            const b = { x: px(t.x) - 62, y: py(t.y) };
            const mx = (a.x + b.x) / 2;
            return (
              <path
                key={`${s.id}-${d}`}
                d={`M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`}
                fill="none"
                stroke={on ? "var(--signal)" : "rgba(147,164,182,0.25)"}
                strokeWidth={on ? 1.5 : 1}
                opacity={visible ? 1 : 0.25}
                style={{ transition: "stroke 220ms var(--ease-out), opacity 220ms var(--ease-out)" }}
              />
            );
          }),
        )}
      </svg>
      {SERVICES.map((s) => {
        const r = readings[s.id];
        const Icon = KIND_ICON[s.kind];
        const visible = visibleIds.has(s.id);
        const isSel = s.id === selectedId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            aria-pressed={isSel}
            tabIndex={visible ? 0 : -1}
            aria-hidden={!visible || undefined}
            aria-label={`${s.label}, ${r.status === "ok" ? "saudável" : r.status === "warn" ? "degradado" : "crítico"}, p95 ${r.p95} ms`}
            className={cn(
              "absolute flex h-10 w-[124px] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-sm border px-2.5 text-left",
              "transition-[border-color,background-color,opacity] duration-[var(--d-fast)] ease-[var(--ease-out)]",
              isSel
                ? "border-signal bg-petrol shadow-[var(--glow-signal)]"
                : r.status === "warn"
                  ? "border-[rgba(242,181,68,0.5)] bg-surface-2"
                  : r.status === "crit"
                    ? "border-[rgba(255,107,94,0.6)] bg-surface-2"
                    : "border-line-strong bg-surface-2 hover:border-[rgba(190,220,255,0.34)]",
              !visible && "pointer-events-none opacity-25",
            )}
            style={{ left: `${(px(s.x) / W) * 100}%`, top: `${(py(s.y) / H) * 100}%` }}
          >
            <Icon aria-hidden className="size-3.5 shrink-0 text-dim" />
            <span className="num min-w-0 flex-1 truncate text-[11px] text-text">{shortName(s.label)}</span>
            <HealthGlyph status={r.status} className={tone[r.status]} />
          </button>
        );
      })}
    </div>
  );
}
