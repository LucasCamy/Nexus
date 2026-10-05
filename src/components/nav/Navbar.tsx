import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { DUR, EASE_EXIT, EASE_OUT } from "../../lib/motion";
import { useActiveSection } from "../../lib/useActiveSection";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";

export const NAV_LINKS = [
  { id: "plataforma", label: "Plataforma" },
  { id: "arquitetura", label: "Arquitetura" },
  { id: "observabilidade", label: "Observabilidade" },
  { id: "seguranca", label: "Segurança" },
  { id: "desenvolvedores", label: "Desenvolvedores" },
] as const;

// Sections without a nav link are tracked too, so no link stays highlighted while they are in view.
const SECTION_IDS = ["topo", ...NAV_LINKS.map((l) => l.id), "acesso"];

function SystemStatus({ className }: { className?: string }) {
  return (
    <span className={cn("label-mono inline-flex items-center gap-2 text-muted", className)}>
      <span aria-hidden className="beacon size-1.5 rounded-full bg-ok" />
      Operação normal
    </span>
  );
}

function MenuToggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      className="relative grid size-11 place-items-center rounded-sm border border-line-strong text-text lg:hidden"
    >
      <span aria-hidden className="relative block h-3 w-5">
        <span
          className={cn(
            "absolute left-0 h-px w-5 bg-current transition-transform duration-[var(--d-base)] ease-[var(--ease-in-out)]",
            open ? "top-1.5 rotate-45" : "top-0",
          )}
        />
        <span
          className={cn(
            "absolute left-0 h-px w-5 bg-current transition-transform duration-[var(--d-base)] ease-[var(--ease-in-out)]",
            open ? "top-1.5 -rotate-45" : "top-3",
          )}
        />
      </span>
    </button>
  );
}

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 24;
    if (next !== scrolled) setScrolled(next);
  });

  const close = useCallback(() => setOpen(false), []);

  // Mobile menu: lock scroll, close on Escape, trap focus inside header.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = menuRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.querySelector("button")?.focus();
      }
      if (e.key === "Tab" && menuRef.current) {
        const focusables = [
          ...(toggleRef.current?.querySelectorAll<HTMLElement>("button") ?? []),
          ...menuRef.current.querySelectorAll<HTMLElement>("a,button"),
        ];
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-[var(--z-nav)]">
      <div
        className={cn(
          "absolute inset-0 border-b transition-[background-color,border-color,backdrop-filter] duration-[var(--d-base)] ease-[var(--ease-out)]",
          scrolled || open ? "glass border-line" : "border-transparent bg-transparent",
        )}
      />
      <nav aria-label="Principal" className="container-x relative flex h-[var(--nav-h)] items-center justify-between gap-6">
        <a href="#topo" className="flex items-center gap-5 rounded-sm" aria-label="NEXUS, voltar ao topo">
          <Logo />
        </a>
        <div className="mr-auto hidden xl:block">
          <SystemStatus />
        </div>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                aria-current={active === l.id ? "true" : undefined}
                className={cn(
                  "relative inline-flex h-11 items-center px-2.5 text-sm transition-colors duration-[var(--d-fast)] xl:px-3 xl:text-[0.9375rem]",
                  active === l.id ? "text-text" : "text-muted hover:text-text",
                )}
              >
                {l.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-2.5 bottom-2 h-px origin-left xl:inset-x-3 bg-signal transition-transform duration-[var(--d-base)] ease-[var(--ease-out)]",
                    active === l.id ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <Button href="#acesso" variant="primary">
              Solicitar acesso
            </Button>
          </div>
          <div ref={toggleRef}>
            <MenuToggle open={open} onClick={() => setOpen((o) => !o)} />
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu do site"
            className="fixed inset-x-0 top-[var(--nav-h)] bottom-0 overflow-y-auto border-t border-line bg-[rgba(5,8,12,0.97)] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: DUR.base, ease: EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: DUR.fast, ease: EASE_EXIT } }}
          >
            <div className="container-x flex min-h-full flex-col pt-8 pb-10">
              <ul className="flex flex-col">
                {NAV_LINKS.map((l, i) => (
                  <li key={l.id} className="overflow-hidden border-b border-line">
                    <motion.a
                      href={`#${l.id}`}
                      onClick={close}
                      className="font-display flex h-16 items-center justify-between text-2xl text-text"
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1, transition: { duration: DUR.slow, ease: EASE_OUT, delay: 0.04 + i * 0.04 } }}
                    >
                      {l.label}
                      <span className="label-mono text-dim" aria-hidden>
                        #{l.id}
                      </span>
                    </motion.a>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-4 pt-10">
                <SystemStatus />
                <Button href="#acesso" size="lg" arrow onClick={close}>
                  Solicitar acesso
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
