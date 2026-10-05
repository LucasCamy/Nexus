import { CheckIcon, RobotIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { WORKFLOWS, type Workflow } from "../../../data/product";
import { cn } from "../../../lib/cn";

const STATE_LABEL: Record<Workflow["state"], { text: string; cls: string }> = {
  running: { text: "Em execução", cls: "text-signal" },
  succeeded: { text: "Concluído", cls: "text-ok" },
  scheduled: { text: "Agendado", cls: "text-muted" },
  failed: { text: "Falhou", cls: "text-crit" },
};

const STEP_LABEL = { done: "concluída", running: "em andamento", pending: "pendente", failed: "falhou" } as const;

export function WorkflowsView() {
  const [openId, setOpenId] = useState(WORKFLOWS[0].id);
  const wf = WORKFLOWS.find((w) => w.id === openId)!;

  return (
    <div className="grid gap-0 md:grid-cols-[minmax(0,15rem)_1fr]">
      <ul className="divide-y divide-line border-b border-line md:border-r md:border-b-0">
        {WORKFLOWS.map((w) => (
          <li key={w.id}>
            <button
              type="button"
              onClick={() => setOpenId(w.id)}
              aria-pressed={w.id === openId}
              className={cn("w-full px-4 py-3 text-left transition-colors", w.id === openId ? "bg-surface-3" : "hover:bg-surface-2")}
            >
              <span className="block text-sm text-text">{w.name}</span>
              <span className="mt-1 flex items-center gap-2 text-xs">
                <span className={STATE_LABEL[w.state].cls}>{STATE_LABEL[w.state].text}</span>
                <span className="text-dim">{w.kind}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="p-4 sm:p-5" aria-live="polite">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-text">{wf.name}</h4>
          <p className="label-mono text-dim">
            {wf.last}, {wf.runs} execuções
          </p>
        </div>

        {wf.reasoning && (
          <div className="mt-4 rounded-sm border border-line bg-surface-2 p-3">
            <p className="label-mono flex items-center gap-1.5 text-signal">
              <RobotIcon aria-hidden className="size-3.5" />
              raciocínio do triage-agent
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{wf.reasoning}</p>
          </div>
        )}

        <ol className="mt-4 space-y-2.5">
          {wf.steps.map((s, i) => (
            <li key={s.label} className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border text-[10px]",
                  s.status === "done" && "border-signal bg-signal text-signal-ink",
                  s.status === "running" && "border-signal text-signal",
                  s.status === "pending" && "border-line-strong text-dim",
                  s.status === "failed" && "border-crit bg-crit text-bg",
                )}
              >
                {s.status === "done" ? (
                  <CheckIcon weight="bold" className="size-2.5" />
                ) : s.status === "failed" ? (
                  <XIcon weight="bold" className="size-2.5" />
                ) : s.status === "running" ? (
                  <span className="beacon size-1.5 rounded-full bg-signal" />
                ) : (
                  i + 1
                )}
              </span>
              <span className={cn("min-w-0 flex-1", s.status === "pending" ? "text-dim" : "text-text")}>
                {s.label}
                <span className="sr-only">, {STEP_LABEL[s.status]}</span>
              </span>
              <span className="num hidden text-xs text-dim sm:inline">{s.actor}</span>
              <span className="num w-20 text-right text-xs text-dim">{s.duration ?? (s.status === "running" ? "aguardando" : "")}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
