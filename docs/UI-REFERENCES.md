# Referencias UI/UX Externas

> **Ultima atualizacao:** 2026-02-12
>
> Catalogo de ferramentas, bibliotecas e recursos externos para inspiracao e referencia de UI/UX.
> Usado como base para buscar componentes, padroes de design e tendencias ao evoluir as interfaces do Core Stack.

---

## Plataformas de Descoberta de Componentes

Agregadores que reúnem componentes de diversas fontes, uteis para explorar e encontrar inspiracao rapidamente.

| Plataforma                                     | Descricao                                                                                                                 | Licenca              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| [21st.dev](https://21st.dev/)                  | Componentes UI da comunidade. Marketing blocks (73 heroes, 130 buttons, 102 inputs) e UI components. Feed curado semanal. | Varia por componente |
| [shadcn Registry](https://shadcnregistry.com/) | Diretorio de registries comunitarios para shadcn/ui.                                                                      | Varia                |
| [Tailkits](https://tailkits.com/)              | Agregador de templates e componentes Tailwind CSS.                                                                        | Varia                |

---

## Componentes Animados (copy-paste, shadcn-compativeis)

Bibliotecas de componentes animados que seguem o modelo copy-paste do shadcn/ui, compativeis com React + Tailwind + Framer Motion.

### Magic UI

- **URL:** [magicui.design](https://magicui.design/)
- **GitHub:** [magicuidesign/magicui](https://github.com/magicuidesign/magicui) (20k+ stars)
- **Licenca:** MIT
- **Tech stack:** React, TypeScript, Tailwind CSS, Motion (Framer Motion)
- **Componentes destaque:** Animated Beam, Border Beam, Magic Card, Particles, Confetti, Text Animations, Number Ticker, Marquee, Globe, Bento Grid, Dock
- **CLI:** Integrado ao registry shadcn — `npx shadcn@latest add`
- **Relevancia para o Core Stack:** Fonte principal para efeitos visuais avancados (backgrounds, text effects, social proof com Marquee). Compatibilidade direta com o stack atual.

### Aceternity UI

- **URL:** [ui.aceternity.com](https://ui.aceternity.com/)
- **Licenca:** Varia (verificar por componente)
- **Tech stack:** React, Next.js, Tailwind CSS, Framer Motion
- **Componentes destaque:** Hero sections, backgrounds animados (Aurora, Spotlight, Vortex), cards com efeitos 3D (3D Card, Hover Effect), text effects (Text Generate, Sparkles)
- **CLI:** `npx aceternity-ui init` / `npx aceternity-ui add [component]`
- **Relevancia para o Core Stack:** Referencia para hero sections e backgrounds animados premium. 200+ componentes com foco em visual impact.

### Motion Primitives

- **URL:** [motion-primitives.com](https://motion-primitives.com/)
- **GitHub:** [ibelick/motion-primitives](https://github.com/ibelick/motion-primitives) (5.3k+ stars)
- **Licenca:** MIT
- **Tech stack:** React, Motion (Framer Motion), Tailwind CSS
- **Componentes destaque:** Text effects, carousels, transitions, scroll effects, text morphing, animated numbers
- **CLI:** `npx motion-primitives@latest add [component]`
- **Relevancia para o Core Stack:** Primitivos de animacao puros, otimos para compor efeitos customizados. Foco em qualidade e performance.

### Cult UI

- **URL:** [cult-ui.com](https://www.cult-ui.com/)
- **GitHub:** [nolly-studio/cult-ui](https://github.com/nolly-studio/cult-ui)
- **Licenca:** MIT
- **Tech stack:** React, TypeScript, Next.js, Tailwind CSS, Framer Motion
- **Componentes destaque:** Dynamic Island, MacOS Dock, 3D Carousel, Shader effects, LightBoard, Morph Surface, Neumorph Button, Expandable Card
- **CLI:** Copy-paste manual (sem CLI dedicado)
- **Relevancia para o Core Stack:** Componentes com efeitos visuais unicos e experimentais. Bom para diferenciar interfaces.

### SmoothUI

- **URL:** [smoothui.dev](https://www.smoothui.dev/)
- **Licenca:** Verificar no site
- **Tech stack:** React, Motion (Framer Motion), GSAP, Tailwind CSS
- **Componentes destaque:** Componentes animados compativeis com Server Components
- **Relevancia para o Core Stack:** Unica biblioteca com suporte explicito a React Server Components + GSAP como alternativa ao Framer Motion.

---

## Blocos de Marketing / Landing Pages

Bibliotecas focadas em blocos completos para paginas de marketing (hero, pricing, testimonials, CTAs, etc.).

### Blocks.so

- **URL:** [blocks.so](https://blocks.so/)
- **Licenca:** MIT
- **Tech stack:** React, shadcn/ui, Tailwind CSS
- **Categorias:** Hero, stats, pricing, forms, login, onboarding, sidebars, tables, AI components
- **CLI:** `npx shadcn@latest add @blocks/[component]`
- **Componentes:** 60+ blocos gratuitos
- **Relevancia para o Core Stack:** Integra diretamente com shadcn/ui via registry. Blocos prontos para landing pages.

### Shadcnblocks

- **URL:** [shadcnblocks.com](https://shadcnblocks.com/)
- **Licenca:** Free + Premium ($79/template ou plano mensal)
- **Tech stack:** React, Next.js, Tailwind CSS 4, TypeScript
- **Componentes:** 959+ blocos, 10 templates completos, Figma kit
- **Templates destaque:** Hive (agency), Metafi (marketing site)
- **Relevancia para o Core Stack:** Maior colecao de blocos shadcn. Versao free + premium com templates completos e Figma. Suporte a Tailwind 4.

### Official shadcn/ui Blocks

- **URL:** [ui.shadcn.com/docs/blocks](https://ui.shadcn.com/docs/blocks)
- **Licenca:** MIT
- **Tech stack:** React, Radix UI, Tailwind CSS
- **Descricao:** Blocos oficiais do shadcn/ui integrados ao registry
- **Relevancia para o Core Stack:** Fonte oficial, garantia de compatibilidade.

### Oxbow UI

- **URL:** [oxbowui.com](https://oxbowui.com/)
- **Licenca:** MIT
- **Tech stack:** Tailwind CSS, Alpine.js
- **Componentes:** 427 blocos production-ready
- **Categorias:** Hero (multiplas variacoes), pricing, features (18 componentes), testimonials, CTAs, galleries, landing page templates
- **Relevancia para o Core Stack:** Inspiracao para layouts e patterns de marketing. Requer adaptacao para React (originalmente Alpine.js).

### Treact

- **URL:** [treact.owaiskhan.me](https://treact.owaiskhan.me/)
- **Licenca:** MIT
- **Tech stack:** React, Tailwind CSS
- **Componentes:** 7 landing page demos, 8 inner pages, 52 componentes modulares
- **Categorias:** Heroes, testimonials, features, CTAs, footers, pricing, headers, blogs
- **Relevancia para o Core Stack:** Templates completos gratuitos para referencia. Boa variedade de layouts de landing page.

---

## Headless / Primitivos

Bibliotecas de primitivos unstyled e acessiveis para compor componentes customizados.

| Biblioteca                             | Descricao                                          | Relacao com Core Stack                      |
| -------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| [Radix UI](https://www.radix-ui.com/)  | Base do shadcn/ui. Primitivos acessiveis unstyled. | Ja utilizado (base dos componentes `ui/`)   |
| [Base UI](https://base-ui.com/)        | Primitivos unstyled do time MUI.                   | Alternativa ao Radix para casos especificos |
| [Headless UI](https://headlessui.com/) | Do Tailwind Labs. Compativel com Tailwind.         | Alternativa oficial do ecossistema Tailwind |

---

## Galerias de Inspiracao e Design Patterns

Recursos para estudar patterns de design, analisar landing pages reais e entender tendencias.

| Recurso                                             | Descricao                                                                                                                   |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [SaaSFrame](https://www.saasframe.io/)              | 283+ exemplos reais de landing pages SaaS com analise de padroes. Categorias: landing page, pricing, about, features, blog. |
| [SaaS Hero](https://www.saashero.net/)              | Guias de design para SaaS: hero sections, conversion patterns, enterprise design.                                           |
| [Tailkits](https://tailkits.com/)                   | Agregador de templates e componentes Tailwind CSS.                                                                          |
| [shadcn Registry](https://shadcnregistry.com/)      | Diretorio de registries comunitarios do ecossistema shadcn.                                                                 |
| [Awesome Shadcn UI](https://awesome-shadcn-ui.com/) | Curadoria de projetos, extensoes e recursos do ecossistema shadcn/ui.                                                       |

---

## Tendencias UX/UI 2026

Padroes e tendencias observadas em landing pages SaaS de alto desempenho:

### Hero Sections

- **Story-driven design:** Headlines narrativos que mostram o workflow do produto em vez de descricoes estaticas. Inspiracao: Notion, Linear, Framer.
- **Announcement bars animados:** Badge/pill acima do headline com novidades (nova feature, promo). Animacao sutil de glow ou pulse.
- **Trust signals acima do fold:** Logos de clientes, metricas e social proof posicionados proximos ao hero, nao escondidos abaixo.

### Layouts

- **Bento Grid:** Layout de grid asimetrico para features, inspirado no design do Apple. Cada celula com tamanho e destaque diferentes.
- **Product-led storytelling:** Screenshots reais do produto em vez de ilustracoes abstratas. Browser/device mockups interativos.

### Animacoes e Interacoes

- **Micro-interacoes em tudo:** Hover effects sofisticados (tilt, spotlight, border glow), CTAs com feedback visual imediato.
- **Scroll-triggered reveals:** Conteudo que aparece conforme o usuario rola, com stagger e delays que criam ritmo visual.
- **Marquee/infinite scroll:** Logo clouds e testimonials com scroll automatico infinito.
- **Backgrounds animados:** Particles, aurora, mesh gradients, dot grids — usados com parcimonia como camada de profundidade visual.

### Conversao

- **Framework heuristico de 7 principios (SaaS Hero):**
  1. Relevancia — message match entre ads e landing page
  2. Clareza — value proposition visivel em 5 segundos
  3. Confianca — trust signals acima do fold
  4. Friccao — formularios curtos, navegacao reduzida
  5. Incentivo — free trial, onboarding sem atrito
  6. Ansiedade — badges de seguranca, compliance
  7. Resultado — CTAs orientados a beneficio

- **CTAs personalizados:** Segmentacao por persona (startup vs enterprise, por cargo/industria) com CTAs diferentes.

---

## Como Usar Este Catalogo

### Para buscar inspiracao visual

1. Comece pelas **plataformas de descoberta** (21st.dev, shadcn Registry) para explorar componentes por categoria
2. Use as **galerias de inspiracao** (SaaSFrame, SaaS Hero) para estudar landing pages reais
3. Navegue nos sites das libs de **componentes animados** para ver demos ao vivo

### Para adicionar componentes ao projeto

1. Prefira libs com **licenca MIT** para copy-paste sem restricoes
2. Priorize as que sao **compativeis com shadcn/ui + Tailwind** (Magic UI, Motion Primitives, Blocks.so)
3. Use o modelo **copy-paste** (adaptar ao design system do Core Stack) em vez de instalar via npm
4. Garanta que novos componentes respeitem `prefers-reduced-motion` (ver spec de [Animacoes](specs/a-fundacao-visual/animacoes-micro-interacoes.md))

### Para avaliar novas libs no futuro

Criterios de avaliacao:

- **Compatibilidade:** React 19+, Tailwind v4, TypeScript strict
- **Licenca:** MIT ou similar (permissiva)
- **Manutencao:** Commits recentes, issues respondidas, versao estavel
- **Performance:** Sem impacto em Core Web Vitals, animacoes GPU-accelerated
- **Acessibilidade:** Suporte a `prefers-reduced-motion`, ARIA patterns
- **Modelo de uso:** Copy-paste preferido sobre npm install (maior controle)

### Para manter este catalogo atualizado

- Revisar semestralmente (ou quando iniciar fase de melhoria de UI)
- Adicionar novas libs descobertas seguindo o formato das secoes acima
- Remover libs descontinuadas ou incompativeis com o stack atual
