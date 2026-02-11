# Delivery Pipeline

> **Status:** `concluido`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Pipeline de entrega contínua para o Core Stack: GitHub Actions CI (lint, type-check, test, build) em todo PR; CD com deploy preview no Vercel por PR e deploy de produção no merge para main. Inclui branch protection, cache de dependências, sistema de feature flags (toggle on/off, configuração por ambiente, gradual rollout percentual), hook useFeatureFlag, componente Feature, estrutura de configuração e processo de limpeza de flags obsoletas.

## Motivacao

Projetos derivados do Core Stack precisam de CI/CD pronto para acelerar feedback em PRs e garantir qualidade antes do merge. Deploys preview permitem validar mudanças em ambiente similar à produção. Feature flags permitem lançar funcionalidades gradualmente, realizar A/B tests e desativar features rapidamente em caso de problemas, sem redeploy—essencial para equipes que iteram com frequência.

## Requisitos Funcionais

- **RF01:** Workflow CI no GitHub Actions: lint (ESLint), type-check (tsc), test (Vitest), build (next build)
- **RF02:** Workflow CD: deploy preview (Vercel) em cada PR; deploy produção em push/merge para main
- **RF03:** Branch protection para main: require status checks (CI passing), require PR
- **RF04:** Cache de node_modules e .next no CI para reduzir tempo de execução
- **RF05:** Deploy preview gerando URL única por PR (ex: core-stack-abc123.vercel.app)
- **RF06:** Sistema de feature flags: habilitar/desabilitar features sem deploy
- **RF07:** Configuração de flags por ambiente (development, preview, production)
- **RF08:** Gradual rollout: percentual de usuários (ex: 10%, 50%, 100%)
- **RF09:** Hook `useFeatureFlag(flagName)` retornando boolean ou valor configurado
- **RF10:** Componente `<Feature flag="new-dashboard">` para renderização condicional
- **RF11:** Arquivo de configuração de feature flags com tipagem
- **RF12:** Processo documentado para remover feature flags obsoletas (stale cleanup)
- **RF13:** Feature flags sao avaliados em **runtime** (client-side). Para flags que afetam Server Components, usar variaveis de ambiente ou cookies.

## Requisitos Nao-Funcionais

- **RNF01:** CI deve completar em < 5 min para projeto baseline
- **RNF02:** Feature flags devem ser lidas no build time ou runtime sem bloqueio
- **RNF03:** Segredos (tokens, keys) nunca commitados; uso de GitHub Secrets
- **RNF04:** Preview deployments devem ser acessíveis apenas com link (não indexáveis)

## Design da API / Interface

### CI Workflow (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Test
        run: npm run test

      - name: Build
        run: npm run build
        env:
          # Env vars necessárias para build
          NEXT_PUBLIC_APP_URL: https://example.com
```

### CD Workflow (Vercel)

```yaml
# .github/workflows/cd.yml (opcional se usar Vercel GitHub integration)
# Vercel geralmente faz deploy automaticamente via integração.
# Este workflow é para pipelines customizados ou alternativas.

name: CD

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

> **Nota:** A integração nativa Vercel + GitHub já realiza preview por PR e produção em main. O workflow CD acima é para cenários que exigem controle adicional.

### Cache de Dependências

```yaml
# Uso de cache no CI
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # Cache automático de node_modules

# Cache explícito para .next (build cache)
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: |
      .next/cache
      node_modules/.cache
    key: ${{ runner.os }}-next-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
```

### Variaveis de Ambiente no CI

```
Variaveis de ambiente necessarias no CI:
- `VERCEL_TOKEN` - token de deploy para Vercel
- `NEXT_PUBLIC_API_URL` - URL da API (diferente por ambiente)
- `NEXT_PUBLIC_SENTRY_DSN` - DSN do Sentry (opcional)
```

### Feature Flags - Configuração

```ts
// src/config/feature-flags.ts
export type Environment = 'development' | 'preview' | 'production';

export interface FeatureFlagConfig {
  enabled: boolean;
  /** Percentual de usuários (0-100). Ignorado se enabled=false */
  rolloutPercentage?: number;
  /** Override por ambiente */
  environments?: Partial<Record<Environment, boolean | { rolloutPercentage: number }>>;
}

export const featureFlags: Record<string, FeatureFlagConfig> = {
  newDashboard: {
    enabled: true,
    rolloutPercentage: 50,
    environments: {
      development: true,
      preview: true,
      production: { rolloutPercentage: 25 },
    },
  },
  betaSearch: {
    enabled: true,
    environments: {
      development: true,
      preview: true,
      production: false,
    },
  },
  legacyReport: {
    enabled: false, // Flag descontinuada, marcada para remoção
  },
} as const;

export type FeatureFlagName = keyof typeof featureFlags;
```

### Feature Flag Hook

```tsx
// src/hooks/useFeatureFlag.ts
'use client';

import { useMemo } from 'react';
import { featureFlags, type FeatureFlagName } from '@/config/feature-flags';
import { getFeatureFlagValue } from '@/lib/feature-flags';

export function useFeatureFlag(flagName: FeatureFlagName): boolean {
  return useMemo(() => {
    return getFeatureFlagValue(flagName, featureFlags[flagName]);
  }, [flagName]);
}

// Uso
function Dashboard() {
  const showNewDashboard = useFeatureFlag('newDashboard');

  return showNewDashboard ? <NewDashboard /> : <LegacyDashboard />;
}
```

### Feature Flag - Lógica de Resolução

```ts
// src/lib/feature-flags/index.ts
import type { Environment } from '@/config/feature-flags';
import type { FeatureFlagConfig } from '@/config/feature-flags';

function getEnvironment(): 'production' | 'preview' | 'development' {
  // Vercel define NEXT_PUBLIC_VERCEL_ENV automaticamente
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv === 'production') return 'production';
  if (vercelEnv === 'preview') return 'preview';
  return 'development';
}

function getStableId(): string {
  if (typeof window === 'undefined') return 'server';

  const stored = sessionStorage.getItem('feature-flag-id');
  if (stored) return stored;

  const id = crypto.randomUUID();
  sessionStorage.setItem('feature-flag-id', id);
  return id;
}

function isInRollout(flagName: string, percentage: number): boolean {
  const id = getStableId();
  const input = `${flagName}:${id}`;
  // Simple but more uniform hash using FNV-1a
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash % 100) < percentage;
}

export function getFeatureFlagValue(
  flagName: string,
  config: FeatureFlagConfig | undefined
): boolean {
  if (!config?.enabled) return false;

  const env = getEnvironment();
  const envOverride = config.environments?.[env];

  if (envOverride !== undefined) {
    if (typeof envOverride === 'boolean') return envOverride;
    return isInRollout(flagName, envOverride.rolloutPercentage ?? 100);
  }

  const rollout = config.rolloutPercentage ?? 100;
  return isInRollout(flagName, rollout);
}
```

### Feature Flag Component

```tsx
// src/components/shared/Feature.tsx
'use client';

import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { FeatureFlagName } from '@/config/feature-flags';

interface FeatureProps {
  flag: FeatureFlagName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Feature({ flag, children, fallback = null }: FeatureProps) {
  const isEnabled = useFeatureFlag(flag);

  if (!isEnabled) return <>{fallback}</>;
  return <>{children}</>;
}

// Uso
<Feature flag="newDashboard" fallback={<LegacyDashboard />}>
  <NewDashboard />
</Feature>
```

### Branch Protection (Configuração Manual no GitHub)

```
Branch protection recomendada para `main`:
- Require pull request reviews (minimo 1)
- Require status checks to pass (CI workflow)
- Require branches to be up to date
- No force push
```

### Processo de Stale Feature Flag Cleanup

```
1. Marcar flag como enabled: false quando feature for 100% liberada
2. Adicionar comentário no config com data: // REMOVE_AFTER: 2026-03-01
3. Buscar todas as referências: useFeatureFlag('flagName'), <Feature flag="flagName">
4. Remover condicionais e manter código da feature liberada
5. Remover entrada do featureFlags e tipo FeatureFlagName
6. Deletar flag após período de observação (ex: 2 semanas)
7. Documentar no CHANGELOG ou PR
```

## Estrutura de Arquivos

```
.github/
├── workflows/
│   ├── ci.yml
│   └── cd.yml              # Opcional
src/
├── config/
│   └── feature-flags.ts
├── lib/
│   └── feature-flags/
│       ├── index.ts
│       └── resolver.ts
├── hooks/
│   └── useFeatureFlag.ts
├── components/
│   └── shared/
│       └── Feature.tsx
package.json                # Scripts: lint, type-check, test, build
```

> O arquivo `resolver.ts` contem a logica de resolucao de flags (merge de configs, rollout percentual). `index.ts` re-exporta a API publica.

## Dependencias

### Bibliotecas Externas

- Nenhuma extra para feature flags (implementação própria)
- Opcional: `@vercel/analytics` para métricas de rollout

### Serviços

- GitHub Actions (incluído no GitHub)
- Vercel (ou plataforma de hosting compatível)

### Specs Relacionados

- [Estrategia de Testes](./estrategia-testes.md) — testes executados no CI
- [Seguranca & Configuracao](../e-infraestrutura/seguranca-configuracao.md) — variáveis de ambiente
- [Logging & Telemetria](../e-infraestrutura/logging-telemetria.md) — eventos de feature flags

## Criterios de Aceite

- [ ] Workflow CI executando lint, type-check, test, build em todo PR
- [ ] Deploy preview gerado por PR (via Vercel ou workflow custom)
- [ ] Deploy produção em merge para main
- [ ] Cache de npm e .next reduzindo tempo de CI
- [ ] Configuração de feature flags em src/config/feature-flags.ts
- [ ] Hook useFeatureFlag retornando boolean correto por ambiente
- [ ] Componente Feature renderizando children ou fallback conforme flag
- [ ] Rollout percentual funcionando com ID estável por sessão
- [ ] Documentação do processo de stale flag cleanup em CONTRIBUTING ou docs
- [ ] Branch protection documentado em CONTRIBUTING.md com configuracoes recomendadas

## Notas de Implementacao

- O workflow de CI executa os testes definidos na spec de [Estrategia de Testes](./estrategia-testes.md).
- Feature flags podem ser combinados com o sistema de [Autenticacao & Autorizacao](../e-infraestrutura/autenticacao-autorizacao.md) para flags por role/usuario.
- A variavel `NEXT_PUBLIC_VERCEL_ENV` e automaticamente definida pela Vercel; para outros provedores, usar `NODE_ENV` ou variavel customizada.

## Referencias

- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel - GitHub Integration](https://vercel.com/docs/git)
- [Vercel - Preview Deployments](https://vercel.com/docs/deployments/preview-deployments)
- [Feature Flags Best Practices](https://martinfowler.com/articles/feature-toggles.html)
- [Branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branch-protection-rules)
