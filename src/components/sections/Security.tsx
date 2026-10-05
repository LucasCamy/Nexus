import {
  BellRingingIcon,
  ClockCounterClockwiseIcon,
  EyeIcon,
  FingerprintIcon,
  ListMagnifyingGlassIcon,
  StackIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { DUR, EASE_OUT } from "../../lib/motion";
import { SectionHeading } from "../ui/SectionHeading";

const RINGS = ["Organização", "Workspace", "Ambiente", "Serviço"] as const;

const PILLARS = [
  {
    id: "access",
    title: "Controle de acesso",
    icon: FingerprintIcon,
    ring: 0,
    text: "SSO e SCIM por padrão. Papéis definem quem pode ver, alterar ou aprovar, até o nível de um único serviço.",
    facts: ["SAML, OIDC, SCIM 2.0", "Políticas de aprovação por ambiente", "Elevação temporária e just-in-time"],
  },
  {
    id: "audit",
    title: "Auditoria",
    icon: ListMagnifyingGlassIcon,
    ring: 0,
    text: "Cada visualização, consulta, aprovação e ação automatizada é gravada em um registro append-only que você pode exportar.",
    facts: ["Cadeia de hashes à prova de adulteração", "Exportação para o seu SIEM", "Ações de agentes atribuídas como as de pessoas"],
  },
  {
    id: "isolation",
    title: "Isolamento",
    icon: StackIcon,
    ring: 2,
    text: "Ambientes nunca compartilham credenciais, chaves ou rotas de rede. Dados de produção ficam na sua região.",
    facts: ["Chaves de criptografia por ambiente", "Residência regional de dados", "Sem computação compartilhada entre tenants"],
  },
  {
    id: "observability",
    title: "Observabilidade",
    icon: EyeIcon,
    ring: 3,
    text: "O NEXUS monitora os próprios coletores e pipelines com o mesmo rigor que aplica aos seus.",
    facts: ["Saúde dos coletores em cada nó", "Alarme de atraso de ingestão em 30 s", "Status público do control plane"],
  },
  {
    id: "alerts",
    title: "Alertas",
    icon: BellRingingIcon,
    ring: 1,
    text: "O roteamento segue os responsáveis no mapa, então quem é acionado é o time que pode resolver.",
    facts: ["Roteamento por responsável", "Deduplicação por incidente", "Escalonamento com confirmação"],
  },
  {
    id: "history",
    title: "Histórico operacional",
    icon: ClockCounterClockwiseIcon,
    ring: 1,
    text: "Reveja o mapa em qualquer minuto do último ano para saber o que mudou, o que quebrou e quem agiu.",
    facts: ["400 dias de histórico de topologia", "Replay em qualquer ponto no tempo", "Deploys e incidentes vinculados"],
  },
] as const;

/* DEMONSTRAÇÃO: pessoas e ações fictícias. */
const AUDIT_FEED = [
  { who: "m.okafor", action: "aprovou", target: "wf-cache: escalar search-svc", env: "prod" },
  { who: "triage-agent", action: "propôs", target: "TTL do cache em 120 s", env: "prod" },
  { who: "l.haddad", action: "consultou", target: "plano de consulta do postgres-primary", env: "prod" },
  { who: "ci-pipeline", action: "publicou", target: "checkout-svc build 4822", env: "prod" },
  { who: "r.montiel", action: "bloqueou", target: "promoção do 4823-rc1", env: "stg" },
  { who: "scim-sync", action: "removeu", target: "acesso de 1 usuário desligado", env: "org" },
  { who: "a.lindqvist", action: "exportou", target: "log de auditoria, últimos 30 dias", env: "org" },
  { who: "capacity-agent", action: "previu", target: "storage do warehouse, 90 dias", env: "prod" },
];

function clock(offset: number) {
  const base = 14 * 3600 + 6 * 60 + 12 + offset * 37;
  const h = Math.floor(base / 3600) % 24;
  const m = Math.floor((base % 3600) / 60);
  const s = base % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function AuditTrail() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [tick, setTick] = useState(5);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || !inView || paused) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 2600);
    return () => window.clearInterval(id);
  }, [reduced, inView, paused]);

  const rows = Array.from({ length: 5 }, (_, i) => {
    const n = tick - i;
    return { n, time: clock(n), ...AUDIT_FEED[((n % AUDIT_FEED.length) + AUDIT_FEED.length) % AUDIT_FEED.length] };
  });

  return (
    <div ref={ref} className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <p className="label-mono flex items-center gap-2 uppercase text-muted">
          <span aria-hidden className="size-1.5 rounded-full bg-ok" />
          Registro de auditoria
        </p>
        {!reduced && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="label-mono -my-1 h-9 rounded-sm px-2 text-dim transition-colors hover:text-text"
          >
            {paused ? "Retomar" : "Pausar"}
          </button>
        )}
      </div>
      <ol className="relative" aria-label="Entradas recentes de auditoria, dados demonstrativos">
        <AnimatePresence initial={false}>
          {rows.map((r, i) => (
            <motion.li
              key={r.n}
              layout={!reduced}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1 - i * 0.14, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.base, ease: EASE_OUT }}
              className="num grid grid-cols-[4.5rem_1fr] gap-x-3 border-b border-line px-4 py-2.5 text-xs last:border-b-0 sm:grid-cols-[4.5rem_8.5rem_1fr_2.5rem]"
            >
              <span className="text-dim">{r.time}</span>
              <span className="truncate text-text">{r.who}</span>
              <span className="col-span-2 truncate text-muted sm:col-span-1">
                <span className="text-signal">{r.action}</span> {r.target}
              </span>
              <span className="hidden text-right text-dim sm:inline">{r.env}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </div>
  );
}

function IsolationRings({ activeRing, label }: { activeRing: number; label: string }) {
  const radii = [148, 112, 76, 40];
  return (
    <figure className="relative mx-auto aspect-square w-full max-w-[22rem]">
      <svg viewBox="-160 -160 320 320" className="h-full w-full" aria-hidden>
        {radii.map((r, i) => {
          const on = i === activeRing;
          return (
            <g key={r}>
              <circle
                r={r}
                fill={on ? "rgba(79,216,235,0.07)" : i === 3 ? "var(--surface-2)" : "transparent"}
                stroke={on ? "var(--signal)" : "var(--line-strong)"}
                strokeWidth={on ? 1.5 : 1}
                strokeDasharray={i === 0 ? "2 5" : undefined}
                style={{ transition: "stroke 280ms var(--ease-out), fill 280ms var(--ease-out)" }}
              />
              <text
                y={-r + 14}
                textAnchor="middle"
                className={cn("font-mono text-[8.5px] uppercase tracking-[0.12em]", on ? "fill-[var(--signal)]" : "fill-[var(--text-dim)]")}
              >
                {RINGS[i]}
              </text>
            </g>
          );
        })}
        {/* Boundary ticks */}
        {Array.from({ length: 48 }, (_, i) => {
          const a = (i / 48) * Math.PI * 2;
          const r0 = 150;
          const r1 = i % 4 === 0 ? 158 : 154;
          return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke="var(--line-strong)" />;
        })}
        <circle r={5} fill="var(--signal)" />
      </svg>
      <figcaption className="sr-only">Camadas de isolamento, da organização até um único serviço. Camada destacada: {RINGS[activeRing]}, para {label}.</figcaption>
    </figure>
  );
}

const RELIABILITY = [
  { value: "99,99%", label: "SLA do control plane" },
  { value: "60 s", label: "Objetivo de ponto de recuperação (RPO)" },
  { value: "< 5 min", label: "Failover regional" },
  { value: "400 dias", label: "Retenção de auditoria e topologia" },
];

export function Security() {
  const [activeId, setActiveId] = useState<(typeof PILLARS)[number]["id"]>("access");
  const active = PILLARS.find((p) => p.id === activeId)!;

  return (
    <section id="seguranca" aria-labelledby="security-title" className="relative border-t border-line bg-bg-raised py-24 md:py-36">
      <div className="container-x">
        <SectionHeading
          id="security-title"
          eyebrow="Segurança e confiabilidade"
          title="Feito para sistemas que não podem desaparecer."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Pillar selector */}
          <div className="lg:col-span-5">
            <ul className="border-t border-line">
              {PILLARS.map((p) => {
                const on = p.id === activeId;
                return (
                  <li key={p.id} className="border-b border-line">
                    <button
                      type="button"
                      onClick={() => setActiveId(p.id)}
                      aria-expanded={on}
                      aria-controls={`pillar-${p.id}`}
                      className="group flex min-h-14 w-full items-center gap-4 py-3 text-left"
                    >
                      <p.icon aria-hidden weight="light" className={cn("size-5 shrink-0 transition-colors", on ? "text-signal" : "text-dim group-hover:text-muted")} />
                      <span className={cn("font-display text-lg transition-colors", on ? "text-text" : "text-muted group-hover:text-text")}>{p.title}</span>
                      <span className="label-mono ml-auto text-dim">{RINGS[p.ring].toLowerCase()}</span>
                    </button>
                    <div id={`pillar-${p.id}`} hidden={!on} className="pb-5 pl-9">
                      <p className="text-muted">{p.text}</p>
                      <ul className="mt-3 space-y-1.5">
                        {p.facts.map((f) => (
                          <li key={f} className="num flex items-center gap-2 text-xs text-text">
                            <span aria-hidden className="h-px w-3 bg-signal" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Instruments */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="panel dot-grid grid gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] sm:items-center md:p-8">
              <IsolationRings activeRing={active.ring} label={active.title} />
              <div>
                <p className="label-mono uppercase text-dim">Fronteira de isolamento</p>
                <p className="mt-3 text-muted">
                  <span className="text-text">{active.title}</span>: atua na camada{" "}
                  <span className="text-signal">{RINGS[active.ring].toLowerCase()}</span>.
                </p>
                <ol className="mt-5 space-y-2 border-t border-line pt-4">
                  {RINGS.map((ring, i) => {
                    const owners = PILLARS.filter((p) => p.ring === i).map((p) => p.title);
                    return (
                      <li key={ring} className="flex items-baseline gap-3 text-sm">
                        <span className={cn("num w-28 shrink-0", i === active.ring ? "text-signal" : "text-dim")}>{ring}</span>
                        <span className={i === active.ring ? "text-text" : "text-muted"}>{owners.join(", ")}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
            <AuditTrail />
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 border-t border-line lg:grid-cols-4">
          {RELIABILITY.map((r, i) => (
            <div
              key={r.label}
              className={cn(
                "border-line py-6 pr-4",
                i % 2 === 1 && "border-l pl-6",
                i >= 2 && "border-t lg:border-t-0",
                i === 2 && "lg:border-l lg:pl-6",
                i === 3 && "lg:pl-6",
              )}
            >
              <dd className="num text-3xl text-text md:text-4xl">{r.value}</dd>
              <dt className="mt-2 text-sm text-dim">{r.label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-dim">Os compromissos exibidos são ilustrativos para este produto fictício.</p>
      </div>
    </section>
  );
}
