# Guia de Contribuicao

Como contribuir para o Core Stack seguindo o fluxo spec-driven.

> **Nota:** Este guia e voltado para desenvolvedores humanos. Agentes de IA devem seguir as diretivas em `.cursor/rules/` (especialmente `specs.mdc` para o fluxo spec-driven).

## Fluxo de Desenvolvimento

```
1. Spec (documentar)
   └── 2. Aprovacao (revisar)
       └── 3. Branch (criar)
           └── 4. Implementacao (codar)
               └── 5. Testes (validar)
                   └── 6. PR (revisar)
                       └── 7. Merge (entregar)
```

## 1. Criando uma Nova Spec

Antes de implementar qualquer funcionalidade:

1. Copie o template: `docs/specs/_TEMPLATE.md`
2. Crie o arquivo na pasta apropriada em `docs/specs/`
3. Preencha todos os campos obrigatorios:
   - Status: `rascunho`
   - Resumo e motivacao
   - Requisitos funcionais e nao-funcionais
   - Design da API com exemplos de codigo
   - Dependencias
   - Criterios de aceite
4. Adicione a entrada no indice `docs/specs/README.md`

## 2. Implementando uma Feature

### Pre-requisitos

1. Leia a spec completa em `docs/specs/`
2. Atualize o status da spec para `em-desenvolvimento`
3. Crie uma branch a partir de `main`:

```bash
git checkout -b feat/nome-da-feature
```

### Estrutura de Codigo

Siga a estrutura de pastas definida em [ARCHITECTURE.md](ARCHITECTURE.md):

- **Componentes UI primitivos** → `src/components/ui/` (via shadcn/ui)
- **Componentes compostos** → `src/components/shared/`
- **Layouts** → `src/components/layouts/`
- **Logica de negocio** → `src/lib/<dominio>/`
- **Hooks** → `src/hooks/`
- **Providers** → `src/providers/`
- **Tipos globais** → `src/types/`

### Checklist de Implementacao

- [ ] Codigo segue as convencoes de nomenclatura (ver [ARCHITECTURE.md](ARCHITECTURE.md))
- [ ] TypeScript strict (sem `any`, tipos completos)
- [ ] Componentes acessiveis (ARIA, keyboard nav)
- [ ] Testes escritos (unit e/ou component)
- [ ] Storybook stories criadas (se for componente)
- [ ] Barrel file (`index.ts`) atualizado
- [ ] Criterios de aceite da spec verificados

## 3. Adicionando Componentes shadcn/ui

```bash
# Adicionar um componente
npx shadcn@latest add button

# Adicionar multiplos
npx shadcn@latest add button input dialog toast
```

Os componentes sao instalados em `src/components/ui/`. Customize conforme necessario - sao seus, nao sao dependencias externas.

## 4. Criando Custom Hooks

Hooks ficam em `src/hooks/` e seguem o padrao:

```tsx
// src/hooks/use-debounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

Regras:

- Prefixo `use` obrigatorio
- Um hook por arquivo
- Exportar via barrel file `src/hooks/index.ts`
- Tipos genericos quando aplicavel

## 5. Conventional Commits

Formato: `<tipo>(<escopo>): <descricao>`

### Tipos

| Tipo       | Uso                                |
| ---------- | ---------------------------------- |
| `feat`     | Nova funcionalidade                |
| `fix`      | Correcao de bug                    |
| `docs`     | Documentacao                       |
| `style`    | Formatacao (sem mudanca de logica) |
| `refactor` | Refatoracao de codigo              |
| `test`     | Adicao/correcao de testes          |
| `chore`    | Manutencao (deps, configs)         |

### Escopos (opcionais)

`ui`, `api`, `auth`, `forms`, `i18n`, `seo`, `telemetry`, `hooks`, `config`, `ci`

### Exemplos

```
feat(ui): add Button component with variants
fix(api): handle token refresh race condition
docs(specs): update forms spec with multi-step requirements
test(hooks): add tests for useDebounce hook
chore(ci): add GitHub Actions workflow for lint and tests
```

## 6. Pull Requests

### Formato do PR

**Titulo:** Seguir conventional commits (`feat(ui): add Button component`)

**Corpo:**

```markdown
## Resumo

Breve descricao do que foi feito e por que.

## Spec

Link para a spec: `docs/specs/<pasta>/<arquivo>.md`

## Mudancas

- Mudanca 1
- Mudanca 2

## Checklist

- [ ] Testes passando
- [ ] Lint passando
- [ ] Spec atualizada (status)
- [ ] Storybook atualizado (se aplicavel)
```

## 7. Scripts Disponiveis

### Desenvolvimento

```bash
npm run dev            # Servidor de desenvolvimento (Next.js)
npm run storybook      # Storybook dev server (porta 6006)
```

### Build

```bash
npm run build          # Build de producao (Next.js)
npm run build-storybook # Build estatico do Storybook
npm start              # Servidor de producao (apos build)
```

### Qualidade de Codigo

```bash
npm run lint           # ESLint
npm run lint:fix       # ESLint com auto-fix
npm run lint:ci        # ESLint strict (zero warnings, para CI)
npm run typecheck      # TypeScript type-check (tsc --noEmit)
npm run format         # Prettier (formata todos os arquivos)
npm run format:check   # Prettier (verifica sem alterar, para CI)
```

### Testes

```bash
npm test               # Vitest (execucao unica)
npm run test:debug     # Vitest em modo watch (desenvolvimento)
npm run test:coverage  # Vitest com cobertura (v8)
npm run test:e2e       # Playwright (end-to-end)
npm run test:e2e:ui    # Playwright com UI interativa
```

## 8. Git Hooks (Husky)

O projeto usa [Husky](https://typicode.github.io/husky/) para automatizar verificacoes antes de commits e pushes. Os hooks sao instalados automaticamente via `npm install` (script `prepare`).

### pre-commit

Executado a cada commit. Roda lint e type-check apenas nos arquivos staged:

```bash
npm run lint:staged    # lint-staged (ESLint + Prettier nos arquivos alterados)
npm run typecheck      # TypeScript type-check completo
```

### pre-push

Executado antes de cada push. Roda a suite completa de verificacoes:

```bash
npm run lint:staged    # lint-staged
npm run typecheck      # TypeScript type-check
npm run test           # Vitest (todos os testes)
npm run build          # Build de producao (garante que compila)
```

### commit-msg

Valida a mensagem de commit usando [commitlint](https://commitlint.js.org/) com a convencao Conventional Commits (ver secao 5).
