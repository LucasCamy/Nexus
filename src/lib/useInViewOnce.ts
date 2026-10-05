import { useInView } from "motion/react";
import { useRef } from "react";

/** Small wrapper so every section reveals with the same viewport margin. */
export function useInViewOnce<T extends Element>(amount = 0.3) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, amount });
  return [ref, inView] as const;
}
