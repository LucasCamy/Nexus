import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import { useState } from "react";
import { READOUTS, type Readout } from "../../data/telemetry";
import { cn } from "../../lib/cn";
import { HealthGlyph } from "../ui/StatusBadge";
import { Sparkline } from "../ui/Sparkline";

const stroke: Record<Readout["state"], string> = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  neutral: "var(--signal)",
};

function ReadoutItem({ r, hidden }: { r: Readout; hidden?: boolean }) {
  return (
    <li aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-4 border-r border-line px-6 py-4 sm:px-8">
      <div>
        <p className="label-mono flex items-center gap-1.5 uppercase text-dim">
          {r.state !== "neutral" && <HealthGlyph status={r.state} className={r.state === "ok" ? "text-ok" : "text-warn"} />}
          {r.label}
        </p>
        <p className="mt-1 flex items-baseline gap-1 whitespace-nowrap">
          <span className="num text-2xl text-text">{r.value}</span>
          {r.unit && <span className="num text-sm text-muted">{r.unit}</span>}
          <span className="ml-2 text-xs text-dim">{r.detail}</span>
        </p>
      </div>
      <Sparkline data={r.trend} width={64} height={28} stroke={stroke[r.state]} label={`Tendência: ${r.label}`} area={false} />
    </li>
  );
}

/** Operational readout strip. The page's single marquee: telemetry is continuous by nature. */
export function Telemetry() {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);

  return (
    <section aria-label="Leitura operacional, dados demonstrativos" className="relative border-y border-line bg-bg-raised">
      <div className="flex items-stretch">
        <div className="z-[1] flex shrink-0 items-center gap-3 border-r border-line bg-bg-raised px-3 sm:px-5">
          <span aria-hidden className="beacon size-1.5 rounded-full bg-ok" />
          <span className="label-mono hidden uppercase text-muted md:inline">Leitura ao vivo</span>
          {!reduced && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? "Retomar rolagem da leitura" : "Pausar rolagem da leitura"}
              className="grid size-11 place-items-center rounded-sm text-muted transition-colors hover:bg-surface-3 hover:text-text"
            >
              {paused ? <PlayIcon aria-hidden className="size-4" /> : <PauseIcon aria-hidden className="size-4" />}
            </button>
          )}
        </div>

        <div
          className={cn(
            "marquee relative min-w-0 flex-1 overflow-hidden",
            "[mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]",
            reduced && "overflow-x-auto [mask-image:none]",
          )}
          data-paused={paused}
        >
          <ul className={cn("flex w-max", !reduced && "marquee-track")}>
            {READOUTS.map((r) => (
              <ReadoutItem key={r.id} r={r} />
            ))}
            {!reduced && READOUTS.map((r) => <ReadoutItem key={`${r.id}-dup`} r={r} hidden />)}
          </ul>
        </div>
      </div>
    </section>
  );
}
