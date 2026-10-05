import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useCallback, useId, useRef, useState, type FormEvent } from "react";
import { cn } from "../../lib/cn";
import { DUR, EASE_OUT } from "../../lib/motion";
import { Button } from "../ui/Button";

type FormState = "idle" | "submitting" | "success";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Observatory horizon: concentric arcs, ticks and a slow scan line. */
function Horizon({ active }: { active: boolean }) {
  const arcs = [180, 300, 420, 540, 660, 780];
  return (
    <svg
      viewBox="-800 -800 1600 820"
      className="pointer-events-none absolute bottom-0 left-1/2 h-[min(820px,110vw)] w-[max(1600px,160vw)] -translate-x-1/2"
      aria-hidden
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <radialGradient id="horizon-glow" cx="0" cy="0" r="800" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgba(79,216,235,0.14)" />
          <stop offset="0.6" stopColor="rgba(79,216,235,0.03)" />
          <stop offset="1" stopColor="rgba(79,216,235,0)" />
        </radialGradient>
      </defs>
      <path d="M-800 0 A800 800 0 0 1 800 0 Z" fill="url(#horizon-glow)" />
      <line x1="-800" x2="800" y1="-0.5" y2="-0.5" stroke="rgba(190,220,255,0.16)" />
      {arcs.map((r, i) => (
        <path
          key={r}
          d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0`}
          fill="none"
          stroke={i === 2 ? "rgba(79,216,235,0.35)" : "rgba(190,220,255,0.09)"}
          strokeDasharray={i % 2 ? "2 8" : undefined}
        />
      ))}
      {Array.from({ length: 37 }, (_, i) => {
        const a = Math.PI - (i / 36) * Math.PI;
        const r0 = 790;
        const r1 = i % 6 === 0 ? 760 : 776;
        return (
          <line
            key={i}
            x1={Math.cos(a) * r0}
            y1={-Math.sin(a) * r0}
            x2={Math.cos(a) * r1}
            y2={-Math.sin(a) * r1}
            stroke="rgba(190,220,255,0.18)"
          />
        );
      })}
      {/* Nodes resting on the arcs */}
      {[
        [300, 0.78],
        [420, 0.35],
        [540, 0.62],
        [660, 0.18],
        [420, 0.88],
        [780, 0.46],
        [180, 0.5],
      ].map(([r, t], i) => {
        const a = Math.PI - t * Math.PI;
        return <circle key={i} cx={Math.cos(a) * r} cy={-Math.sin(a) * r} r={i === 2 ? 5 : 3.5} fill={i === 2 ? "var(--signal)" : "#c9dae8"} opacity={i === 2 ? 1 : 0.6} />;
      })}
      <g className={cn("horizon-sweep", !active && "[animation-play-state:paused]")}>
        <line x1="0" y1="0" x2="780" y2="0" stroke="rgba(79,216,235,0.4)" />
        <circle cx="780" cy="0" r="4" fill="var(--signal)" />
      </g>
    </svg>
  );
}

export function FinalCTA() {
  const emailId = useId();
  const roleId = useId();
  const [state, setState] = useState<FormState>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const focusOnMount = useCallback((el: HTMLDivElement | null) => el?.focus(), []);
  const inView = useInView(sectionRef, { amount: 0.2 });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (state === "submitting") return;
    if (!email.trim()) {
      setError("Informe seu e-mail corporativo para solicitar acesso.");
      return;
    }
    if (!EMAIL.test(email.trim())) {
      setError("Esse endereço parece incompleto. Use um formato como nome@empresa.com.");
      return;
    }
    setError(null);
    setState("submitting");
    // Apenas demonstração: nenhuma requisição sai do navegador.
    window.setTimeout(() => {
      setState("success");
    }, 1200);
  };

  return (
    <section
      ref={sectionRef}
      id="acesso"
      aria-labelledby="access-title"
      className="relative isolate overflow-hidden border-t border-line pt-24 pb-[min(48vw,420px)] md:pt-36"
    >
      <Horizon active={inView} />
      <div className="container-x relative grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <h2 id="access-title" className="font-display display-xl text-text">
            Torne o invisível operacional.
          </h2>
          <p className="mt-6 max-w-[36rem] text-lg leading-relaxed text-muted">
            Construa uma relação mais clara com cada sistema do qual seu produto depende.
          </p>
          <div className="mt-8">
            <Button href="#arquitetura" variant="secondary" size="lg" arrow>
              Explorar a arquitetura
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="glass rounded-lg border border-line-strong p-6 shadow-[var(--shadow-3)] md:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {state !== "success" ? (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={submit}
                  exit={{ opacity: 0, y: -6, transition: { duration: DUR.fast } }}
                  aria-describedby="access-note"
                >
                  <p className="text-text">Acesso antecipado, turma do 4º trimestre</p>
                  <p className="mt-1 text-sm text-muted">Integramos alguns times por semana, com um engenheiro na chamada.</p>

                  <div className="mt-6 flex flex-col gap-2">
                    <label htmlFor={emailId} className="text-sm text-text">
                      E-mail corporativo
                    </label>
                    <input
                      id={emailId}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      aria-invalid={!!error}
                      aria-describedby={error ? `${emailId}-error` : `${emailId}-help`}
                      placeholder="nome@empresa.com"
                      className={cn(
                        "h-12 rounded-sm border bg-surface-2 px-3.5 text-text placeholder:text-dim",
                        "transition-[border-color,box-shadow] duration-[var(--d-fast)] focus:outline-none",
                        error
                          ? "border-crit focus:shadow-[0_0_0_3px_rgba(255,107,94,0.2)]"
                          : "border-line-strong focus:border-signal focus:shadow-[0_0_0_3px_rgba(79,216,235,0.18)]",
                      )}
                    />
                    {error ? (
                      <p id={`${emailId}-error`} role="alert" className="flex items-start gap-1.5 text-sm text-crit">
                        <WarningCircleIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
                        {error}
                      </p>
                    ) : (
                      <p id={`${emailId}-help`} className="text-sm text-dim">
                        Respondemos em até dois dias úteis.
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex flex-col gap-2">
                    <label htmlFor={roleId} className="text-sm text-text">
                      O que você opera? <span className="text-dim">(opcional)</span>
                    </label>
                    <select
                      id={roleId}
                      defaultValue=""
                      className="h-12 rounded-sm border border-line-strong bg-surface-2 px-3 text-text focus:border-signal focus:outline-none"
                    >
                      <option value="">Escolha uma opção</option>
                      <option>Plataforma ou infraestrutura</option>
                      <option>SRE ou on-call</option>
                      <option>Engenharia de produto</option>
                      <option>IA e dados</option>
                    </select>
                  </div>

                  <Button type="submit" size="lg" arrow loading={state === "submitting"} className="mt-7 w-full">
                    Solicitar acesso antecipado
                  </Button>
                  <p id="access-note" className="mt-4 text-xs text-dim">
                    Formulário demonstrativo. Nada é enviado ou armazenado.
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  // Move focus to the confirmation as soon as it mounts (after the form's exit).
                  ref={focusOnMount}
                  tabIndex={-1}
                  role="status"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_OUT } }}
                  className="py-6 focus:outline-none"
                >
                  <CheckCircleIcon aria-hidden weight="light" className="size-10 text-ok" />
                  <p className="font-display mt-4 text-2xl text-text">Você está na lista.</p>
                  <p className="mt-2 text-muted">
                    Vamos escrever para <span className="num break-all text-text">{email.trim()}</span> em até dois dias úteis para agendar
                    uma sessão de mapeamento.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setState("idle");
                      setEmail("");
                    }}
                    className="mt-6 h-11 text-sm text-muted underline underline-offset-4 hover:text-text"
                  >
                    Usar outro e-mail
                  </button>
                  <p className="mt-2 text-xs text-dim">Apenas demonstração. Nada foi enviado.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
