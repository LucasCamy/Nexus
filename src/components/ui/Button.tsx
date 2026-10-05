import { ArrowRightIcon } from "@phosphor-icons/react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

type AsLink = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type AsButton = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

const base =
  "group relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-sm font-medium select-none " +
  "transition-[background-color,border-color,color,transform] duration-[var(--d-fast)] ease-[var(--ease-out)] " +
  "active:translate-y-px disabled:opacity-40 disabled:active:translate-y-0";

const variants: Record<Variant, string> = {
  primary:
    "bg-signal text-signal-ink hover:bg-[#86e8f4] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_24px_-12px_rgba(79,216,235,0.55)]",
  secondary:
    "border border-line-strong bg-[rgba(16,26,36,0.6)] text-text hover:border-[rgba(190,220,255,0.32)] hover:bg-surface-2",
  ghost: "text-muted hover:text-text underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-[0.9375rem]",
  lg: "h-12 px-5 text-base",
};

function Inner({ children, arrow, loading }: Pick<BaseProps, "children" | "arrow" | "loading">) {
  return (
    <>
      <span className={cn(loading && "invisible")}>{children}</span>
      {arrow && (
        <ArrowRightIcon
          aria-hidden
          weight="regular"
          className={cn(
            "size-4 transition-transform duration-[var(--d-fast)] ease-[var(--ease-out)] group-hover:translate-x-0.5",
            loading && "invisible",
          )}
        />
      )}
      {loading && (
        <span className="loading-bars absolute inset-0 flex items-center justify-center gap-1" aria-hidden>
          <span className="h-3 w-1 rounded-[1px] bg-current" />
          <span className="h-3 w-1 rounded-[1px] bg-current" />
          <span className="h-3 w-1 rounded-[1px] bg-current" />
        </span>
      )}
    </>
  );
}

export function Button(props: AsLink | AsButton) {
  const { variant = "primary", size = "md", arrow, loading, children, className, ...rest } = props;
  const classes = cn(
    base,
    variants[variant],
    variant !== "ghost" && sizes[size],
    variant === "ghost" && "h-11 px-1",
    className,
  );

  if (typeof (rest as AsLink).href === "string") {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        <Inner arrow={arrow} loading={loading}>
          {children}
        </Inner>
      </a>
    );
  }
  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} aria-busy={loading || undefined} {...buttonProps} type={buttonProps.type ?? "button"}>
      <Inner arrow={arrow} loading={loading}>
        {children}
      </Inner>
    </button>
  );
}
