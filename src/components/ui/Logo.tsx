import { cn } from "../../lib/cn";

/** Simple geometric mark (orbit + core) and the NEXUS wordmark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7", className)} fill="none">
      <circle cx="16" cy="16" r="11" stroke="var(--signal)" strokeWidth="1.5" />
      <ellipse
        cx="16"
        cy="16"
        rx="11"
        ry="4.4"
        stroke="var(--signal)"
        strokeOpacity=".5"
        strokeWidth="1.2"
        transform="rotate(-28 16 16)"
      />
      <circle cx="16" cy="16" r="3" fill="var(--text)" />
      <circle cx="25.6" cy="10.9" r="1.6" fill="var(--signal)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[0.95rem] font-semibold tracking-[0.22em] text-text [font-stretch:125%]">NEXUS</span>
    </span>
  );
}
