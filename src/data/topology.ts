/**
 * DEMONSTRATION DATA.
 * NEXUS is a fictional product. Every service, metric and status below is
 * invented for this landing page and does not describe a real system.
 *
 * This topology is the single source for the hero 3D scene, its SVG poster
 * fallback and the screen-reader description of the scene.
 */

export type NodeKind = "api" | "service" | "queue" | "db" | "agent";
export type Health = "ok" | "warn" | "crit";

export interface SystemNode {
  id: string;
  label: string;
  kind: NodeKind;
  /** 0 = edge / APIs, 1 = services, queues and agents, 2 = data */
  tier: 0 | 1 | 2;
  /** Position on the tier orbit, in degrees. */
  angle: number;
  status: Health;
  p95: number; // ms
  rps: number; // requests (or messages) per second
  region: string;
}

export const KIND_LABEL: Record<NodeKind, string> = {
  api: "API",
  service: "Serviço",
  queue: "Fila",
  db: "Banco de dados",
  agent: "Agente de IA",
};

export const HEALTH_LABEL: Record<Health, string> = {
  ok: "Saudável",
  warn: "Degradado",
  crit: "Crítico",
};

export const TIER_LABEL = ["Borda e APIs", "Serviços, filas e agentes", "Dados"] as const;

export const NODES: SystemNode[] = [
  // Tier 0: edge
  { id: "gateway", label: "edge-gateway", kind: "api", tier: 0, angle: 10, status: "ok", p95: 18, rps: 4820, region: "eu-west" },
  { id: "auth", label: "auth-api", kind: "api", tier: 0, angle: 82, status: "ok", p95: 22, rps: 1310, region: "eu-west" },
  { id: "payments", label: "payments-api", kind: "api", tier: 0, angle: 154, status: "ok", p95: 41, rps: 386, region: "us-east" },
  { id: "graphql", label: "public-graphql", kind: "api", tier: 0, angle: 226, status: "ok", p95: 34, rps: 2140, region: "eu-west" },
  { id: "webhooks", label: "webhooks-in", kind: "api", tier: 0, angle: 298, status: "ok", p95: 27, rps: 640, region: "us-east" },

  // Tier 1: services, queues, agents
  { id: "checkout", label: "checkout-svc", kind: "service", tier: 1, angle: 0, status: "ok", p95: 46, rps: 912, region: "eu-west" },
  { id: "orders-q", label: "orders-queue", kind: "queue", tier: 1, angle: 40, status: "ok", p95: 6, rps: 1204, region: "eu-west" },
  { id: "catalog", label: "catalog-svc", kind: "service", tier: 1, angle: 80, status: "ok", p95: 29, rps: 2650, region: "eu-west" },
  { id: "triage", label: "triage-agent", kind: "agent", tier: 1, angle: 120, status: "ok", p95: 840, rps: 3, region: "eu-west" },
  { id: "search", label: "search-svc", kind: "service", tier: 1, angle: 160, status: "warn", p95: 312, rps: 1780, region: "us-east" },
  { id: "events", label: "events-stream", kind: "queue", tier: 1, angle: 200, status: "ok", p95: 4, rps: 18400, region: "eu-west" },
  { id: "notify", label: "notifications", kind: "service", tier: 1, angle: 240, status: "ok", p95: 58, rps: 420, region: "us-east" },
  { id: "forecast", label: "capacity-agent", kind: "agent", tier: 1, angle: 280, status: "ok", p95: 1260, rps: 1, region: "eu-west" },
  { id: "billing", label: "billing-worker", kind: "service", tier: 1, angle: 320, status: "ok", p95: 71, rps: 96, region: "us-east" },

  // Tier 2: data
  { id: "pg-primary", label: "postgres-primary", kind: "db", tier: 2, angle: 30, status: "ok", p95: 9, rps: 6120, region: "eu-west" },
  { id: "pg-replica", label: "postgres-replica", kind: "db", tier: 2, angle: 102, status: "ok", p95: 7, rps: 3940, region: "us-east" },
  { id: "cache", label: "redis-cache", kind: "db", tier: 2, angle: 174, status: "ok", p95: 1, rps: 22800, region: "eu-west" },
  { id: "objects", label: "object-store", kind: "db", tier: 2, angle: 246, status: "ok", p95: 38, rps: 210, region: "eu-west" },
  { id: "warehouse", label: "warehouse", kind: "db", tier: 2, angle: 318, status: "ok", p95: 420, rps: 12, region: "eu-west" },
];

/** Data-flow edges (directed: from caller to dependency). */
export const LINKS: [string, string][] = [
  ["gateway", "checkout"],
  ["gateway", "catalog"],
  ["gateway", "search"],
  ["auth", "cache"],
  ["auth", "pg-primary"],
  ["payments", "checkout"],
  ["payments", "billing"],
  ["graphql", "catalog"],
  ["graphql", "search"],
  ["webhooks", "events"],
  ["checkout", "orders-q"],
  ["orders-q", "billing"],
  ["checkout", "pg-primary"],
  ["catalog", "cache"],
  ["catalog", "pg-replica"],
  ["search", "cache"],
  ["search", "objects"],
  ["events", "notify"],
  ["events", "warehouse"],
  ["events", "triage"],
  ["triage", "search"],
  ["forecast", "warehouse"],
  ["billing", "pg-primary"],
  ["notify", "pg-replica"],
];

/** Links that carry animated signals in the full scene. */
export const SIGNAL_LINKS = new Set([0, 1, 2, 7, 9, 10, 12, 13, 17, 18, 19, 20]);

export const TIER_GEOMETRY = [
  { y: 1.45, r: 2.35 },
  { y: 0, r: 3.35 },
  { y: -1.45, r: 2.5 },
] as const;

export function nodePosition(n: SystemNode): [number, number, number] {
  const { y, r } = TIER_GEOMETRY[n.tier];
  const a = (n.angle * Math.PI) / 180;
  return [Math.cos(a) * r, y, Math.sin(a) * r];
}

export const nodeById = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<string, SystemNode>;

export const DEFAULT_FOCUS_ID = "search";

export function describeNode(n: SystemNode): string {
  return `${n.label}, ${KIND_LABEL[n.kind]}, ${HEALTH_LABEL[n.status].toLowerCase()}, p95 ${n.p95} ms, ${n.rps.toLocaleString("pt-BR")} por segundo, ${n.region}`;
}
