/**
 * Capability checks for the hero scene. Cached so the probe context
 * is created at most once per page load.
 */
let cached: boolean | null = null;

export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  try {
    if (new URLSearchParams(window.location.search).get("webgl") === "0") {
      cached = false;
      return cached;
    }
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    cached = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}

export type SceneQuality = "full" | "lite";

export function detectQuality(isNarrow: boolean): SceneQuality {
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (isNarrow || cores <= 4 || memory <= 4) return "lite";
  return "full";
}
