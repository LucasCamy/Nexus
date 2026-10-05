# NEXUS · Landing page

Landing page experimental para **NEXUS**, uma plataforma **fictícia** de infraestrutura inteligente.
Direção visual: *Operational Intelligence / Digital Observatory*. Todo o conteúdo (empresas, pessoas, métricas, serviços) é demonstrativo. O texto da página está em pt-BR, mantendo em inglês apenas termos técnicos consagrados, nomes de serviços e código.

- Sistema visual: [DESIGN.md](DESIGN.md)
- Plano e arquitetura: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)

## Stack

Vite 8 · React 19 · TypeScript (strict) · Tailwind CSS v4 · Motion (`motion/react`) · three 0.182 + @react-three/fiber 9 · Phosphor Icons · Archivo + JetBrains Mono (self-hosted via Fontsource).

## Executar

Requer Node 20+.

```bash
npm install
```

```bash
npm run dev
```

Abre em `http://localhost:5173`.

```bash
npm run build
```

```bash
npm run preview
```

Outros scripts: `npm run typecheck`.

## Parâmetros úteis para teste

| URL | Efeito |
| --- | --- |
| `/?webgl=0` | Força o fallback SVG da cena 3D |
| Sistema com "Reduzir movimento" ativo | Cena 3D estática, ticker parado, sem reveals |

## Estrutura

```
src/
  data/        Dados demonstrativos (topologia, telemetria, produto)
  lib/         Hooks e utilitários (media query, WebGL, seção ativa, tokens de motion)
  styles/      tokens.css (design tokens) e globals.css (Tailwind + utilitários)
  components/
    ui/        Button, StatusBadge, Sparkline, Logo, SectionHeading
    nav/       Navbar com menu mobile
    hero/      Hero, HeroScene (lazy 3D + fallback), TopologyPoster (SVG), SceneHud
    three/     Cena R3F: núcleo, órbitas, nós, conexões, sinais
    sections/  Telemetry, SystemMap, Capabilities, ProductPreview, Security, Proof, Developers, FinalCTA, Footer
```

## Notas

- O formulário de acesso valida e simula o envio localmente; nada é enviado.
- Comandos e domínios mostrados na seção Developers usam o domínio reservado `.example` e não resolvem.
- `three` está fixado em 0.182 porque versões ≥ 0.183 emitem aviso de depreciação de `THREE.Clock`, que o R3F 9 ainda instancia.
