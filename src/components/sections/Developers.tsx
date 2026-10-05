import { CheckIcon, CopyIcon, TerminalWindowIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "../../lib/cn";

/* CLI e providers fictícios do produto fictício NEXUS. */
const SNIPPETS = [
  {
    id: "cli",
    label: "CLI",
    lines: [
      { t: "c", v: "# Conecte um cluster e mapeie em cerca de 90 segundos" },
      { t: "p", v: "curl -fsSL https://get.nexus.example/install.sh | sh" },
      { t: "p", v: "nexus login" },
      { t: "p", v: "nexus connect kubernetes --context prod-eu-west" },
      { t: "o", v: "142 serviços, 23 bancos de dados e 7 agentes descobertos" },
      { t: "p", v: "nexus map open" },
    ],
  },
  {
    id: "terraform",
    label: "Terraform",
    lines: [
      { t: "c", v: "# Declare responsáveis e SLOs junto da sua infraestrutura" },
      { t: "x", v: 'resource "nexus_service" "checkout" {' },
      { t: "x", v: '  owner = "payments"' },
      { t: "x", v: '  slo   = { p95_ms = 120, availability = 99.95 }' },
      { t: "x", v: '  depends_on_services = ["orders-queue", "postgres-primary"]' },
      { t: "x", v: "}" },
    ],
  },
  {
    id: "otel",
    label: "OpenTelemetry",
    lines: [
      { t: "c", v: "# Já usa OpenTelemetry? Aponte o exporter para o NEXUS" },
      { t: "x", v: "exporters:" },
      { t: "x", v: "  otlp/nexus:" },
      { t: "x", v: "    endpoint: ingest.eu.nexus.example:4317" },
      { t: "x", v: "    headers: { x-nexus-workspace: northwind-retail }" },
    ],
  },
] as const;

const POINTS = [
  { title: "Nativo em OpenTelemetry", text: "Os traces, métricas e logs que você já emite viram topologia. Sem agente proprietário." },
  { title: "Tudo como código", text: "Responsáveis, SLOs e workflows vivem em Terraform ou YAML e passam por revisão como qualquer mudança." },
  { title: "Uma API pública para o mapa", text: "Consulte dependências, raio de impacto e histórico a partir de scripts, checks de CI ou dos seus próprios agentes." },
];

export function Developers() {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState<"idle" | "ok" | "error">("idle");
  const timer = useRef<number | undefined>(undefined);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const snippet = SNIPPETS[tab];

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    const text = snippet.lines
      .filter((l) => l.t !== "o")
      .map((l) => l.v)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied("ok");
    } catch {
      setCopied("error");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied("idle"), 2200);
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % SNIPPETS.length;
    if (e.key === "ArrowLeft") next = (i - 1 + SNIPPETS.length) % SNIPPETS.length;
    if (next >= 0) {
      e.preventDefault();
      setTab(next);
      tabs.current[next]?.focus();
    }
  };

  return (
    <section id="desenvolvedores" aria-labelledby="developers-title" className="relative border-t border-line bg-bg-raised py-24 md:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <h2 id="developers-title" className="font-display display-lg text-text">
            Aponte para um cluster. O mapa se desenha sozinho.
          </h2>
          <dl className="mt-10 space-y-7">
            {POINTS.map((p) => (
              <div key={p.title} className="border-l border-line-strong pl-5">
                <dt className="text-text">{p.title}</dt>
                <dd className="mt-1 text-muted">{p.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-7 lg:pt-2">
          <div className="overflow-hidden rounded-md border border-line-strong bg-[#070b10] shadow-[var(--shadow-2)]">
            <div className="flex items-center justify-between gap-2 border-b border-line pr-2">
              <div role="tablist" aria-label="Forma de configuração" className="flex overflow-x-auto">
                {SNIPPETS.map((s, i) => (
                  <button
                    key={s.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    role="tab"
                    id={`dev-tab-${s.id}`}
                    aria-selected={tab === i}
                    aria-controls="dev-panel"
                    tabIndex={tab === i ? 0 : -1}
                    type="button"
                    onClick={() => setTab(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={cn(
                      "relative h-12 shrink-0 px-4 text-sm transition-colors duration-[var(--d-fast)]",
                      tab === i ? "text-text" : "text-muted hover:text-text",
                    )}
                  >
                    {s.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-4 bottom-0 h-px bg-signal transition-transform duration-[var(--d-base)] ease-[var(--ease-out)]",
                        tab === i ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={copy}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-sm px-3 text-sm text-muted transition-colors hover:bg-surface-3 hover:text-text"
              >
                {copied === "ok" ? <CheckIcon aria-hidden className="size-4 text-ok" /> : <CopyIcon aria-hidden className="size-4" />}
                <span>{copied === "ok" ? "Copiado" : copied === "error" ? "Falha ao copiar" : "Copiar"}</span>
              </button>
              <span className="sr-only" role="status">
                {copied === "ok" ? "Snippet copiado para a área de transferência" : copied === "error" ? "Falha ao copiar, selecione o texto manualmente" : ""}
              </span>
            </div>
            <div id="dev-panel" role="tabpanel" aria-labelledby={`dev-tab-${snippet.id}`} tabIndex={0} className="overflow-x-auto p-5 md:p-6">
              <pre className="num text-[13px] leading-7">
                <code>
                  {snippet.lines.map((l, i) => (
                    <span key={i} className="block whitespace-pre">
                      {l.t === "p" && (
                        <span aria-hidden className="mr-3 text-signal select-none">
                          $
                        </span>
                      )}
                      {l.t === "o" && (
                        <span aria-hidden className="mr-3 text-ok select-none">
                          &gt;
                        </span>
                      )}
                      <span className={l.t === "c" ? "text-dim" : l.t === "o" ? "text-muted" : "text-text"}>{l.v}</span>
                    </span>
                  ))}
                </code>
              </pre>
            </div>
            <div className="flex items-center gap-2 border-t border-line px-5 py-3 text-xs text-dim">
              <TerminalWindowIcon aria-hidden className="size-4" />
              Pacote e endpoints são fictícios, para demonstração.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
