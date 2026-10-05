import { HEALTH_LABEL, type Health } from "../../data/topology";
import { cn } from "../../lib/cn";

const tone: Record<Health, string> = {
  ok: "text-ok bg-[var(--ok-soft)]",
  warn: "text-warn bg-[var(--warn-soft)]",
  crit: "text-crit bg-[var(--crit-soft)]",
};

/** Shape carries meaning in addition to color: circle, triangle, square. */
export function HealthGlyph({ status, className }: { status: Health; className?: string }) {
  const shape =
    status === "ok"
      ? "rounded-full"
      : status === "warn"
        ? "[clip-path:polygon(50%_0,100%_100%,0_100%)]"
        : "rounded-[1px]";
  return <span aria-hidden className={cn("inline-block size-2 shrink-0 bg-current", shape, className)} />;
}

export function StatusBadge({ status, label, className }: { status: Health; label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "label-mono inline-flex h-6 items-center gap-1.5 rounded-xs px-2 whitespace-nowrap",
        tone[status],
        className,
      )}
    >
      <HealthGlyph status={status} />
      {label ?? HEALTH_LABEL[status]}
    </span>
  );
}
