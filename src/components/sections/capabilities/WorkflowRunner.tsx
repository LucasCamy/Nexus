import { ArrowCounterClockwiseIcon, CheckIcon, FlowArrowIcon, PlayIcon } from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../../lib/cn";

/* DEMONSTRAÇÃO: um workflow de remediação simulado. Nada é executado. */
const STEPS = [
  { id: "trigger", actor: "alerta", text: "Pressão de memória no search-svc", duration: 600 },
  { id: "triage", actor: "triage-agent", text: "Correlacionado com evictions de cache após o deploy das 13:40", duration: 1100 },
  { id: "plan", actor: "triage-agent", text: "Proposta: escalar para 6 réplicas e aumentar o TTL do cache", duration: 900 },
  { id: "approve", actor: "on-call", text: "Aprovado pelo on-call da plataforma", duration: 800 },
  { id: "apply", actor: "nexus", text: "Aplicado e verificado: p95 de volta abaixo de 240 ms", duration: 1000 },
] as const;

type RunState = "idle" | "running" | "done";

export function WorkflowRunner() {
  const reduced = useReducedMotion();
  const [state, setState] = useState<RunState>("idle");
  const [step, setStep] = useState(-1);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setState("running");
    setStep(0);
    let elapsed = 0;
    STEPS.forEach((s, i) => {
      elapsed += reduced ? 250 : s.duration;
      timers.current.push(
        window.setTimeout(() => {
          if (i === STEPS.length - 1) {
            setStep(STEPS.length);
            setState("done");
          } else {
            setStep(i + 1);
          }
        }, elapsed),
      );
    });
  };

  return (
    <article className="panel flex h-full flex-col p-6 md:p-8" aria-labelledby="cap-workflow">
      <FlowArrowIcon aria-hidden weight="light" className="size-6 text-signal" />
      <h3 id="cap-workflow" className="font-display mt-4 text-2xl text-text">
        Orquestre workflows inteligentes
      </h3>
      <p className="mt-3 text-muted">Agentes propõem, pessoas aprovam, o NEXUS aplica e verifica. Cada etapa fica registrada no mapa.</p>

      <ol className="relative mt-6 space-y-0" aria-live="polite">
        {STEPS.map((s, i) => {
          const status = step > i ? "done" : step === i ? "running" : "pending";
          return (
            <li key={s.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < STEPS.length - 1 && (
                <span aria-hidden className="absolute top-6 bottom-0 left-[9px] w-px bg-line">
                  <span
                    className={cn(
                      "absolute inset-0 origin-top bg-signal transition-transform duration-[var(--d-slow)] ease-[var(--ease-out)]",
                      step > i ? "scale-y-100" : "scale-y-0",
                    )}
                  />
                </span>
              )}
              <span
                aria-hidden
                className={cn(
                  "relative mt-0.5 grid size-[19px] shrink-0 place-items-center rounded-full border transition-colors duration-[var(--d-base)]",
                  status === "done" && "border-signal bg-signal text-signal-ink",
                  status === "running" && "border-signal text-signal",
                  status === "pending" && "border-line-strong",
                )}
              >
                {status === "done" && <CheckIcon weight="bold" className="size-2.5" />}
                {status === "running" && <span className="beacon size-1.5 rounded-full bg-signal" />}
              </span>
              <div className="min-w-0">
                <p className="label-mono text-dim">{s.actor}</p>
                <p className={cn("text-sm transition-colors duration-[var(--d-base)]", status === "pending" ? "text-dim" : "text-text")}>
                  {s.text}
                  <span className="sr-only">, {status === "done" ? "concluída" : status === "running" ? "em andamento" : "pendente"}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
        {/* One persistent button so keyboard focus is never lost between states. */}
        <button
          type="button"
          onClick={state === "running" ? undefined : run}
          aria-disabled={state === "running"}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-sm border border-line-strong px-4 text-sm text-text transition-colors duration-[var(--d-fast)]",
            state === "running" ? "cursor-progress opacity-70" : "hover:border-signal hover:text-signal",
          )}
        >
          {state === "done" ? (
            <ArrowCounterClockwiseIcon aria-hidden className="size-4" />
          ) : (
            <PlayIcon aria-hidden weight="fill" className="size-3.5" />
          )}
          {state === "running" ? "Executando" : state === "done" ? "Executar de novo" : "Executar workflow"}
        </button>
        <p className="label-mono text-dim" role="status">
          {state === "idle" && "Simulação, nada é executado"}
          {state === "running" && `Etapa ${Math.min(step + 1, STEPS.length)} de ${STEPS.length}`}
          {state === "done" && <span className="text-ok">Resolvido em 2 min 14 s</span>}
        </p>
      </div>
    </article>
  );
}
