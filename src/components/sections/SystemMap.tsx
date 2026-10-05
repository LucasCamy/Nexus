import {
  BrainIcon,
  CloudIcon,
  DatabaseIcon,
  FlowArrowIcon,
  PlugsIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Health } from "../../data/topology";
import { cn } from "../../lib/cn";
import { DUR, EASE_IN_OUT, EASE_OUT } from "../../lib/motion";
import { useInViewOnce } from "../../lib/useInViewOnce";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { SectionHeading } from "../ui/SectionHeading";
import { HealthGlyph } from "../ui/StatusBadge";

/* DADOS DEMONSTRATIVOS: domínios e leituras são fictícios. */
type DomainId = "cloud" | "apis" | "data" | "ai" | "automations" | "teams";

interface Domain {
  id: DomainId;
  label: string;
  icon: typeof CloudIcon;
  side: "source" | "consumer";
  summary: string;
  stats: { value: string; label: string }[];
  signals: { time: string; text: string; state: Health }[];
  related: DomainId[];
}

const DOMAINS: Domain[] = [
  {
    id: "cloud",
    label: "Nuvem",
    icon: CloudIcon,
    side: "source",
    summary: "Contas, clusters e serviços gerenciados de todos os provedores, reunidos em um único inventário com responsáveis definidos.",
    stats: [
      { value: "3", label: "provedores" },
      { value: "11", label: "regiões" },
      { value: "412", label: "recursos" },
    ],
    signals: [
      { time: "14:02", text: "node pool eu-west escalado de 6 para 9", state: "ok" },
      { time: "13:47", text: "2 nós spot recuperados em us-east", state: "warn" },
      { time: "13:15", text: "drift de tags corrigido em 14 recursos", state: "ok" },
    ],
    related: ["automations", "teams"],
  },
  {
    id: "apis",
    label: "APIs",
    icon: PlugsIcon,
    side: "source",
    summary: "Cada endpoint rastreado até os serviços e bancos por trás dele, incluindo chamadas a terceiros que você não controla.",
    stats: [
      { value: "64", label: "endpoints" },
      { value: "9", label: "fornecedores externos" },
      { value: "41 ms", label: "p95 na borda" },
    ],
    signals: [
      { time: "14:05", text: "schema v42 do public-graphql publicado", state: "ok" },
      { time: "13:58", text: "latência do fornecedor de pagamentos subiu 18%", state: "warn" },
      { time: "12:40", text: "3 rotas sem uso marcadas para remoção", state: "ok" },
    ],
    related: ["ai", "teams"],
  },
  {
    id: "data",
    label: "Dados",
    icon: DatabaseIcon,
    side: "source",
    summary: "Bancos, caches, streams e warehouses com lag de replicação, mudanças de schema e quem lê o quê.",
    stats: [
      { value: "23", label: "bancos de dados" },
      { value: "0,8 s", label: "lag máximo de réplica" },
      { value: "1,84M", label: "eventos por minuto" },
    ],
    signals: [
      { time: "14:01", text: "lag da postgres-replica de volta abaixo de 1 s", state: "ok" },
      { time: "13:30", text: "job de carga do warehouse com 6 min de atraso", state: "warn" },
      { time: "11:52", text: "migração da tabela orders concluída", state: "ok" },
    ],
    related: ["ai", "automations"],
  },
  {
    id: "ai",
    label: "IA",
    icon: BrainIcon,
    side: "consumer",
    summary: "Agentes e chamadas de modelo observados como qualquer outro serviço: custo, latência, uso de ferramentas e os dados que tocam.",
    stats: [
      { value: "7", label: "agentes" },
      { value: "1,3 s", label: "p95 de inferência" },
      { value: "US$ 214", label: "gasto hoje" },
    ],
    signals: [
      { time: "14:04", text: "triage-agent agrupou 31 alertas em 2", state: "ok" },
      { time: "13:51", text: "previsão do capacity-agent atualizada", state: "ok" },
      { time: "13:22", text: "orçamento de tokens em 82% no bot de suporte", state: "warn" },
    ],
    related: ["apis", "data"],
  },
  {
    id: "automations",
    label: "Automações",
    icon: FlowArrowIcon,
    side: "consumer",
    summary: "Runbooks, pipelines de deploy e workflows de remediação que agem sobre o mapa, com aprovações onde importa.",
    stats: [
      { value: "18", label: "workflows ativos" },
      { value: "212", label: "execuções nesta semana" },
      { value: "98,6%", label: "taxa de sucesso" },
    ],
    signals: [
      { time: "14:03", text: "aquecimento do cache concluído em 48 s", state: "ok" },
      { time: "13:44", text: "rollback aprovado pelo on-call", state: "ok" },
      { time: "13:10", text: "etapa instável repetida duas vezes no CI", state: "warn" },
    ],
    related: ["cloud", "data"],
  },
  {
    id: "teams",
    label: "Times",
    icon: UsersThreeIcon,
    side: "consumer",
    summary: "Responsáveis, on-call e histórico de mudanças em cada nó, para que as pessoas certas vejam o raio de impacto certo.",
    stats: [
      { value: "12", label: "times" },
      { value: "100%", label: "serviços com responsável" },
      { value: "4 min", label: "tempo mediano de ack" },
    ],
    signals: [
      { time: "14:00", text: "plantão da plataforma passado para M. Okafor", state: "ok" },
      { time: "13:36", text: "time de busca acionado por drift no p95", state: "warn" },
      { time: "12:05", text: "responsáveis definidos para 3 novos serviços", state: "ok" },
    ],
    related: ["cloud", "apis"],
  },
];

type Point = { x: number; y: number };

/** Two layouts: horizontal flow on wide screens, vertical flow on phones. */
const LAYOUTS = {
  wide: {
    viewBox: "0 0 1000 480",
    hub: { x: 500, y: 240 },
    nodes: {
      cloud: { x: 130, y: 90 },
      apis: { x: 130, y: 240 },
      data: { x: 130, y: 390 },
      ai: { x: 870, y: 90 },
      automations: { x: 870, y: 240 },
      teams: { x: 870, y: 390 },
    } as Record<DomainId, Point>,
  },
  narrow: {
    viewBox: "0 0 360 560",
    hub: { x: 180, y: 280 },
    nodes: {
      cloud: { x: 60, y: 70 },
      apis: { x: 180, y: 70 },
      data: { x: 300, y: 70 },
      ai: { x: 60, y: 490 },
      automations: { x: 180, y: 490 },
      teams: { x: 300, y: 490 },
    } as Record<DomainId, Point>,
  },
};

function edgePath(a: Point, b: Point, vertical: boolean) {
  if (vertical) {
    const my = (a.y + b.y) / 2;
    return `M${a.x},${a.y} C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`;
  }
  const mx = (a.x + b.x) / 2;
  return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
}

export function SystemMap() {
  const wide = useMediaQuery("(min-width: 768px)");
  const layout = wide ? LAYOUTS.wide : LAYOUTS.narrow;
  const [activeId, setActiveId] = useState<DomainId>("cloud");
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.35);
  const active = DOMAINS.find((d) => d.id === activeId)!;
  const lit = new Set<DomainId>([activeId, ...active.related]);
  const [vbW, vbH] = layout.viewBox.split(" ").slice(2).map(Number);

  return (
    <section id="arquitetura" aria-labelledby="architecture-title" className="relative py-24 md:py-36">
      <div className="container-x">
        <SectionHeading
          id="architecture-title"
          eyebrow="Veja o sistema inteiro"
          title="A complexidade só é invisível até você mapeá-la."
          lead="O NEXUS lê os lugares onde seu sistema vive e atende as pessoas e os agentes que o operam. Escolha um domínio para ver o que ele traz."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          {/* Diagram */}
          <div ref={ref} className="panel dot-grid relative overflow-hidden lg:col-span-8">
            <div className="label-mono flex items-center justify-between border-b border-line px-5 py-3 text-dim">
              <span className="uppercase">{wide ? "Fontes" : "Fontes, acima"}</span>
              <span className="uppercase">{wide ? "Operadores" : "Operadores, abaixo"}</span>
            </div>
            <div className="relative mx-auto w-full" style={{ aspectRatio: `${vbW} / ${vbH}`, maxWidth: wide ? undefined : 420 }}>
              <svg viewBox={layout.viewBox} className="absolute inset-0 h-full w-full" aria-hidden>
                {DOMAINS.map((d, i) => {
                  const p = layout.nodes[d.id];
                  const path = d.side === "source" ? edgePath(p, layout.hub, !wide) : edgePath(layout.hub, p, !wide);
                  const on = lit.has(d.id);
                  return (
                    <g key={d.id}>
                      <motion.path
                        d={path}
                        fill="none"
                        stroke={on ? "var(--signal)" : "rgba(147,164,182,0.28)"}
                        strokeWidth={on ? 1.5 : 1}
                        initial={{ pathLength: 0 }}
                        animate={inView ? { pathLength: 1 } : undefined}
                        transition={{ duration: 1.1, ease: EASE_IN_OUT, delay: 0.1 + i * 0.07 }}
                        style={{ transition: "stroke 280ms var(--ease-out)" }}
                      />
                      {on && inView && (
                        <path d={path} fill="none" stroke="var(--signal)" strokeWidth={2.5} strokeLinecap="round" className="flow-dash" />
                      )}
                    </g>
                  );
                })}
                {/* Hub instrument */}
                <g transform={`translate(${layout.hub.x} ${layout.hub.y})`}>
                  <circle r={wide ? 92 : 70} fill="none" stroke="rgba(79,216,235,0.18)" strokeDasharray="2 6" />
                  <circle r={wide ? 64 : 50} fill="var(--bg)" stroke="var(--line-strong)" />
                  <circle r={wide ? 64 : 50} fill="rgba(79,216,235,0.06)" />
                </g>
              </svg>

              {/* Hub label (HTML for crisp text) */}
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ left: `${(layout.hub.x / vbW) * 100}%`, top: `${(layout.hub.y / vbH) * 100}%` }}
              >
                <p className="text-sm font-semibold tracking-[0.2em] text-text [font-stretch:125%]">NEXUS</p>
                <p className="label-mono mt-0.5 text-dim">2.418 deps</p>
              </div>

              {/* Domain buttons positioned over the SVG */}
              {DOMAINS.map((d) => {
                const p = layout.nodes[d.id];
                const Icon = d.icon;
                const isActive = d.id === activeId;
                const isRelated = !isActive && lit.has(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setActiveId(d.id)}
                    onMouseEnter={() => wide && setActiveId(d.id)}
                    aria-pressed={isActive}
                    aria-controls="domain-detail"
                    className={cn(
                      "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-sm p-1.5",
                      "transition-colors duration-[var(--d-fast)]",
                    )}
                    style={{ left: `${(p.x / vbW) * 100}%`, top: `${(p.y / vbH) * 100}%` }}
                  >
                    <span
                      className={cn(
                        "grid size-12 place-items-center rounded-sm border bg-surface transition-[border-color,background-color,color,box-shadow] duration-[var(--d-base)] ease-[var(--ease-out)] md:size-14",
                        isActive
                          ? "border-signal bg-petrol text-signal shadow-[var(--glow-signal)]"
                          : isRelated
                            ? "border-[rgba(79,216,235,0.45)] text-text"
                            : "border-line-strong text-muted hover:border-[rgba(190,220,255,0.32)] hover:text-text",
                      )}
                    >
                      <Icon aria-hidden weight="light" className="size-6" />
                    </span>
                    <span className={cn("text-xs md:text-sm", isActive ? "text-text" : "text-muted")}>{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context panel */}
          <div id="domain-detail" aria-live="polite" className="panel relative flex flex-col p-6 lg:col-span-4 lg:p-7">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_OUT } }}
                exit={{ opacity: 0, y: -4, transition: { duration: DUR.fast } }}
                className="flex h-full flex-col"
              >
                <div className="flex items-center gap-3">
                  <active.icon aria-hidden weight="light" className="size-6 text-signal" />
                  <h3 className="font-display text-2xl text-text">{active.label}</h3>
                  <span className="label-mono ml-auto text-dim">{active.side === "source" ? "fonte" : "operador"}</span>
                </div>
                <p className="mt-4 text-muted">{active.summary}</p>

                <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-line py-5">
                  {active.stats.map((s) => (
                    <div key={s.label}>
                      <dd className="num text-xl text-text">{s.value}</dd>
                      <dt className="mt-1 text-xs leading-snug text-dim">{s.label}</dt>
                    </div>
                  ))}
                </dl>

                <p className="label-mono mt-6 uppercase text-dim">Sinais recentes</p>
                <ul className="mt-3 space-y-3">
                  {active.signals.map((s) => (
                    <li key={s.text} className="flex items-start gap-3 text-sm">
                      <span className="num pt-px text-dim">{s.time}</span>
                      <HealthGlyph status={s.state} className={cn("mt-1.5", s.state === "ok" ? "text-ok" : "text-warn")} />
                      <span className="text-text">{s.text}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-auto pt-6 text-sm text-dim">
                  Conectado a{" "}
                  {active.related.map((r, i) => (
                    <span key={r}>
                      <button
                        type="button"
                        onClick={() => setActiveId(r)}
                        className="text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-signal"
                      >
                        {DOMAINS.find((d) => d.id === r)!.label}
                      </button>
                      {i < active.related.length - 1 ? " e " : "."}
                    </span>
                  ))}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
