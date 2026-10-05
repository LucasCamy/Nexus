# NEXUS · Implementation Plan

## 1. Decisão de stack

| Item | Escolha | Motivo |
| --- | --- | --- |
| Build | **Vite 8** + `@vitejs/plugin-react` | Página única sem necessidade de SSR; dev server rápido; code-splitting nativo para isolar Three.js em chunk lazy |
| UI | **React 19** + **TypeScript** (strict) | Exigido pelo briefing |
| Estilo | **Tailwind CSS v4** (`@tailwindcss/vite`) + CSS variables | Tokens vivem em `tokens.css` e são expostos ao Tailwind via `@theme` |
| Motion | **Motion** (`motion/react`) | Sucessor do Framer Motion; `useReducedMotion`, `useInView`, `useScroll`, `MotionConfig` |
| 3D | **three** + **@react-three/fiber** | Exigido; sem `drei` para manter o bundle enxuto (linhas, instancing e tooltip implementados à mão) |
| Ícones | **@phosphor-icons/react** (peso `light`/`regular`) | Traço fino, coerente com o tema instrumento |
| Fontes | `@fontsource-variable/archivo` (eixos wght + wdth) e `@fontsource-variable/jetbrains-mono` | Self-host, sem request a terceiros |

## 2. Arquitetura da página

```
App
├─ SkipLink
├─ Navbar                    (sticky, scroll-aware, menu mobile com focus trap)
└─ main#content
   ├─ Hero                   (texto assimétrico + HeroScene + HUD + métricas)
   │  └─ HeroScene           (lazy: SystemCanvas 3D | TopologyPoster SVG)
   ├─ Telemetry              (ticker operacional, único marquee da página)
   ├─ SystemMap              (#architecture: diagrama 2D interativo Cloud/APIs/Data/AI/Automations/Teams)
   ├─ Capabilities           (#platform: bento de 4 composições distintas)
   │  ├─ DependencyTrace     (árvore de dependências com rastreamento por hover/foco)
   │  ├─ AnomalyForecast     (gráfico de latência com banda de previsão)
   │  ├─ WorkflowRunner      (pipeline de IA executável)
   │  └─ ConfidencePanel     (linha do tempo de incidente + indicadores)
   ├─ ProductPreview         (#observability: UI funcional com tabs, filtros, mapa, eventos, workflow, painel lateral)
   ├─ Security               (#security: anéis de isolamento + trilha de auditoria + indicadores)
   ├─ Proof                  (composição editorial de citações + marcas fictícias + métricas)
   └─ FinalCTA               (#access: headline + formulário com validação/loading/sucesso + instrumento SVG)
└─ Footer                    (#developers âncora para links de dev, status, contato demo)
```

### Estrutura de pastas

```
src/
  main.tsx, App.tsx
  styles/   tokens.css, globals.css
  data/     topology.ts, telemetry.ts, product.ts, proof.ts   (dados demonstrativos)
  lib/      webgl.ts, useMediaQuery.ts, useActiveSection.ts, motion.ts, cn.ts
  components/
    ui/        Button, StatusBadge, Panel, Sparkline, Logo, SectionHeading
    nav/       Navbar, MobileMenu
    hero/      Hero, HeroScene, TopologyPoster, SceneHud
    three/     SystemCanvas, CoreRings, ServiceNodes, Connections, Signals, PolarGrid
    sections/  Telemetry, SystemMap, Capabilities (+4 subcomponentes), ProductPreview, Security, Proof, FinalCTA, Footer
```

## 3. Dependências

Runtime: `react`, `react-dom`, `three`, `@react-three/fiber`, `motion`, `@phosphor-icons/react`, `@fontsource-variable/archivo`, `@fontsource-variable/jetbrains-mono`.
Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `@types/three`, `tailwindcss`, `@tailwindcss/vite`.

Nenhuma outra. Sem `drei`, sem GSAP, sem bibliotecas de gráfico (gráficos são SVG próprios: poucos pontos, controle total de acessibilidade).

## 4. Fluxo de implementação (ordem real)

1. Scaffold: `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html` (meta, theme-color, preload de fonte).
2. Tokens e base: `tokens.css` (cores, raios, sombras, easing, durações), `globals.css` (Tailwind `@theme`, reset, foco, reduced-motion, utilitários).
3. Dados demonstrativos compartilhados (`topology.ts` é a fonte única dos serviços, usada no hero 3D, no pôster SVG e no produto).
4. Primitivos de UI: Button, StatusBadge, Panel, Sparkline, Logo.
5. Navbar + MobileMenu + `useActiveSection`.
6. Hero com `TopologyPoster` (SVG) primeiro: página já completa e útil sem 3D.
7. Cena 3D (`SystemCanvas`) com lazy load, detecção de WebGL, modo simplificado e pausa fora de viewport.
8. HUD sobre a cena + lista `sr-only` equivalente.
9. Telemetry ticker.
10. SystemMap (desktop horizontal + mobile vertical).
11. Capabilities (4 subcomponentes).
12. ProductPreview (tabs WAI-ARIA, filtros, seleção de nó, painel lateral).
13. Security.
14. Proof.
15. FinalCTA com formulário.
16. Footer.
17. Validação: `tsc`, `vite build`, navegador (console, 375/768/1024/1440/1920, teclado, reduced-motion, fallback WebGL forçado via `?webgl=0`).
18. Revisão visual crítica e correções.

## 5. Estratégia de responsividade

- Mobile-first com breakpoints Tailwind (`sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`).
- Hero: `grid-cols-1` → `lg:grid-cols-12` (texto em 7 colunas, cena ocupando a metade direita em camada absoluta que sangra até a borda da tela).
- Diagramas com dois conjuntos de coordenadas (horizontal ≥ 768px, vertical abaixo), não simples redução de escala.
- Bento: 1 coluna → 2 colunas (md) → 12 colunas com spans (lg).
- Produto: sidebar some abaixo de `lg` e vira seletor de ambiente; painel de detalhe passa a ficar abaixo do mapa.
- `useMediaQuery` decide o nível de qualidade da cena 3D.

## 6. Fallback da cena 3D

Camadas, da mais rica para a mais simples:

1. **Full 3D** (desktop, WebGL ok, sem reduced-motion): todos os nós, sinais animados, parallax, hover com HUD.
2. **Simplified 3D** (largura < 768px, `hardwareConcurrency ≤ 4` ou `deviceMemory ≤ 4`): mesmos nós (o inspetor precisa alcançar todos), sem sinais animados, sem antialias, DPR máx. 1.25, sem hover (toque não tem hover; o inspetor com setas substitui).
3. **Static 3D** (reduced-motion): `frameloop="demand"`, um quadro renderizado, sem rotação nem sinais.
4. **SVG Poster** (WebGL indisponível, falha de contexto, `?webgl=0`, ou enquanto o chunk carrega): projeção 2D da mesma topologia, com a mesma composição, para evitar layout shift.

O canvas é envolvido por um Error Boundary: qualquer erro de runtime do WebGL troca para o pôster SVG. `webglcontextlost` também força o fallback.

## 7. Estratégia de performance

- `React.lazy` para o chunk 3D (three + R3F ≈ maior parte do JS), carregado após `requestIdleCallback`; o pôster SVG é o LCP visual.
- `frameloop` alterna para `"never"` quando a cena sai da viewport (IntersectionObserver) ou a aba fica oculta.
- Geometrias e materiais compartilhados via `useMemo`; sinais em um único `InstancedMesh`; conexões em um único `LineSegments`.
- DPR limitado; `antialias` só no desktop; `powerPreference: "high-performance"` não forçado (padrão).
- Valores contínuos (ponteiro, rotação) em refs, nunca em `useState`.
- `backdrop-filter` só em nav e HUD.
- Animações só em `transform`/`opacity`/`filter`/`stroke-dashoffset`.
- Fontes self-host com `font-display: swap` e preload da Archivo.
- Componentes de seção memoizados onde recebem props estáveis; dados demonstrativos são constantes de módulo.

## 8. Checklist de testes

- [ ] `npm run typecheck` sem erros
- [ ] `npm run build` sem erros e com chunk 3D separado
- [ ] Console sem erros/avisos em carregamento e interação
- [ ] 375, 390, 768, 1024, 1280, 1440, 1920px: sem overflow horizontal (`document.documentElement.scrollWidth === innerWidth`)
- [ ] Navegação por teclado: skip link, nav, menu mobile (Esc, foco preso), tabs com setas, filtros, nós do diagrama, formulário
- [ ] Foco visível em todos os controles
- [ ] `prefers-reduced-motion: reduce`: ticker estático, cena estática, sem reveals
- [ ] `?webgl=0`: pôster SVG aparece no lugar do canvas sem shift
- [ ] Formulário: erro de e-mail vazio/inválido, loading, sucesso
- [ ] Hover nos nós 3D atualiza HUD
- [ ] Seleção de nó no produto atualiza painel lateral; filtros alteram listas; estado vazio aparece
- [ ] Contraste dos textos conforme DESIGN.md
- [ ] Nenhum em-dash em texto visível

## 9. Pendências explícitas

Nenhuma funcionalidade fica como placeholder. Limitações conhecidas (não pendências):
- O formulário de acesso é demonstrativo: valida e simula envio local, sem backend (não existe API do produto fictício).
- Links de rodapé para documentação/blog apontam para âncoras internas, pois as páginas não existem.
- Logos de clientes são marcas geométricas inventadas para empresas fictícias.
