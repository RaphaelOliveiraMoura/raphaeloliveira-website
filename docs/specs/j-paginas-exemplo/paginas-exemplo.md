# Paginas de Exemplo

> **Status:** `concluido`
> **Prioridade:** `media`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Conjunto de paginas de referencia que demonstram todos os componentes, hooks e utilitarios do Core Stack em contexto de uso real. Servem como guia prático para desenvolvedores que iniciam projetos a partir do template.

## Motivacao

O Core Stack possui 78+ componentes, 28+ hooks e dezenas de utilitarios, mas sem exemplos integrados ficava difícil para novos desenvolvedores entenderem como combinar essas pecas. As paginas de exemplo resolvem isso oferecendo implementacoes de referencia prontas para copiar e adaptar.

## Requisitos Funcionais

- **RF01:** Landing page marketing com hero, features grid, stats e CTA
- **RF02:** Dashboard aprimorado com cards formatados, progress, tabs, skeletons e feature flags
- **RF03:** Pagina de gestao de dados com DataTable, filtros, busca debounced, paginacao, export CSV/JSON, lista virtualizada e confirmacao de delecao
- **RF04:** Pagina de formularios com validacao Zod, inputs mascarados, upload de arquivo e campos condicionais por permissao
- **RF05:** Pagina de configuracoes com toggle de tema, troca de idioma, cookie consent, atalhos de teclado, toasts e funcionalidades PWA
- **RF06:** Galeria de componentes (kitchen sink) com todos os primitivos UI organizados por categoria
- **RF07:** Playground de hooks com demos interativas ao vivo
- **RF08:** Pagina indice com cards linkando para todas as paginas de exemplo
- **RF09:** Pagina de animacoes & micro-interacoes com demos interativas dos primitivos de motion (FadeIn, StaggerChildren, AnimateOnScroll, CountUp, TypeWriter, etc.)

## Requisitos Nao-Funcionais

- **RNF01:** Todos os textos utilizam i18n (namespace `examples`) em 3 idiomas (pt-BR, en, es)
- **RNF02:** Todas as paginas seguem as convencoes do projeto (imports via `@/`, barrel files, kebab-case)
- **RNF03:** Acessibilidade WCAG 2.1 AA (labels, aria, keyboard navigation)
- **RNF04:** TypeScript strict mode, sem uso de `any`
- **RNF05:** Responsividade — todas as paginas funcionam em mobile, tablet e desktop

## Estrutura de Arquivos

```
src/app/[locale]/
├── (marketing)/
│   └── page.tsx                      # Landing page
├── (dashboard)/dashboard/
│   ├── page.tsx                      # Dashboard aprimorado
│   ├── data/page.tsx                 # Gestao de dados
│   ├── forms/page.tsx                # Formularios
│   └── settings/page.tsx             # Configuracoes
└── (examples)/examples/
    ├── layout.tsx                    # Layout dos exemplos
    ├── page.tsx                      # Indice
    ├── components/page.tsx           # Galeria de componentes
    ├── hooks/page.tsx                # Playground de hooks
    └── animations/page.tsx           # Animacoes & micro-interacoes

src/lib/utils/mock-data.ts            # Dados mock reutilizaveis
messages/{locale}/examples.json       # Traducoes (3 locales)
```

## Dependencias

### Bibliotecas Externas

Nenhuma nova — utiliza apenas dependencias ja existentes no projeto.

### Specs Relacionados

- [Componentes & Storybook](../a-fundacao-visual/componentes-storybook.md) - componentes demonstrados
- [Layouts & Responsividade](../a-fundacao-visual/layouts-responsividade.md) - layouts utilizados
- [Formularios](../b-dados-formularios/formularios.md) - padroes de formulario
- [Exibicao & Gestao de Dados](../b-dados-formularios/exibicao-gestao-dados.md) - DataTable e export
- [Hooks & Utilitarios](../h-plataforma/hooks-utilitarios.md) - hooks demonstrados
- [Internacionalizacao](../e-infraestrutura/internacionalizacao.md) - namespace `examples`
- [Animacoes & Micro-Interacoes](../a-fundacao-visual/animacoes-micro-interacoes.md) - primitivos de motion demonstrados

## Criterios de Aceite

- [x] Landing page com hero, features, stats e CTA
- [x] Dashboard com formatadores, progress, tabs, skeletons e feature flags
- [x] Pagina de dados com DataTable, filtros, busca, paginacao e export
- [x] Pagina de formularios com Zod, mascaras, upload e permissoes
- [x] Pagina de configuracoes com tema, idioma, toasts, atalhos e PWA
- [x] Galeria de componentes com todas as categorias (incluindo secao "Advanced" com Lightbox, VideoPlayer, NotificationCenter, ImageCropUpload, SortableList, KanbanBoard)
- [x] Playground de hooks com demos interativas
- [x] Pagina indice com navegacao para todos os exemplos
- [x] Traducoes em pt-BR, en e es
- [x] Navegacao atualizada (sidebar, navbar, command palette)
- [x] Dados mock centralizados em arquivo reutilizavel
- [x] Pagina de animacoes com demos interativas dos primitivos de motion

## Referencias Externas

Catalogo de libs de componentes, blocos de marketing e inspiracao para landing pages: **[docs/UI-REFERENCES.md](../../UI-REFERENCES.md)**.

Recursos uteis para novas paginas de exemplo: 21st.dev (galeria de componentes), SaaSFrame (exemplos reais de landing pages), Blocks.so e Shadcnblocks (blocos de marketing prontos). Ver catalogo completo.
