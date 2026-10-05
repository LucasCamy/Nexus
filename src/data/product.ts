/**
 * DEMONSTRATION DATA for the interactive product preview.
 * Fictional services, events and workflows. Nothing here reflects a real system.
 */
import type { Health, NodeKind } from "./topology";

export type EnvId = "production" | "staging" | "development";

export interface ProductService {
  id: string;
  label: string;
  kind: NodeKind;
  owner: string;
  version: string;
  x: number; // map position, 0..100
  y: number;
  deps: string[];
}

export interface ServiceReading {
  status: Health;
  p95: number;
  errorRate: number; // %
  rps: number;
  latency: number[];
  errors: number[];
  note?: string;
}

export interface ProductEvent {
  id: string;
  time: string;
  severity: "info" | "ok" | "warn" | "crit";
  service: string;
  text: string;
}

export interface WorkflowStep {
  label: string;
  actor: string;
  status: "done" | "running" | "pending" | "failed";
  duration?: string;
}

export interface Workflow {
  id: string;
  name: string;
  kind: "Assistido por IA" | "Pipeline" | "Agendado";
  state: "running" | "succeeded" | "scheduled" | "failed";
  last: string;
  runs: number;
  steps: WorkflowStep[];
  reasoning?: string;
}

export const ENVIRONMENTS: { id: EnvId; label: string }[] = [
  { id: "production", label: "Produção" },
  { id: "staging", label: "Staging" },
  { id: "development", label: "Desenvolvimento" },
];

export const SERVICES: ProductService[] = [
  { id: "gateway", label: "edge-gateway", kind: "api", owner: "Plataforma", version: "v3.18.2", x: 8, y: 50, deps: ["auth", "checkout", "catalog", "search"] },
  { id: "auth", label: "auth-api", kind: "api", owner: "Identidade", version: "v2.9.0", x: 30, y: 14, deps: ["cache", "pg-primary"] },
  { id: "checkout", label: "checkout-svc", kind: "service", owner: "Pagamentos", version: "build 4822", x: 30, y: 40, deps: ["orders-q", "pg-primary"] },
  { id: "catalog", label: "catalog-svc", kind: "service", owner: "Comércio", version: "v5.2.1", x: 30, y: 64, deps: ["cache", "pg-primary"] },
  { id: "search", label: "search-svc", kind: "service", owner: "Descoberta", version: "v1.44.0", x: 30, y: 88, deps: ["cache", "triage"] },
  { id: "orders-q", label: "orders-queue", kind: "queue", owner: "Pagamentos", version: "3 partições", x: 56, y: 30, deps: ["billing"] },
  { id: "triage", label: "triage-agent", kind: "agent", owner: "SRE", version: "policy r12", x: 56, y: 76, deps: ["search"] },
  { id: "billing", label: "billing-worker", kind: "service", owner: "Pagamentos", version: "v0.31.4", x: 80, y: 18, deps: ["pg-primary"] },
  { id: "pg-primary", label: "postgres-primary", kind: "db", owner: "Dados", version: "pg 16.4", x: 80, y: 48, deps: [] },
  { id: "cache", label: "redis-cache", kind: "db", owner: "Plataforma", version: "7.2", x: 80, y: 80, deps: [] },
];

function series(base: number, spread: number, n = 20, drift = 0, seed = 1) {
  let s = seed;
  return Array.from({ length: n }, (_, i) => {
    s = (s * 16807) % 2147483647;
    const r = (s / 2147483647 - 0.5) * spread;
    return Math.max(0, +(base + r + drift * i).toFixed(2));
  });
}

type Readings = Record<string, ServiceReading>;

const production: Readings = {
  gateway: { status: "ok", p95: 18, errorRate: 0.02, rps: 4820, latency: series(17, 3, 20, 0, 3), errors: series(0.02, 0.01, 20, 0, 5) },
  auth: { status: "ok", p95: 22, errorRate: 0.01, rps: 1310, latency: series(21, 4, 20, 0, 7), errors: series(0.01, 0.01, 20, 0, 9) },
  checkout: { status: "ok", p95: 46, errorRate: 0.04, rps: 912, latency: series(44, 6, 20, 0, 11), errors: series(0.05, 0.03, 20, 0, 13), note: "Canary 4822 em 10%, sem regressões." },
  catalog: { status: "ok", p95: 29, errorRate: 0.03, rps: 2650, latency: series(28, 4, 20, 0, 17), errors: series(0.03, 0.02, 20, 0, 19) },
  search: { status: "warn", p95: 312, errorRate: 0.21, rps: 1780, latency: series(220, 20, 20, 5, 23), errors: series(0.1, 0.06, 20, 0.006, 29), note: "p95 acima da meta de 300 ms há 6 min. Taxa de acerto do cache em queda." },
  "orders-q": { status: "ok", p95: 6, errorRate: 0, rps: 1204, latency: series(6, 1.5, 20, 0, 31), errors: series(0, 0, 20, 0, 37) },
  triage: { status: "ok", p95: 840, errorRate: 0.4, rps: 3, latency: series(820, 90, 20, 0, 41), errors: series(0.4, 0.3, 20, 0, 43), note: "31 alertas agrupados em 2 incidentes na última hora." },
  billing: { status: "ok", p95: 71, errorRate: 0.02, rps: 96, latency: series(70, 8, 20, 0, 47), errors: series(0.02, 0.02, 20, 0, 53) },
  "pg-primary": { status: "ok", p95: 9, errorRate: 0, rps: 6120, latency: series(9, 2, 20, 0, 59), errors: series(0, 0, 20, 0, 61) },
  cache: { status: "ok", p95: 1, errorRate: 0, rps: 22800, latency: series(1.1, 0.3, 20, 0, 67), errors: series(0, 0, 20, 0, 71) },
};

const staging: Readings = {
  ...production,
  checkout: { status: "crit", p95: 410, errorRate: 6.2, rps: 64, latency: series(120, 30, 20, 15, 73), errors: series(0.4, 0.4, 20, 0.3, 79), note: "5xx em 6,2% desde o build 4823-rc1. Promoção para produção bloqueada." },
  search: { status: "ok", p95: 88, errorRate: 0.05, rps: 120, latency: series(86, 10, 20, 0, 83), errors: series(0.05, 0.03, 20, 0, 89) },
  "orders-q": { status: "warn", p95: 31, errorRate: 0, rps: 40, latency: series(12, 5, 20, 1, 97), errors: series(0, 0, 20, 0, 101), note: "Lag do consumidor em 4,2 mil mensagens, aguardando o checkout." },
  gateway: { ...production.gateway, rps: 310 },
  catalog: { ...production.catalog, rps: 140 },
};

const development: Readings = {
  ...production,
  search: { status: "ok", p95: 64, errorRate: 0.1, rps: 12, latency: series(60, 12, 20, 0, 103), errors: series(0.1, 0.08, 20, 0, 107) },
  triage: { status: "warn", p95: 2140, errorRate: 3.1, rps: 1, latency: series(1500, 300, 20, 30, 109), errors: series(2, 1, 20, 0.05, 113), note: "Nova política de prompt r13 em avaliação. Timeouts de ferramentas acima do orçamento." },
  gateway: { ...production.gateway, rps: 42 },
  checkout: { ...production.checkout, rps: 8, note: undefined },
};

export const READINGS: Record<EnvId, Readings> = { production, staging, development };

export const EVENTS: Record<EnvId, ProductEvent[]> = {
  production: [
    { id: "p1", time: "14:06:12", severity: "warn", service: "search", text: "p95 de 312 ms, acima da meta de 300 ms há 6 min" },
    { id: "p2", time: "14:05:40", severity: "info", service: "checkout", text: "Deploy 4822 promovido a canary de 10%" },
    { id: "p3", time: "14:04:03", severity: "info", service: "triage", text: "31 alertas agrupados em 2 incidentes" },
    { id: "p4", time: "14:01:18", severity: "ok", service: "cache", text: "Taxa de acerto recuperada para 94%" },
    { id: "p5", time: "13:58:02", severity: "info", service: "billing", text: "Lote de faturas iniciado, 18.240 contas" },
    { id: "p6", time: "13:52:44", severity: "warn", service: "orders-q", text: "Lag do consumidor atingiu pico de 1,1 mil mensagens" },
    { id: "p7", time: "13:47:10", severity: "ok", service: "auth", text: "Rotação da chave de assinatura concluída" },
  ],
  staging: [
    { id: "s1", time: "14:06:30", severity: "crit", service: "checkout", text: "Taxa de 5xx em 6,2% após o build 4823-rc1" },
    { id: "s2", time: "14:06:31", severity: "info", service: "checkout", text: "Promoção para produção bloqueada por política" },
    { id: "s3", time: "14:05:02", severity: "warn", service: "orders-q", text: "Lag do consumidor em 4,2 mil mensagens" },
    { id: "s4", time: "14:02:19", severity: "info", service: "triage", text: "Suspeita: moeda nula em carrinhos legados" },
    { id: "s5", time: "13:55:48", severity: "ok", service: "search", text: "Rebuild do índice concluído em 3 min" },
  ],
  development: [
    { id: "d1", time: "14:03:57", severity: "warn", service: "triage", text: "Timeouts em chamadas de ferramenta em 3,1% na política r13" },
    { id: "d2", time: "13:59:12", severity: "info", service: "search", text: "Ambiente de preview pr-1187 criado" },
    { id: "d3", time: "13:41:05", severity: "ok", service: "catalog", text: "Testes de contrato aprovados, 214 de 214" },
  ],
};

export const WORKFLOWS: Workflow[] = [
  {
    id: "wf-cache",
    name: "Remediar pressão no cache",
    kind: "Assistido por IA",
    state: "running",
    last: "iniciado às 14:04",
    runs: 41,
    reasoning:
      "Evictions no redis-cache subiram 3,4x após 13:40. Misses do search-svc caem direto no postgres. Escalar o search para 6 réplicas e elevar o TTL para 120 s repete 4 resoluções anteriores.",
    steps: [
      { label: "Detectar pressão de memória", actor: "monitor", status: "done", duration: "2 s" },
      { label: "Correlacionar com mudanças recentes", actor: "triage-agent", status: "done", duration: "11 s" },
      { label: "Propor escala e mudança de TTL", actor: "triage-agent", status: "done", duration: "6 s" },
      { label: "Aguardar aprovação do on-call", actor: "on-call", status: "running" },
      { label: "Aplicar e verificar o p95", actor: "nexus", status: "pending" },
    ],
  },
  {
    id: "wf-canary",
    name: "Análise de canary do checkout",
    kind: "Pipeline",
    state: "succeeded",
    last: "14:05, 4 min 12 s",
    runs: 212,
    steps: [
      { label: "Deploy do build 4822 para 10%", actor: "deploy", status: "done", duration: "48 s" },
      { label: "Comparar erros e latência", actor: "nexus", status: "done", duration: "3 min" },
      { label: "Verificar filas a jusante", actor: "nexus", status: "done", duration: "14 s" },
      { label: "Reportar em #payments-deploys", actor: "nexus", status: "done", duration: "1 s" },
    ],
  },
  {
    id: "wf-creds",
    name: "Rotacionar credenciais do banco",
    kind: "Agendado",
    state: "scheduled",
    last: "próxima às 02:00 UTC",
    runs: 96,
    steps: [
      { label: "Emitir novas credenciais", actor: "vault", status: "pending" },
      { label: "Reiniciar serviços em ordem de dependência", actor: "nexus", status: "pending" },
      { label: "Revogar credenciais anteriores", actor: "vault", status: "pending" },
    ],
  },
];
