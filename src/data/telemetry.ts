/**
 * DEMONSTRATION DATA. Operational readouts for the fictional NEXUS product.
 */

export interface Readout {
  id: string;
  label: string;
  value: string;
  unit?: string;
  detail: string;
  state: "ok" | "warn" | "neutral";
  trend: number[];
}

export const READOUTS: Readout[] = [
  { id: "uptime", label: "Uptime", value: "99,99", unit: "%", detail: "últimos 90 dias", state: "ok", trend: [99.97, 99.98, 99.99, 99.99, 99.98, 99.99, 99.99, 99.99] },
  { id: "services", label: "Serviços conectados", value: "142", detail: "+6 nesta semana", state: "neutral", trend: [118, 121, 126, 129, 133, 136, 139, 142] },
  { id: "workflows", label: "Workflows ativos", value: "18", detail: "4 com IA", state: "neutral", trend: [12, 14, 13, 15, 16, 17, 17, 18] },
  { id: "incidents", label: "Incidentes críticos", value: "0", detail: "último há 23 dias", state: "ok", trend: [2, 1, 1, 0, 1, 0, 0, 0] },
  { id: "latency", label: "Latência média", value: "24", unit: "ms", detail: "p50, todas as regiões", state: "ok", trend: [31, 29, 27, 28, 26, 25, 24, 24] },
  { id: "events", label: "Eventos ingeridos", value: "1,84", unit: "M/min", detail: "pico de 2,6M às 14:00 UTC", state: "neutral", trend: [1.2, 1.4, 1.9, 2.6, 2.1, 1.7, 1.8, 1.84] },
  { id: "budget", label: "Error budget restante", value: "71,4", unit: "%", detail: "SLO do checkout, 30 dias", state: "neutral", trend: [96, 92, 88, 85, 80, 77, 74, 71.4] },
  { id: "degraded", label: "Serviços degradados", value: "1", detail: "search-svc, p95 312 ms", state: "warn", trend: [0, 0, 0, 1, 0, 0, 1, 1] },
];
