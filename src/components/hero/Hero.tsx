import { motion, type Variants } from "motion/react";
import { useCallback, useState } from "react";
import { DEFAULT_FOCUS_ID, NODES, TIER_LABEL, describeNode } from "../../data/topology";
import { DUR, EASE_OUT } from "../../lib/motion";
import { useMediaQuery } from "../../lib/useMediaQuery";
import type { SceneQuality } from "../../lib/webgl";
import { Button } from "../ui/Button";
import { HeroScene, type SceneMode } from "./HeroScene";
import { KindLegend, NodeInspector } from "./SceneHud";

const lines = ["Sua infraestrutura", "tem uma forma."];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const line: Variants = {
  hidden: { y: "105%" },
  show: { y: "0%", transition: { duration: DUR.hero, ease: EASE_OUT } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE_OUT } },
};

const METRICS = [
  { value: "90 s", label: "até o primeiro mapa ao vivo" },
  { value: "38", label: "integrações nativas" },
  { value: "11", label: "regiões por workspace" },
];

function SceneDescription() {
  return (
    <div className="sr-only">
      <p>
        Mapa 3D interativo de um sistema demonstrativo. O núcleo NEXUS fica no centro e observa {NODES.length} nós
        organizados em três camadas. As mesmas informações estão listadas aqui.
      </p>
      {TIER_LABEL.map((tier, t) => (
        <div key={tier}>
          <p>{tier}:</p>
          <ul>
            {NODES.filter((n) => n.tier === t).map((n) => (
              <li key={n.id}>{describeNode(n)}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const [focusedId, setFocusedId] = useState<string>(DEFAULT_FOCUS_ID);
  const [mode, setMode] = useState<{ mode: SceneMode; quality: SceneQuality }>({ mode: "poster", quality: "full" });
  const onFocus = useCallback((id: string) => setFocusedId(id), []);
  const onModeChange = useCallback((m: SceneMode, q: SceneQuality) => setMode({ mode: m, quality: q }), []);

  const hoverable = mode.mode === "3d" && mode.quality === "full";
  const hint = hoverable ? "Passe o mouse sobre um nó ou use as setas para inspecioná-lo." : "Use as setas para percorrer todos os nós.";
  const viewLabel = mode.mode === "3d" ? "Visão 3D ao vivo" : "Mapa estático";

  const scene = (
    <HeroScene focusedId={focusedId} onFocus={onFocus} onModeChange={onModeChange} className="absolute inset-0" />
  );

  return (
    <section id="topo" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      {desktop && (
        <figure className="absolute top-[var(--nav-h)] right-[-6%] bottom-[16%] left-[44%] m-0 2xl:left-[48%]" aria-label="Topologia ao vivo de um sistema demonstrativo">
          {scene}
          <SceneDescription />
        </figure>
      )}

      {/* Readability scrim behind the copy; the scene stays visible to the right. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block bg-[radial-gradient(ellipse_55%_75%_at_16%_52%,rgba(5,8,12,0.94)_0%,rgba(5,8,12,0.72)_42%,transparent_72%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />

      <div className="container-x pointer-events-none relative grid min-h-[100dvh] grid-cols-1 content-center gap-10 pt-[calc(var(--nav-h)+40px)] pb-14 lg:grid-cols-12 lg:gap-6 lg:pb-20">
        <motion.div
          className="pointer-events-auto lg:col-span-7"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p variants={rise} className="label-mono inline-flex items-center gap-2 rounded-xs border border-line-strong bg-surface/60 px-2.5 py-1.5 text-muted">
            <span aria-hidden className="size-1.5 rounded-full bg-ok" />
            Acesso antecipado aberto no 4º trimestre
          </motion.p>

          <h1 id="hero-title" className="font-display display-xl mt-7 text-text">
            {lines.map((l) => (
              <span key={l} className="block overflow-hidden pb-[0.06em]">
                <motion.span variants={line} className="block">
                  {l}
                </motion.span>
              </span>
            ))}
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span variants={line} className="block text-muted">
                Agora dá para ver.
              </motion.span>
            </span>
          </h1>

          <motion.p variants={rise} className="mt-7 max-w-[34rem] text-lg leading-relaxed text-muted">
            O NEXUS transforma sistemas distribuídos, serviços e workflows de IA em um único mapa operacional vivo.
          </motion.p>

          <motion.div variants={rise} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="#arquitetura" size="lg" arrow>
              Explorar o sistema
            </Button>
            <Button href="#plataforma" size="lg" variant="secondary">
              Ver como funciona
            </Button>
          </motion.div>

          <motion.dl variants={rise} className="mt-12 grid max-w-xl grid-cols-3 border-t border-line pt-5">
            {METRICS.map((m, i) => (
              <div key={m.label} className={i > 0 ? "border-l border-line pl-4 sm:pl-6" : "pr-4"}>
                <dt className="sr-only">{m.label}</dt>
                <dd className="num text-xl text-text sm:text-2xl">{m.value}</dd>
                <dd className="mt-1 text-xs leading-snug text-dim sm:text-sm">{m.label}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Mobile and tablet: the scene becomes an in-flow band below the copy. */}
        {!desktop && (
          <figure className="pointer-events-auto relative -mx-4 m-0 h-[340px] sm:-mx-6 sm:h-[440px]" aria-label="Topologia ao vivo de um sistema demonstrativo">
            {scene}
            <SceneDescription />
          </figure>
        )}

        <motion.div
          className="pointer-events-auto flex flex-col gap-3 self-end lg:col-span-4 lg:col-start-9 xl:col-span-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <p className="label-mono flex items-center gap-2 uppercase text-muted">
              <span aria-hidden className="size-1.5 rounded-full bg-signal" />
              prod-eu-west
            </p>
            <p className="label-mono text-dim">{viewLabel}</p>
          </div>
          <NodeInspector focusedId={focusedId} onFocus={onFocus} interactiveHint={hint} />
          <KindLegend className="px-1" />
        </motion.div>
      </div>
    </section>
  );
}
