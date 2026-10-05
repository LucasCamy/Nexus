import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { nodeById } from "../../data/topology";
import { DUR, EASE_OUT } from "../../lib/motion";
import { detectQuality, hasWebGL, type SceneQuality } from "../../lib/webgl";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { TopologyPoster } from "./TopologyPoster";

const SystemCanvas = lazy(() => import("../three/SystemCanvas"));

class SceneBoundary extends Component<{ fallback: ReactNode; onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export type SceneMode = "poster" | "3d";

interface HeroSceneProps {
  focusedId: string | null;
  onFocus: (id: string) => void;
  onModeChange?: (mode: SceneMode, quality: SceneQuality) => void;
  className?: string;
}

/**
 * Progressive scene: SVG poster renders immediately (also the no-WebGL fallback),
 * the WebGL chunk is fetched on idle and cross-fades in once its first frame renders.
 */
export function HeroScene({ focusedId, onFocus, onModeChange, className }: HeroSceneProps) {
  const reduced = useReducedMotion() ?? false;
  const narrow = useMediaQuery("(max-width: 767px)");
  const wrapper = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const [wantsCanvas, setWantsCanvas] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const quality: SceneQuality = typeof navigator === "undefined" ? "lite" : detectQuality(narrow);

  // Defer the heavy chunk until the browser is idle.
  useEffect(() => {
    if (!hasWebGL()) {
      setFailed(true);
      return;
    }
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setWantsCanvas(true), { timeout: 1200 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setWantsCanvas(true), 300);
    return () => window.clearTimeout(t);
  }, []);

  // Pause rendering when off-screen or when the tab is hidden.
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const showCanvas = wantsCanvas && !failed;
  const mode: SceneMode = showCanvas && ready ? "3d" : "poster";

  useEffect(() => {
    onModeChange?.(mode, quality);
  }, [mode, quality, onModeChange]);

  const focused = focusedId ? nodeById[focusedId] : null;
  const lite = quality === "lite";

  const poster = (
    <TopologyPoster focusedId={focusedId} className="absolute inset-0 h-full w-full" />
  );

  return (
    <div ref={wrapper} className={className ?? "relative"}>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: mode === "3d" ? 0 : 1 }}
        transition={{ duration: DUR.slow, ease: EASE_OUT }}
      >
        {poster}
      </motion.div>

      {showCanvas && (
        <SceneBoundary fallback={null} onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
              animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduced ? 1 : 0.97 }}
              transition={{ duration: DUR.hero, ease: EASE_OUT }}
            >
              <SystemCanvas
                quality={quality}
                reducedMotion={reduced}
                active={inView && pageVisible}
                focusedId={focusedId}
                onFocus={onFocus}
                onContextLost={() => setFailed(true)}
                onReady={() => setReady(true)}
                labelRef={label}
              />
            </motion.div>
          </Suspense>
        </SceneBoundary>
      )}

      {/* Floating label pinned to the focused node (3D mode only, positioned per frame). */}
      {mode === "3d" && focused && !lite && (
        <div
          ref={label}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 will-change-transform"
        >
          <span className="label-mono ml-6 -mt-3 inline-block rounded-xs border border-line-strong bg-[rgba(5,8,12,0.78)] px-2 py-1 whitespace-nowrap text-text">
            {focused.label}
          </span>
        </div>
      )}
    </div>
  );
}
