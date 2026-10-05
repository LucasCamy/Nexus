import { FlowArrowIcon, GraphIcon, ListBulletsIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ENVIRONMENTS, EVENTS, READINGS, SERVICES, type EnvId } from "../../data/product";
import type { Health } from "../../data/topology";
import { cn } from "../../lib/cn";
import { DUR, EASE_OUT } from "../../lib/motion";
import { useInViewOnce } from "../../lib/useInViewOnce";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { SectionHeading } from "../ui/SectionHeading";
import { HealthGlyph } from "../ui/StatusBadge";
import { EventsView } from "./product/EventsView";
import { ServiceDetail } from "./product/ServiceDetail";
import { ServiceMapView } from "./product/ServiceMapView";
import { WorkflowsView } from "./product/WorkflowsView";

type TabId = "map" | "events" | "workflows";
const TABS: { id: TabId; label: string; short: string; icon: typeof GraphIcon }[] = [
  { id: "map", label: "Mapa de serviços", short: "Mapa", icon: GraphIcon },
  { id: "events", label: "Eventos", short: "Eventos", icon: ListBulletsIcon },
  { id: "workflows", label: "Workflows", short: "Workflows", icon: FlowArrowIcon },
];

type MapFilter = "all" | "attention";
type EventFilter = "all" | "crit" | "warn" | "info";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-sm border px-3 text-xs whitespace-nowrap transition-colors duration-[var(--d-fast)]",
        active ? "border-signal bg-[var(--signal-soft)] text-text" : "border-line-strong text-muted hover:text-text",
      )}
    >
      {children}
    </button>
  );
}

export function ProductPreview() {
  const [env, setEnv] = useState<EnvId>("production");
  const [tab, setTab] = useState<TabId>("map");
  const [selectedId, setSelectedId] = useState("search");
  const [mapFilter, setMapFilter] = useState<MapFilter>("all");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [query, setQuery] = useState("");
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ map: null, events: null, workflows: null });
  const lg = useMediaQuery("(min-width: 1024px)");
  const [frameRef, inView] = useInViewOnce<HTMLDivElement>(0.15);

  const readings = READINGS[env];
  const q = query.trim().toLowerCase();

  const counts = useMemo(() => {
    const c: Record<Health, number> = { ok: 0, warn: 0, crit: 0 };
    Object.values(readings).forEach((r) => c[r.status]++);
    return c;
  }, [readings]);

  const visibleIds = useMemo(
    () =>
      new Set(
        SERVICES.filter((s) => (mapFilter === "all" || readings[s.id].status !== "ok") && (!q || s.label.includes(q))).map(
          (s) => s.id,
        ),
      ),
    [mapFilter, readings, q],
  );

  const events = useMemo(
    () =>
      EVENTS[env].filter((e) => {
        const svc = SERVICES.find((s) => s.id === e.service)!;
        const sevOk = eventFilter === "all" || (eventFilter === "info" ? e.severity === "info" || e.severity === "ok" : e.severity === eventFilter);
        return sevOk && (!q || svc.label.includes(q) || e.text.toLowerCase().includes(q));
      }),
    [env, eventFilter, q],
  );

  const clearFilters = () => {
    setQuery("");
    setMapFilter("all");
    setEventFilter("all");
  };

  const changeEnv = (next: EnvId) => {
    setEnv(next);
    // Keep focus on something meaningful: the most urgent service in the new environment.
    const urgent = SERVICES.find((s) => READINGS[next][s.id].status === "crit") ?? SERVICES.find((s) => READINGS[next][s.id].status === "warn");
    if (urgent) setSelectedId(urgent.id);
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keysNext = lg ? ["ArrowDown", "ArrowRight"] : ["ArrowRight"];
    const keysPrev = lg ? ["ArrowUp", "ArrowLeft"] : ["ArrowLeft"];
    let next = -1;
    if (keysNext.includes(e.key)) next = (index + 1) % TABS.length;
    if (keysPrev.includes(e.key)) next = (index - 1 + TABS.length) % TABS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = TABS.length - 1;
    if (next >= 0) {
      e.preventDefault();
      setTab(TABS[next].id);
      tabRefs.current[TABS[next].id]?.focus();
    }
  };

  const mapEmpty = tab === "map" && visibleIds.size === 0;
  const eventsEmpty = tab === "events" && events.length === 0;

  return (
    <section id="observabilidade" aria-labelledby="observability-title" className="relative py-24 md:py-36">
      <div className="container-x">
        <SectionHeading
          id="observability-title"
          title="Uma tela para toda a operação."
          lead="Uma prévia funcional com dados demonstrativos. Troque de ambiente, filtre o ruído e abra qualquer serviço."
        />

        <div className="mt-14 [perspective:1600px]">
          <motion.div
            ref={frameRef}
            initial={{ opacity: 0, rotateX: 8, y: 40 }}
            animate={inView ? { opacity: 1, rotateX: 0, y: 0 } : undefined}
            transition={{ duration: 0.9, ease: EASE_OUT }}
            className="origin-top overflow-hidden rounded-lg border border-line-strong bg-surface shadow-[var(--shadow-3)]"
          >
            {/* Top bar */}
            <div className="flex flex-wrap items-center gap-3 border-b border-line bg-bg-raised px-3 py-2.5 sm:px-4">
              <p className="num mr-auto flex min-w-0 items-center gap-2 text-sm text-muted">
                <span className="truncate text-text">northwind-retail</span>
                <span aria-hidden className="text-dim">/</span>
                <span className="truncate">{ENVIRONMENTS.find((e) => e.id === env)!.label.toLowerCase()}</span>
              </p>

              <div role="radiogroup" aria-label="Ambiente" className="order-3 flex w-full rounded-sm border border-line-strong p-0.5 sm:order-none sm:w-auto">
                {ENVIRONMENTS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    role="radio"
                    aria-checked={env === e.id}
                    onClick={() => changeEnv(e.id)}
                    className={cn(
                      "h-9 flex-1 rounded-[6px] px-3 text-xs transition-colors duration-[var(--d-fast)] sm:flex-none",
                      env === e.id ? "bg-surface-3 text-text" : "text-muted hover:text-text",
                    )}
                  >
                    {e.label}
                  </button>
                ))}
              </div>

              <label className="relative order-2 flex h-9 items-center sm:order-none">
                <span className="sr-only">Filtrar serviços e eventos</span>
                <MagnifyingGlassIcon aria-hidden className="pointer-events-none absolute left-2.5 size-3.5 text-dim" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrar"
                  className="num h-9 w-32 rounded-sm border border-line-strong bg-surface-2 pr-2 pl-8 text-xs text-text placeholder:text-dim focus:border-signal focus:outline-none sm:w-44"
                />
              </label>
            </div>

            <div className="grid lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_19rem]">
              {/* Sidebar: tabs + health summary */}
              <div className="flex flex-col border-b border-line lg:border-r lg:border-b-0">
                <div
                  role="tablist"
                  aria-label="Visões do produto"
                  aria-orientation={lg ? "vertical" : "horizontal"}
                  className="grid grid-cols-3 gap-1 p-2 lg:flex lg:flex-col"
                >
                  {TABS.map((t, i) => (
                    <button
                      key={t.id}
                      ref={(el) => {
                        tabRefs.current[t.id] = el;
                      }}
                      id={`tab-${t.id}`}
                      role="tab"
                      type="button"
                      aria-selected={tab === t.id}
                      aria-controls={`panel-${t.id}`}
                      tabIndex={tab === t.id ? 0 : -1}
                      onClick={() => setTab(t.id)}
                      onKeyDown={(e) => onTabKey(e, i)}
                      className={cn(
                        "flex h-10 shrink-0 items-center justify-center gap-2.5 rounded-sm px-2 text-sm whitespace-nowrap transition-colors duration-[var(--d-fast)] lg:justify-start lg:px-3",
                        tab === t.id ? "bg-surface-3 text-text" : "text-muted hover:bg-surface-2 hover:text-text",
                      )}
                    >
                      <t.icon aria-hidden className={cn("hidden size-4 sm:block", tab === t.id && "text-signal")} />
                      <span className="sm:hidden">{t.short}</span>
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  ))}
                </div>
                <div className="hidden border-t border-line p-4 lg:mt-auto lg:block">
                  <p className="label-mono text-dim">saúde, {ENVIRONMENTS.find((e) => e.id === env)!.label.toLowerCase()}</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {(["ok", "warn", "crit"] as Health[]).map((h) => (
                      <li key={h} className="flex items-center gap-2">
                        <HealthGlyph status={h} className={h === "ok" ? "text-ok" : h === "warn" ? "text-warn" : "text-crit"} />
                        <span className="text-muted">{h === "ok" ? "Saudável" : h === "warn" ? "Degradado" : "Crítico"}</span>
                        <span className="num ml-auto text-text">{counts[h]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Main panel */}
              <div className="min-w-0">
                {tab !== "workflows" && (
                  <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5 sm:px-4">
                    {tab === "map" ? (
                      <>
                        <Chip active={mapFilter === "all"} onClick={() => setMapFilter("all")}>
                          Todos os serviços
                        </Chip>
                        <Chip active={mapFilter === "attention"} onClick={() => setMapFilter("attention")}>
                          Precisam de atenção <span className="num text-dim">{counts.warn + counts.crit}</span>
                        </Chip>
                      </>
                    ) : (
                      (["all", "crit", "warn", "info"] as EventFilter[]).map((f) => (
                        <Chip key={f} active={eventFilter === f} onClick={() => setEventFilter(f)}>
                          {f === "all" ? "Todos" : f === "crit" ? "Crítico" : f === "warn" ? "Alerta" : "Info"}
                        </Chip>
                      ))
                    )}
                    <span className="label-mono ml-auto hidden text-dim sm:inline">última 1h</span>
                  </div>
                )}

                <div
                  id={`panel-${tab}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${tab}`}
                  tabIndex={0}
                  className="dot-grid min-h-[22rem] focus-visible:outline-offset-[-2px]"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={tab + env}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: DUR.base, ease: EASE_OUT } }}
                      exit={{ opacity: 0, transition: { duration: DUR.micro } }}
                      className={cn(tab === "map" && "p-2 sm:p-4")}
                    >
                      {(mapEmpty || eventsEmpty) && (
                        <div className="flex min-h-[20rem] flex-col items-center justify-center gap-3 p-8 text-center">
                          <p className="text-text">Nada corresponde a estes filtros.</p>
                          <p className="max-w-xs text-sm text-muted">
                            {tab === "map" ? "Todos os serviços desta visão estão saudáveis." : "Nenhum evento desse tipo na última hora."}
                          </p>
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-1 inline-flex h-10 items-center rounded-sm border border-line-strong px-4 text-sm text-text hover:border-signal hover:text-signal"
                          >
                            Limpar filtros
                          </button>
                        </div>
                      )}
                      {tab === "map" && !mapEmpty && (
                        <ServiceMapView readings={readings} selectedId={selectedId} onSelect={setSelectedId} visibleIds={visibleIds} />
                      )}
                      {tab === "events" && !eventsEmpty && <EventsView events={events} selectedId={selectedId} onSelect={setSelectedId} />}
                      {tab === "workflows" && <WorkflowsView />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Detail panel */}
              <div className="border-t border-line p-4 sm:p-5 lg:col-span-2 xl:col-span-1 xl:border-t-0 xl:border-l">
                <ServiceDetail serviceId={selectedId} reading={readings[selectedId]} events={EVENTS[env]} onSelect={setSelectedId} />
              </div>
            </div>
          </motion.div>
        </div>
        <p className="mt-4 text-sm text-dim">Prévia da interface com dados demonstrativos. Os valores não refletem um sistema real.</p>
      </div>
    </section>
  );
}
