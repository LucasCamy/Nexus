import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/** H2 + optional lead stacked vertically (no split headers). */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  className,
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow && <p className="label-mono mb-5 uppercase text-signal">{eyebrow}</p>}
      <h2 id={id} className="font-display display-lg text-text">
        {title}
      </h2>
      {lead && <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted">{lead}</p>}
    </div>
  );
}
