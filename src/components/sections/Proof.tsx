import type { ReactNode } from "react";
import { useInViewOnce } from "../../lib/useInViewOnce";
import { motion } from "motion/react";
import { EASE_OUT } from "../../lib/motion";

/*
 * CONTEÚDO DEMONSTRATIVO.
 * Empresas, pessoas e citações abaixo são fictícias e foram inventadas para esta página.
 * As marcas são glifos geométricos simples, não logos de organizações reais.
 */

type Brand = { name: string; mark: ReactNode };

const BRANDS: Brand[] = [
  { name: "Quillmark", mark: <path d="M4 18 L10 4 L20 4 L14 18 Z" /> },
  { name: "Tervane", mark: <g><rect x="3" y="5" width="18" height="3" /><rect x="3" y="10.5" width="12" height="3" /><rect x="3" y="16" width="6" height="3" /></g> },
  { name: "Halcyra", mark: <path d="M3 16 A9 9 0 0 1 21 16 Z" /> },
  { name: "Obellis", mark: <path d="M12 2 L16 20 L8 20 Z" /> },
  { name: "Sundial Freight", mark: <g><circle cx="12" cy="12" r="8" fill="none" strokeWidth="2.2" stroke="currentColor" /><path d="M12 12 L19 5" strokeWidth="2.2" stroke="currentColor" /></g> },
  { name: "Kovra Labs", mark: <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z M12 7 L7 10 L7 15 L12 18 L17 15 L17 10 Z" fillRule="evenodd" /> },
];

const QUOTES = [
  {
    text: "Tínhamos quatro dashboards e nenhuma visão do todo. Hoje as revisões de incidente são mais curtas, porque ninguém discute o que aconteceu.",
    name: "Ines Okafor-Lind",
    role: "Head de Plataforma, Tervane",
  },
  {
    text: "O mapa de dependências encontrou uma chamada de pagamentos que ninguém sabia que existia. Só isso já justificou a adoção.",
    name: "Rafael Montiel",
    role: "Líder de SRE, Halcyra",
  },
  {
    text: "Nossos agentes aparecem na mesma visão dos nossos serviços, com custo e latência lado a lado.",
    name: "Mei Tanaka-Brooks",
    role: "CTO, Quillmark",
  },
];

function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span aria-hidden className="num grid size-10 shrink-0 place-items-center rounded-sm border border-line-strong bg-surface-2 text-xs text-muted">
      {initials}
    </span>
  );
}

export function Proof() {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.25);
  const [lead, ...rest] = QUOTES;

  return (
    <section aria-labelledby="proof-title" className="relative py-24 md:py-36">
      <div className="container-x">
        <h2 id="proof-title" className="sr-only">
          O que os times dizem sobre o NEXUS
        </h2>

        <ul className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-line py-8 sm:grid-cols-3 lg:grid-cols-6" aria-label="Times que usam o NEXUS, fictícios">
          {BRANDS.map((b) => (
            <li key={b.name} className="flex items-center gap-2.5 text-muted">
              <svg viewBox="0 0 24 24" className="size-6 shrink-0" fill="currentColor" aria-hidden>
                {b.mark}
              </svg>
              <span className="text-[0.95rem] font-semibold tracking-tight [font-stretch:110%]">{b.name}</span>
            </li>
          ))}
        </ul>

        <div ref={ref} className="mt-20 grid gap-12 lg:grid-cols-12 lg:gap-8">
          <motion.figure
            className="lg:col-span-8"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            <blockquote>
              <p className="font-display display-md max-w-[30ch] text-text">
                <span aria-hidden className="text-signal">&ldquo;</span>
                {lead.text}
                <span aria-hidden className="text-signal">&rdquo;</span>
              </p>
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3">
              <Initials name={lead.name} />
              <span>
                <span className="block text-text">{lead.name}</span>
                <span className="block text-sm text-dim">{lead.role}</span>
              </span>
            </figcaption>
          </motion.figure>

          <dl className="grid grid-cols-2 gap-6 self-end border-t border-line pt-6 lg:col-span-4 lg:grid-cols-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <div>
              <dd className="num text-5xl text-text">83%</dd>
              <dt className="mt-2 text-sm text-dim">de recuperação mediana mais rápida após 90 dias</dt>
            </div>
            <div>
              <dd className="num text-5xl text-text">2 de 3</dd>
              <dt className="mt-2 text-sm text-dim">alertas agrupados antes de alguém vê-los</dt>
            </div>
          </dl>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {rest.map((q, i) => (
            <figure key={q.name} className={i === 0 ? "lg:col-span-5 lg:col-start-2" : "lg:col-span-5 lg:col-start-8 lg:mt-16"}>
              <blockquote>
                <p className="text-lg leading-relaxed text-text">&ldquo;{q.text}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Initials name={q.name} />
                <span>
                  <span className="block text-sm text-text">{q.name}</span>
                  <span className="block text-sm text-dim">{q.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-16 text-xs text-dim">Nomes de clientes, citações e números são fictícios e exibidos para demonstração.</p>
      </div>
    </section>
  );
}
