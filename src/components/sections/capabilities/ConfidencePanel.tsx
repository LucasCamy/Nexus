import { ShieldCheckIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { EASE_IN_OUT, EASE_OUT } from "../../../lib/motion";
import { useInViewOnce } from "../../../lib/useInViewOnce";

/* DEMONSTRAÇÃO: um incidente fictício, minuto a minuto. */
const START = 2 * 60 + 2; // 14:02 in minutes after 12:00
const END = 2 * 60 + 11;
const EVENTS = [
  { t: "14:02", min: 122, label: "Detectado", text: "Taxa de erro do checkout-svc passa de 2%", tone: "crit" },
  { t: "14:03", min: 123, label: "Triado", text: "triage-agent associa ao deploy 4821", tone: "warn" },
  { t: "14:05", min: 125, label: "Decidido", text: "On-call aprova o rollback direto do mapa", tone: "warn" },
  { t: "14:06", min: 126, label: "Revertido", text: "Build anterior restaurado em 2 regiões", tone: "signal" },
  { t: "14:09", min: 129, label: "Resolvido", text: "Taxa de erro em 0,04%, SLO intacto", tone: "ok" },
] as const;

const toneClass = {
  crit: "bg-crit",
  warn: "bg-warn",
  signal: "bg-signal",
  ok: "bg-ok",
} as const;

const pct = (min: number) => 9 + ((min - START) / (END - START)) * 84;

export function ConfidencePanel() {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.35);

  return (
    <article className="panel relative overflow-hidden bg-[linear-gradient(180deg,var(--surface),var(--bg-raised))]" aria-labelledby="cap-confidence">
      <div className="grid gap-10 p-6 md:p-8 lg:grid-cols-12 lg:gap-8 lg:p-10">
        <div className="lg:col-span-4">
          <ShieldCheckIcon aria-hidden weight="light" className="size-6 text-signal" />
          <h3 id="cap-confidence" className="font-display mt-4 text-2xl text-text md:text-[1.75rem]">
            Opere com confiança
          </h3>
          <p className="mt-3 text-muted">
            Quando algo quebra, o mapa já sabe o que mudou, quem é o responsável e como desfazer.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <dd className="num text-4xl text-text">7 min</dd>
              <dt className="mt-2 text-sm text-dim">tempo mediano de recuperação, antes 41 min</dt>
            </div>
            <div>
              <dd className="num text-4xl text-text">0</dd>
              <dt className="mt-2 text-sm text-dim">mudanças publicadas sem responsável conhecido</dt>
            </div>
          </dl>
          <p className="mt-6 text-xs text-dim">Números de um workspace demonstrativo.</p>
        </div>

        <div ref={ref} className="lg:col-span-8">
          <div className="flex items-baseline justify-between gap-4">
            <p className="label-mono text-muted">INC-2291 erros no checkout</p>
            <p className="label-mono text-ok">resolvido em 7 min</p>
          </div>

          {/* Desktop: proportional time axis */}
          <div className="relative mt-10 hidden h-56 md:block">
            <div className="absolute top-1/2 right-0 left-0 h-px bg-line-strong" />
            <motion.div
              aria-hidden
              className="absolute top-1/2 h-px origin-left bg-signal"
              style={{ left: `${pct(122)}%`, width: `${pct(129) - pct(122)}%` }}
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : undefined}
              transition={{ duration: 1.6, ease: EASE_IN_OUT }}
            />
            <ol>
              {EVENTS.map((e, i) => {
                const above = i % 2 === 0;
                return (
                  <motion.li
                    key={e.t}
                    className="absolute top-1/2 w-44 -translate-x-1/2"
                    style={{ left: `${pct(e.min)}%` }}
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : undefined}
                    transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.2 + ((pct(e.min) - 9) / 84) * 1.4 }}
                  >
                    <span aria-hidden className={cn("absolute top-0 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-[var(--surface)]", toneClass[e.tone])} />
                    <span aria-hidden className={cn("absolute left-1/2 h-8 w-px bg-line-strong", above ? "bottom-2" : "top-2")} />
                    <div className={cn("absolute left-0 w-full text-center", above ? "bottom-11" : "top-11")}>
                      <p className="num text-xs text-dim">{e.t}</p>
                      <p className="mt-0.5 text-sm font-medium text-text">{e.label}</p>
                      <p className="mt-0.5 text-xs leading-snug text-muted">{e.text}</p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>

          {/* Mobile: vertical timeline */}
          <ol className="mt-6 space-y-5 border-l border-line-strong pl-5 md:hidden">
            {EVENTS.map((e) => (
              <li key={e.t} className="relative">
                <span aria-hidden className={cn("absolute top-1.5 -left-[25px] size-2.5 rounded-full ring-4 ring-[var(--surface)]", toneClass[e.tone])} />
                <p className="num text-xs text-dim">{e.t}</p>
                <p className="text-sm font-medium text-text">{e.label}</p>
                <p className="text-sm text-muted">{e.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
}
