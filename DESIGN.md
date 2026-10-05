# NEXUS · Design System

> Direção: **Operational Intelligence / Digital Observatory**
> Leitura do briefing: landing page de produto de infraestrutura para público técnico (devs, SRE, DevOps, plataformas), com linguagem de instrumentação científica e centro de controle, apoiada em uma cena 3D de arquitetura viva.
> Dials (taste-skill): `DESIGN_VARIANCE 8` · `MOTION_INTENSITY 6` · `VISUAL_DENSITY 5`.

---

## 1. Missão visual

Fazer o visitante sentir que abriu o **painel de um observatório apontado para a própria infraestrutura**. Cada elemento visual deve parecer um instrumento: algo que mede, aponta, compara ou revela. Nada é decoração pura. A página precisa funcionar como argumento de produto mesmo com todos os efeitos desligados.

## 2. Personalidade da marca

| Somos | Não somos |
| --- | --- |
| Precisos, calmos, confiáveis | Barulhentos, "hype", futuristas de filme B |
| Técnicos sem jargão vazio | Corporativos genéricos |
| Densos quando é útil, arejados no resto | Minimalistas a ponto de esconder informação |
| Cinematográficos nos momentos-chave | Animados o tempo todo |

Idioma: todo o texto da página é em **pt-BR**. Termos técnicos de uso corrente entre engenheiros permanecem em inglês (deploy, workflow, on-call, rollback, canary, cache, SLO, p95, uptime, SSO, control plane), assim como nomes de serviços, comandos e código. Números seguem o formato brasileiro (1.780; 99,99%).

Voz do texto: frases curtas, verbos concretos ("mapear", "rastrear", "detectar", "reverter"). Proibido: "revolucionário", "sem atrito", "next-gen", "potencialize", "eleve".

## 3. Público-alvo

Desenvolvedores, SRE/DevOps, engenheiros de plataforma, CTOs de startups e SaaS, times de infraestrutura e consultorias técnicas. Pessoas que leem gráficos rapidamente e desconfiam de números sem contexto: todo dado exibido tem unidade, janela de tempo e estado.

## 4. Princípios de design

1. **Instrumento antes de ilustração.** Se um elemento visual não mede ou explica algo, ele sai.
2. **Profundidade com propósito.** Camadas (z) representam camadas reais do sistema: borda, serviços, dados, inteligência.
3. **Estado é sempre legível.** Cor nunca é o único portador de significado: todo estado tem rótulo textual e/ou forma.
4. **Ritmo variado.** Nenhuma seção repete a família de layout de outra.
5. **Silêncio entre sinais.** Movimento contínuo só onde representa algo contínuo (tráfego, telemetria).

## 5. Paleta

Tema único: **escuro** (decisão do briefing; a página não alterna para claro). Tokens em `src/styles/tokens.css`.

### Neutros

| Token | Hex | Uso |
| --- | --- | --- |
| `--bg` | `#05080C` | Fundo principal (quase preto, tom azul) |
| `--bg-raised` | `#080D13` | Faixas de seção alternadas |
| `--surface` | `#0B121A` | Painéis |
| `--surface-2` | `#101A24` | Painéis internos, inputs |
| `--surface-3` | `#16222E` | Hover de linha, tabs ativas |
| `--petrol` | `#0C2830` | Superfície de destaque (petróleo) |
| `--line` | `rgba(190, 220, 255, 0.08)` | Divisores |
| `--line-strong` | `rgba(190, 220, 255, 0.16)` | Bordas de painel |
| `--text` | `#E4EDF5` | Texto principal (≈16:1 sobre `--bg`) |
| `--text-muted` | `#93A4B6` | Texto secundário (≈7.6:1) |
| `--text-dim` | `#7A8CA3` | Rótulos terciários e metadados (≥4.7:1 em todas as superfícies, passa AA) |

### Destaques e semânticas

| Token | Hex | Significado |
| --- | --- | --- |
| `--signal` | `#4FD8EB` | **Acento único da marca** (ciano elétrico dessaturado): CTAs, foco, seleção, fluxo de dados |
| `--ok` | `#A6E35E` | Saudável / operacional (verde-lima operacional) |
| `--warn` | `#F2B544` | Degradado / atenção (âmbar) |
| `--crit` | `#FF6B5E` | Erro / incidente (vermelho coral) |
| `--info` | `#8FA8FF` | Eventos informativos (uso raro, só em feeds) |

Regra: **ciano é o único acento de marca**. Verde, âmbar e coral só aparecem como **estado**, nunca como decoração.

### Gradientes

Permitidos apenas em três casos, todos funcionais:
- Scrim radial atrás do texto do hero para garantir contraste sobre a cena 3D.
- Fade de máscara nas bordas do ticker e de diagramas que vazam.
- Faixa de "anomaly band" em gráficos (área de previsão).

Proibido: gradiente roxo, texto com gradiente, blobs, mesh colorido.

## 6. Tipografia

| Papel | Família | Notas |
| --- | --- | --- |
| Display | **Archivo Variable** com eixo `wdth` 112-118, peso 500-600 | Largura expandida dá caráter de instrumento/gravação técnica |
| Texto | **Archivo Variable**, `wdth` 100, peso 400-500 | Mesma família, coerência |
| Dados / leituras | **JetBrains Mono Variable**, peso 400-500, `tabular-nums` | Métricas, logs, IDs, rótulos de instrumento |

Self-hosted via Fontsource (`font-display: swap`). Sem Inter, sem serifas.

### Escala tipográfica (fluida)

| Token | Tamanho | Line-height | Tracking | Uso |
| --- | --- | --- | --- | --- |
| `display-xl` | `clamp(2.5rem, 4.4vw + 0.2rem, 4.5rem)` | 1.02 | -0.035em | H1 hero |
| `display-lg` | `clamp(2rem, 3.2vw + 0.4rem, 3.5rem)` | 1.05 | -0.03em | H2 de seção |
| `display-md` | `clamp(1.5rem, 1.6vw + 0.6rem, 2.125rem)` | 1.12 | -0.02em | H3, citações grandes |
| `title` | `1.125rem` | 1.35 | -0.01em | Títulos de painel |
| `body-lg` | `1.125rem` | 1.6 | 0 | Subtítulos |
| `body` | `1rem` | 1.6 | 0 | Texto corrido (máx. 65ch) |
| `small` | `0.875rem` | 1.5 | 0 | Texto de apoio |
| `mono-sm` | `0.75rem` | 1.4 | 0.04em | Rótulos de instrumento (uppercase permitido) |
| `mono-xs` | `0.6875rem` | 1.3 | 0.06em | Eixos, legendas de gráfico |

Nunca texto de corpo abaixo de 14px. Rótulos mono de 11-12px só para metadados redundantes.

## 7. Espaçamento

Base 4px. Escala: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160`.
- Gutter lateral: 16px (mobile), 24px (tablet), 40px (desktop), container máx. 1320px.
- Seções: `py-24` mobile, `py-32` / `py-40` desktop. O hero tem top padding máx. 96px abaixo da nav.
- Painéis: padding interno 20-28px.

## 8. Raios de borda (regra documentada)

| Token | Valor | Onde |
| --- | --- | --- |
| `--r-xs` | 4px | Badges, `kbd`, marcadores |
| `--r-sm` | 8px | Botões, inputs, tabs, chips de filtro |
| `--r-md` | 14px | Painéis e cards |
| `--r-lg` | 22px | Molduras grandes (janela do produto, CTA final) |

Painéis aninhados usam raio interno = raio externo − padding (concentricidade). Nada de pílulas em botões: o sistema é "instrumento", não "app de consumo".

## 9. Sombras e elevação

Sombras são tingidas de azul, nunca pretas puras.

| Nível | Token | Composição | Uso |
| --- | --- | --- | --- |
| 0 | — | Sem sombra, só `--line` | Superfícies planas, divisores |
| 1 | `--shadow-1` | `0 1px 0 rgba(255,255,255,.04) inset, 0 1px 2px rgba(0,8,20,.4)` | Painéis |
| 2 | `--shadow-2` | `inset highlight + 0 12px 32px -12px rgba(0,10,25,.7)` | Painéis flutuantes, tooltips |
| 3 | `--shadow-3` | `inset highlight + 0 40px 80px -24px rgba(0,12,30,.85)` | Janela do produto, menu mobile |

Brilho (`--glow-signal`) é reservado ao foco e ao núcleo da cena 3D.

## 10. Superfícies

- **Painel instrumento**: `--surface` + borda `--line-strong` + highlight interno superior de 1px. Base de quase tudo.
- **Painel embutido**: `--surface-2`, sem sombra, dentro de painéis.
- **Vidro**: apenas na navbar ao rolar e no HUD sobre a cena 3D (`backdrop-filter: blur(12px)` + fallback sólido em `prefers-reduced-transparency`).
- **Grade de medição**: grid de pontos de baixa opacidade, apenas em áreas de diagrama, nunca no fundo da página inteira.
- Ruído/grão: **não usado** (custo de GPU sem ganho de leitura).

## 11. Botões

| Variante | Visual | Uso |
| --- | --- | --- |
| Primário | Fundo `--signal`, texto `#03181C` (contraste ≈11:1), raio 8px, altura 44px (48px no hero) | Uma ação principal por região |
| Secundário | Fundo transparente, borda `--line-strong`, texto `--text` | Ação alternativa |
| Ghost | Só texto + ícone, sublinhado no hover | Links de navegação contextual |
| Ícone | 44×44px, `aria-label` obrigatório | Menu mobile, controles |

Estados: hover clareia fundo (primário) ou borda (secundário) em 160ms; ícone de seta desloca 2px; `:active` aplica `translateY(1px)`; foco = anel de 2px `--signal` com offset 2px; desabilitado = 40% de opacidade + `cursor: not-allowed`; loading = rótulo mantém largura e ganha indicador de barras mono.

## 12. Cards

Não existe "card genérico". Cada bloco é um **painel instrumento** com:
- Cabeçalho mono (rótulo + estado à direita) opcional;
- Corpo com uma visualização específica;
- Rodapé de metadados opcional.
Cartões idênticos em sequência são proibidos; a grade de capacidades usa 4 composições distintas.

## 13. Badges

- **Estado**: forma + texto + cor. `●` saudável (círculo), `▲` degradado (triângulo), `■` crítico (quadrado). Fonte mono 11-12px, raio 4px, fundo da cor a 12% e texto na cor plena.
- **Neutro**: borda `--line-strong`, texto `--text-muted`.
- Ponto de status animado só existe no indicador global da navbar e no ticker (estado real ao vivo).

## 14. Navegação

- Barra de 64px, transparente sobre o hero; ao rolar >24px recebe fundo `--bg` 72% + blur + borda inferior (transição 240ms).
- Logo tipográfico NEXUS (Archivo expandido, tracking +0.18em) + indicador "All systems nominal".
- Links em uma linha a partir de 1024px. Abaixo disso, botão de menu (44px) abre overlay de tela cheia com links grandes, foco preso no menu, `Esc` fecha, scroll do body travado.
- Link ativo segue a seção visível (IntersectionObserver) com sublinhado `--signal`.

## 15. Dados e gráficos

- Toda métrica tem unidade e janela ("p95 · 24h").
- Números em `tabular-nums`, mono.
- Linhas de 1.5px; área sob a linha no máximo 12% de opacidade.
- Eixos e grades em `--line`; rótulos de eixo `mono-xs` em `--text-dim`.
- Limites/thresholds tracejados em `--warn` ou `--crit` com rótulo textual.
- Sem barras de progresso com trilho preenchido como enfeite.
- Todo gráfico tem resumo textual acessível (`aria-label` ou `<figcaption>`/`sr-only`).
- Dados são **demonstrativos** e marcados assim no código (`src/data/*`).

## 16. Visualização 3D

- Representa uma **arquitetura em camadas**: núcleo NEXUS (anéis de instrumento concêntricos) no centro; nós em três planos inclinados (edge/API, serviços/filas/agentes, dados).
- Geometria por tipo de nó: API = octaedro, serviço = cubo, banco = cilindro, fila = prisma achatado, agente = icosaedro. Forma comunica tipo, não só cor.
- Conexões em curvas finas; sinais (partículas instanciadas) percorrem um subconjunto delas.
- Movimento: rotação lenta (≤ 0.02 rad/s) + parallax do ponteiro (máx. ±0.18 rad) com amortecimento.
- Hover em nó: escala 1.25, anel de seleção, HUD atualiza com nome, tipo, latência e estado.
- Iluminação: uma luz ambiente fria baixa + uma direcional + emissivo no núcleo. Sem pós-processamento (bloom) para poupar GPU.
- Paleta 3D restrita a `--signal`, `--ok`, `--text-muted` e um único nó `--warn` (estado realista).
- Orçamento: < 60 draw calls, DPR máx. 1.75 (desktop) / 1.25 (mobile), pausa quando fora da viewport ou aba oculta.

## 17. Motion

Ponderação (design-motion-principles): **Jakub primário** (polimento), **Jhey secundário** (momentos heroicos), **Emil** em nav, formulário e interações frequentes.

| Token | Valor | Uso |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entradas, hovers |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Transições de estado, troca de tab |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Saídas (mais curtas) |
| `--d-micro` | 120ms | Press, toggles |
| `--d-fast` | 180ms | Hover, foco |
| `--d-base` | 280ms | Painéis, tabs, tooltip |
| `--d-slow` | 560ms | Revelações de seção |
| `--d-hero` | 900ms | Entrada do hero (uma vez) |

Regras:
- Entrada = opacity + translateY(12-24px) + blur(6px→0) apenas no hero. Seções usam animações próprias (desenho de linhas, contagem, varredura), nunca o mesmo fade.
- Saídas ≈ 60% da duração da entrada.
- Nada começa em `scale(0)`; mínimo 0.92.
- Somente `transform`, `opacity`, `filter` e `stroke-dashoffset`.
- Teclado nunca dispara animação longa.
- Loops apenas onde representam dados contínuos (ticker, sinais 3D, linha "live").

## 18. Estados

| Estado | Tratamento |
| --- | --- |
| Hover | Mudança de borda/fundo em 180ms; nada de `scale` em hover de card |
| Focus | Anel `2px solid var(--signal)` + offset 2px, sempre visível em `:focus-visible` |
| Active | `translateY(1px)` em 120ms |
| Loading | Barras mono `▮▮▯` animadas em degraus (steps) ou skeleton com forma final; cena 3D carrega sobre um pôster SVG idêntico em composição |
| Erro | Texto coral abaixo do campo + ícone + `aria-live="polite"`; nunca só cor |
| Sucesso | Mensagem textual com ícone de check, foco movido para a mensagem |
| Vazio | Filtros sem resultado mostram mensagem e ação para limpar filtros |

## 19. Responsividade

| Largura | Estratégia |
| --- | --- |
| 375-390 | Uma coluna; hero: texto → cena 3D em faixa de 340px (modo simplificado) → métricas 2×2; nav em overlay; diagramas viram versão vertical; produto vira tabs empilhadas com painel de detalhe abaixo |
| 768 | Duas colunas onde fizer sentido; cena 3D ainda simplificada; bento em 2 colunas |
| 1024 | Nav completa; hero assimétrico 7/5 com cena sob o texto; bento completo |
| 1280-1440 | Composição completa |
| Ultrawide (≥1920) | Container travado em 1320px; cena 3D e faixas de fundo sangram até a borda para não sobrar vazio |

Sem overflow horizontal: `overflow-x: clip` no `main`, `min-width: 0` em filhos de grid, `overflow-wrap: anywhere` em IDs mono longos. Altura do hero com `min-h-[100dvh]`, nunca `h-screen`.

## 20. Acessibilidade

- HTML semântico: `header/nav/main/section/footer`, um único `h1`, `h2` por seção, `h3` dentro.
- Contraste AA em todo texto (verificado pelos valores da tabela de cores).
- Skip link "Skip to content".
- Todos os controles acessíveis por teclado; diagramas interativos usam `<button>` reais posicionados sobre o SVG.
- `aria-label` em botões de ícone; `aria-pressed`/`aria-selected` em filtros e tabs (padrão WAI-ARIA Tabs com setas).
- Cena 3D: `aria-hidden` no canvas + descrição textual equivalente em lista `sr-only`; HUD também acessível.
- `prefers-reduced-motion`: cena 3D renderiza um único quadro estático; ticker vira linha estática; contadores mostram valor final; reveals viram aparição imediata.
- Alvos de toque ≥ 44×44px.
- Ícones decorativos com `aria-hidden`; ícones nunca substituem texto em ações principais.

## 21. Do's

- Use rótulos mono para metadados de instrumento, com moderação.
- Prefira divisores e espaço a caixas.
- Mostre estados reais (um nó degradado é mais crível que 100% verde).
- Mantenha uma ação primária por região.
- Desenhe diagramas com dados coerentes entre seções (os mesmos serviços aparecem no hero, no mapa e no produto).

## 22. Don'ts

- Gradiente roxo, blobs, glow neon em tudo.
- Glassmorphism fora da nav e do HUD.
- Cards idênticos em sequência; grids de 3 colunas iguais.
- Pulso em vários elementos; `scale` em todo hover.
- Em-dash em texto visível.
- Eyebrows em toda seção (máx. 1 a cada 3 seções).
- Emojis como ícones.
- Números sem unidade.
- Logos de empresas reais.

## 23. Checklist visual final

- [ ] Primeiro viewport tem gesto memorável (cena 3D + headline) e CTA visível sem rolar
- [ ] Headline do hero em no máximo 3 linhas no desktop
- [ ] Nenhuma seção repete família de layout
- [ ] Ciano é o único acento; verde/âmbar/coral só como estado
- [ ] Raios seguem a tabela (4/8/14/22)
- [ ] Todo estado tem forma + texto além de cor
- [ ] Foco visível em todo controle
- [ ] Zero overflow horizontal em 375px
- [ ] Reduced motion testado
- [ ] Fallback da cena 3D testado (sem WebGL)
- [ ] Zero em-dash em texto visível
- [ ] Zero erros no console
- [ ] Dados demonstrativos sinalizados no código e no rodapé
