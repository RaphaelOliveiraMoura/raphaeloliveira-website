# Feedback & Orientacao ao Usuario

> **Status:** `concluido`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Sistema completo de feedback e orientacao ao usuario no Core Stack, cobrindo notificacoes in-app (centro de notificacoes com badge, categorias e persistencia), toasts transientes via Sonner, empty/error/skeleton states padronizados, dialogs de confirmacao, padroes de desfazer, feedback visual em acoes (loading, checkmarks), deteccao de estado offline, paginas de erro customizadas (404/500) e sistema de onboarding/tour com coachmarks, tooltips guiados e descoberta de funcionalidades.

## Motivacao

Usuarios precisam de feedback imediato e contextual para entender o resultado de suas acoes. Sem isso, surge incerteza ("salvou ou nao?"), frustracao em erros sem retry e abandono em fluxos complexos. O sistema de feedback unifica padroes de UX para notificacoes, loading, erros, empty states e onboarding, garantindo consistencia em qualquer projeto derivado do Core Stack.

## Requisitos Funcionais

- **RF01:** Centro de notificacoes in-app com drawer/sheet, listagem por categorias (info, success, warning, error), badge de contagem nao lidas e persistencia (localStorage ou backend)
- **RF02:** Toast notifications via Sonner para feedback transiente (sucesso, erro, aviso, info) com duracao configurável
- **RF03:** Empty states padronizados com ilustracao, titulo, descricao e CTA opcional
- **RF04:** Skeleton loaders por tipo de conteudo: text lines, card grid, table, list
- **RF05:** Error states com mensagem, sugestao de acao e botao "Tentar novamente"
- **RF06:** Deteccao de estado offline e UI dedicada (banner ou overlay)
- **RF07:** Paginas customizadas 404 (nao encontrado) e 500 (erro do servidor) com CTAs para voltar/inicio
- **RF08:** Dialogs de confirmacao reutilizaveis ("Tem certeza?") com variantes destrutivas
- **RF09:** Padroes de undo: toast "Item deletado. Desfazer" com callback de reversao
- **RF10:** Feedback visual em botoes: loading spinner durante submit, checkmark apos sucesso
- **RF11:** Sistema de onboarding/tour: coachmarks, tooltips guiados, experiencia first-time, descoberta de features, tracking de progresso do tour

## Requisitos Nao-Funcionais

- **RNF01:** Acessibilidade - ARIA live regions para toasts, roles corretos em dialogs
- **RNF02:** Performance - notificacoes nao devem bloquear renderizacao principal
- **RNF03:** Responsividade - centro de notificacoes usavel em mobile
- **RNF04:** TypeScript - tipos para categorias, payloads e callbacks

## Design da API / Interface

### Toast (Sonner)

```tsx
// src/lib/feedback/toast.ts
import { toast as sonnerToast } from "sonner";

// API do Toast (baseado em Sonner)
// toast.success(message: string, options?: ToastOptions)
// toast.error(message: string, options?: ToastOptions)
// toast.warning(message: string, options?: ToastOptions)
// toast.info(message: string, options?: ToastOptions)
// toast.promise(promise: Promise, messages: { loading: string; success: string; error: string })

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    sonnerToast.success(message, options),
  error: (message: string, options?: ToastOptions) =>
    sonnerToast.error(message, options),
  warning: (message: string, options?: ToastOptions) =>
    sonnerToast.warning(message, options),
  info: (message: string, options?: ToastOptions) =>
    sonnerToast.info(message, options),
  promise: <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => sonnerToast.promise(promise, messages),
};

// Uso
toast.success("Salvo com sucesso");
toast.error("Falha ao salvar", { description: "Verifique sua conexão." });
toast.promise(saveMutation.mutateAsync(), {
  loading: "Salvando...",
  success: "Salvo!",
  error: "Erro ao salvar",
});
```

### Padrao Undo

```tsx
// Uso com callback de reversao
import { toast } from "@/lib/feedback/toast";

function handleDelete(itemId: string) {
  performDelete(itemId);
  toast.success("Item removido", {
    description: "O item foi movido para a lixeira",
    action: {
      label: "Desfazer",
      onClick: () => restoreItem(itemId),
    },
  });
}
```

### Empty State

```tsx
// src/components/shared/empty-state.tsx
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

### Skeleton Loaders

```tsx
// src/components/shared/skeleton-presets.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="mt-4 h-4 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
```

### Error State com Retry

```tsx
// src/components/shared/error-state.tsx
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Não foi possível carregar. Tente novamente.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border p-12 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
```

### Confirmacao Dialog

```tsx
// src/components/shared/confirm-dialog.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === "destructive" ? "bg-destructive text-destructive-foreground" : ""}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Uso: "Tem certeza que deseja excluir?"
```

### Button Loading State

```tsx
// src/components/shared/loading-button.tsx
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  success?: boolean;
}

export function LoadingButton({ loading, success, children, disabled, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {success && <Check className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );
}
```

### Centro de Notificacoes

```tsx
// src/components/shared/notification-center.tsx
import { useState } from "react";

interface Notification {
  id: string;
  category: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  read: boolean;
  createdAt: Date;
}

// Hook e componente com Sheet, listagem, badge
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAsRead = (id: string) => { /* ... */ };
  return { notifications, unreadCount, markAsRead };
}
```

### Onboarding / Tour

```tsx
// src/lib/feedback/onboarding.ts
// Utilizar `driver.js` como biblioteca padrao para tours/coachmarks
// (leve, sem dependencias React). Para integracao React, criar wrapper component `Tour`.
// Store de progresso (localStorage: "tour:dashboard:step3")

interface TourStep {
  target: string; // selector ou ref
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface TourConfig {
  id: string;
  steps: TourStep[];
  onComplete?: () => void;
}

// Uso: <Tour config={dashboardTourConfig} />
```

## Estrutura de Arquivos

```
src/
├── components/
│   └── shared/
│       ├── empty-state.tsx
│       ├── error-state.tsx
│       ├── skeleton-presets.tsx
│       ├── confirm-dialog.tsx
│       ├── loading-button.tsx
│       ├── notification-center.tsx
│       ├── tour.tsx
│       └── offline-banner.tsx
├── app/
│   ├── not-found.tsx              # 404 customizado
│   └── error.tsx                  # Error boundary 500
├── lib/
│   └── feedback/
│       ├── toast.ts
│       ├── onboarding.ts
│       └── use-notifications.ts
└── hooks/
    └── use-online-status.ts
```

## Dependencias

### Bibliotecas Externas

- `sonner` - toasts leves e acessiveis
- `@radix-ui/react-alert-dialog` - dialogs de confirmacao
- `driver.js` - biblioteca padrao para tours guiados e coachmarks

### Specs Relacionados

- [Acessibilidade](../a-fundacao-visual/acessibilidade.md) - live regions, focus em dialogs
- [Componentes & Storybook](../a-fundacao-visual/componentes-storybook.md) - Skeleton, Button, Sheet
- [Layouts & Responsividade](../a-fundacao-visual/layouts-responsividade.md) - drawer de notificacoes
- [Internacionalizacao](../e-infraestrutura/internacionalizacao.md) - textos de feedback traduziveis

## Criterios de Aceite

- [ ] RF01: Centro de notificacoes com categorias, badge e persistencia
- [ ] RF02: Sonner configurado e wrappers toast.success/error/etc. exportados
- [ ] RF03: EmptyState com ilustracao, titulo, descricao e CTA
- [ ] RF04: SkeletonPresets para text, card, table, list
- [ ] RF05: ErrorState com retry button
- [ ] RF06: OfflineBanner/Overlay detectando navigator.onLine
- [ ] RF07: not-found.tsx e error.tsx customizados
- [ ] RF08: ConfirmDialog reutilizavel com variante destructive
- [ ] RF09: Padrao undo via toast.action (Desfazer)
- [ ] RF10: LoadingButton com loading e success states
- [ ] RF11: Tour/onboarding com coachmarks e progresso persistido
- [ ] Testes unitarios para EmptyState, ErrorState, ConfirmDialog, LoadingButton e NotificationCenter
- [ ] Storybook stories para: EmptyState (com/sem CTA), ErrorState (com/sem retry), SkeletonPresets (text, card, table), LoadingButton (idle, loading, success)

## Notas de Implementacao

- **Error boundaries** (ErrorBoundary, SectionErrorBoundary) sao definidos nesta spec como implementacao canonica. A spec de [Cliente API & Erros](../c-api-servidor/cliente-api-erros.md) normaliza os erros que alimentam esses boundaries.
- **Toast** usa Sonner como base. Todas as specs que exibem toasts devem usar a mesma API definida aqui.
- **ConfirmDialog** e o padrao para confirmacao de acoes destrutivas. A spec de [Exibicao & Gestao de Dados](../b-dados-formularios/exibicao-gestao-dados.md) referencia este componente para exclusoes.

## Referencias

- [Sonner](https://sonner.emilkowal.ski/)
- [Radix Alert Dialog](https://www.radix-ui.com/primitives/docs/components/alert-dialog)
- [Driver.js](https://driverjs.com/)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)
