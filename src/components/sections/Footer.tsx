import { GithubLogoIcon, LinkedinLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import { Logo } from "../ui/Logo";

const COLUMNS = [
  {
    title: "Produto",
    links: [
      { label: "Plataforma", href: "#plataforma" },
      { label: "Arquitetura", href: "#arquitetura" },
      { label: "Observabilidade", href: "#observabilidade" },
      { label: "Segurança", href: "#seguranca" },
    ],
  },
  {
    title: "Desenvolvedores",
    links: [
      { label: "Início rápido", href: "#desenvolvedores" },
      { label: "Provider Terraform", href: "#desenvolvedores" },
      { label: "OpenTelemetry", href: "#desenvolvedores" },
      { label: "Solicitar acesso", href: "#acesso" },
    ],
  },
];

/* Redes sociais e contato pertencem a uma marca fictícia e apontam para esta própria página. */
const SOCIAL = [
  { label: "NEXUS no GitHub", icon: GithubLogoIcon },
  { label: "NEXUS no X", icon: XLogoIcon },
  { label: "NEXUS no LinkedIn", icon: LinkedinLogoIcon },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Rodapé
      </h2>
      <div className="container-x grid gap-12 py-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-5 max-w-sm text-muted">
            O mapa operacional para times que operam sistemas distribuídos, serviços e workflows de IA.
          </p>
          <p className="label-mono mt-6 inline-flex items-center gap-2 rounded-xs border border-line-strong px-2.5 py-1.5 text-muted">
            <span aria-hidden className="size-1.5 rounded-full bg-ok" />
            Operação normal
          </p>
        </div>

        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title} className="md:col-span-2">
            <p className="label-mono uppercase text-dim">{c.title}</p>
            <ul className="mt-4 space-y-1">
              {c.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="inline-flex min-h-9 items-center text-sm text-muted transition-colors hover:text-text">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div id="contato" className="md:col-span-3">
          <p className="label-mono uppercase text-dim">Contato</p>
          <p className="mt-4 text-sm text-muted">
            ola@nexus.example
            <span className="mt-1 block text-xs text-dim">Endereço demonstrativo, não monitorado.</span>
          </p>
          <ul className="mt-5 flex gap-2" aria-label="Perfis sociais, demonstração">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href="#contato"
                  aria-label={`${s.label} (link demonstrativo)`}
                  className="grid size-11 place-items-center rounded-sm border border-line-strong text-muted transition-colors hover:border-[rgba(190,220,255,0.32)] hover:text-text"
                >
                  <s.icon aria-hidden className="size-4.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-dim sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 NEXUS. Produto fictício, página demonstrativa.</p>
          <p>Todos os nomes, números e dados desta página são inventados.</p>
        </div>
      </div>
    </footer>
  );
}
