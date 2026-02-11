# Interacoes Avancadas

> **Status:** `concluido`
> **Prioridade:** `media`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Padroes de interacoes avancadas para o Core Stack: copia para area de transferencia com feedback visual (toast), integracao com Web Share API e fallback para copiar link, sistema de atalhos de teclado globais com cheat sheet (tecla ?) e shortcuts contextuais por pagina, e drag & drop para listas ordenaveis, quadros kanban, upload de arquivos e suporte acessivel via teclado.

## Motivacao

Interacoes avancadas elevam a produtividade e a experiencia do usuario: copiar com um clique evita erros de selecao manual, compartilhar via API nativa oferece UX nativa em mobile, atalhos de teclado agilizam power users, e drag & drop torna a reordenacao intuitiva. Um template base deve fornecer hooks e componentes prontos para essas interacoes, seguindo boas praticas de acessibilidade.

## Requisitos Funcionais

- **RF01:** Copia para clipboard com feedback visual via toast de sucesso/erro
- **RF02:** Hook `useClipboard` que retorna `copy`, `copied` e `error` com timeout de reset
- **RF03:** Integracao com Web Share API: share nativo quando disponivel
- **RF04:** Fallback para copiar link quando Share API nao suportado
- **RF05:** Geracao de link compartilhavel (URL absoluta com path)
- **RF06:** Sistema de atalhos globais: registro de hotkeys, tecla `?` para abrir cheat sheet
- **RF07:** Shortcuts contextuais por pagina/componente (ex: DataTable com Ctr+S para salvar)
- **RF08:** Cheat sheet modal listando atalhos disponiveis no contexto atual
- **RF09:** Listas ordenaveis via drag & drop (dnd-kit ou similar) com persistencia de ordem
- **RF10:** Quadros kanban com colunas e itens arrastaveis
- **RF11:** Zona de upload de arquivos via drag & drop
- **RF12:** DnD acessivel: suporte a teclado (setas, Space, Enter)

## Requisitos Nao-Funcionais

- **RNF01:** Acessibilidade - keyboard support em DnD, aria-live para feedback de copia
- **RNF02:** Performance - hotkeys nao devem causar memory leaks (cleanup no unmount)
- **RNF03:** Fallback gracioso - Share API verifica `navigator.canShare`
- **RNF04:** TypeScript - tipos para payloads de share, config de shortcuts

## Design da API / Interface

### useClipboard

```tsx
// src/hooks/useClipboard.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "@/lib/feedback/toast";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const RESET_DELAY = 2000;

export function useClipboard(options?: { onSuccess?: () => void; onError?: (err: Error) => void }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);
        toast.success("Copiado para a área de transferência");
        options?.onSuccess?.();
        setTimeout(() => setCopied(false), RESET_DELAY);
      } catch (err) {
        const e = err instanceof Error ? err : new Error("Falha ao copiar");
        setError(e);
        toast.error("Não foi possível copiar");
        options?.onError?.(e);
      }
    },
    [options]
  );

  return { copy, copied, error };
}

// Uso
const { copy, copied } = useClipboard();
<Button onClick={() => copy("texto para copiar")}>
  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
  Copiar
</Button>
```

### Share (Web Share API + Fallback)

```tsx
// src/lib/share/index.ts
export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export async function share(options: ShareOptions): Promise<boolean> {
  const { title, text, url } = options;
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

  if (typeof navigator !== "undefined" && navigator.canShare?.({ title, text, url: shareUrl })) {
    try {
      await navigator.share({ title, text, url: shareUrl });
      return true;
    } catch (err) {
      if ((err as Error).name !== "AbortError") throw err;
      return false;
    }
  }

  // Fallback: copiar link
  if (shareUrl) {
    await navigator.clipboard.writeText(shareUrl);
    return true;
  }
  return false;
}

// src/hooks/useShare.ts
import { useState, useCallback } from "react";
import { toast } from "@/lib/feedback/toast";

export function useShare() {
  const [sharing, setSharing] = useState(false);
  const handleShare = useCallback(async (options: ShareOptions) => {
    setSharing(true);
    try {
      const success = await share(options);
      if (success) toast.success("Link copiado para compartilhar");
      return success;
    } finally {
      setSharing(false);
    }
  }, []);
  return { share: handleShare, sharing };
}
```

### Sistema de Atalhos de Teclado

```tsx
// src/lib/shortcuts/useKeyboardShortcut.ts
"use client";

import { useEffect, useCallback, useState } from "react";

type KeyCombo = string; // "mod+s", "ctrl+shift+k", "escape"

export function useKeyboardShortcut(combo: KeyCombo, handler: () => void, options?: { enabled?: boolean }) {
  const { enabled = true } = options ?? {};
  const callback = useCallback(handler, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const parts = combo.toLowerCase().split("+");
      const mod = parts.includes("mod") && (e.metaKey || e.ctrlKey);
      const ctrl = parts.includes("ctrl") && e.ctrlKey;
      const shift = parts.includes("shift") && e.shiftKey;
      const alt = parts.includes("alt") && e.altKey;
      const key = parts.filter((p) => !["mod", "ctrl", "shift", "alt"].includes(p))[0];
      const keyMatch = key ? e.key.toLowerCase() === key : false;

      if (keyMatch && (mod || ctrl || shift || alt || parts.length === 1)) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [combo, callback, enabled]);
}

// src/lib/shortcuts/ShortcutProvider.tsx
interface ShortcutConfig {
  id: string;
  keys: string;
  description: string;
}

const shortcutsContext = createContext<ShortcutConfig[]>([]);

export function ShortcutProvider({ children, shortcuts }: { children: React.ReactNode; shortcuts: ShortcutConfig[] }) {
  return (
    <shortcutsContext.Provider value={shortcuts}>
      {children}
    </shortcutsContext.Provider>
  );
}

// Cheat sheet: tecla ? abre modal com lista
const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
useKeyboardShortcut("?", () => setCheatSheetOpen(true));
```

### Drag & Drop - Sortable List (dnd-kit)

```tsx
// src/components/shared/SortableList.tsx
"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
}

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            {renderItem(item)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### Kanban Board

```tsx
// src/components/shared/KanbanBoard.tsx
"use client";

import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
}

interface KanbanItem {
  id: string;
  title: string;
  description?: string;
}

export function KanbanBoard({
  columns,
  onMoveItem,
}: {
  columns: KanbanColumn[];
  onMoveItem: (itemId: string, fromColumn: string, toColumn: string) => void;
}) {
  return (
    <DndContext onDragEnd={(event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      onMoveItem(
        active.id as string,
        active.data.current?.columnId,
        over.data.current?.columnId ?? over.id as string
      );
    }}>
      <div className="flex gap-4 overflow-x-auto">
        {columns.map((column) => (
          <div key={column.id} className="min-w-[300px] rounded-lg border bg-muted/50 p-4">
            <h3 className="mb-3 font-semibold">{column.title}</h3>
            <SortableContext items={column.items.map((i) => i.id)}>
              {column.items.map((item) => (
                <SortableItem key={item.id} id={item.id}>
                  <div className="mb-2 rounded-md border bg-background p-3">
                    <p className="font-medium">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
```

### File Upload via Drag

> **Nota:** O componente de upload via drag & drop (`FileUpload`) e definido na spec de [Arquivos & Media](../g-media-conteudo/arquivos-media.md). Esta spec cobre apenas o aspecto de **drag & drop para reordenacao** (SortableList, KanbanBoard).

## Estrutura de Arquivos

```
src/
├── hooks/
│   ├── useClipboard.ts
│   └── useShare.ts
├── lib/
│   ├── share/
│   │   └── index.ts
│   └── shortcuts/
│       ├── useKeyboardShortcut.ts
│       ├── ShortcutProvider.tsx
│       └── CheatSheet.tsx
└── components/
    └── shared/
        ├── SortableList.tsx
        ├── SortableItem.tsx
        ├── KanbanBoard.tsx
        ├── KanbanColumn.tsx
        └── KanbanCard.tsx
```

## Dependencias

### Bibliotecas Externas

- `@dnd-kit/core` - primitives para drag & drop
- `@dnd-kit/sortable` - listas ordenaveis
- `@dnd-kit/utilities` - helpers

### Specs Relacionados

- [Feedback & Orientacao](./feedback-orientacao.md) - toast apos copiar, feedback visual
- [Arquivos & Media](../g-media-conteudo/arquivos-media.md) - FileUpload para upload via drag
- [Acessibilidade](../a-fundacao-visual/acessibilidade.md) - keyboard support em DnD
- [Exibicao & Gestao de Dados](../b-dados-formularios/exibicao-gestao-dados.md) - DataTable com shortcuts

## Regras de Uso — Componentes Implementados

### SortableList

```tsx
import { SortableList } from "@/components/shared";

const [items, setItems] = useState([
  { id: "1", label: "Item A" },
  { id: "2", label: "Item B" },
  { id: "3", label: "Item C" },
]);

<SortableList
  items={items}
  onReorder={setItems}
  renderItem={(item) => <span>{item.label}</span>}
  className="max-w-md"
/>
```

**Comportamento:**
- Drag handle (icone grip) a esquerda de cada item
- `PointerSensor` com distancia minima de 8px (evita clicks acidentais)
- `KeyboardSensor` com `sortableKeyboardCoordinates` para acessibilidade
- `closestCenter` collision detection
- Items genericos: qualquer tipo com `{ id: string }` e aceito
- `onReorder` retorna array reordenado via `arrayMove`

### KanbanBoard

```tsx
import { KanbanBoard, type KanbanColumn, type KanbanItem } from "@/components/shared";

const [columns, setColumns] = useState<KanbanColumn[]>([
  {
    id: "todo",
    title: "To Do",
    items: [
      { id: "1", title: "Task A", description: "Optional description" },
    ],
  },
  { id: "done", title: "Done", items: [] },
]);

<KanbanBoard
  columns={columns}
  onMoveItem={(itemId, fromColumn, toColumn, newIndex) => {
    // Atualizar estado movendo o item entre colunas
  }}
  onReorderItem={(columnId, itemId, newIndex) => {
    // Opcional: reordenar dentro da mesma coluna
  }}
/>
```

**Comportamento:**
- Layout horizontal com scroll (`overflow-x-auto`)
- Colunas com largura fixa (288px) e badge de contagem
- Drag overlay com rotacao visual (3deg) para feedback
- `closestCorners` collision detection (melhor para grids)
- `onMoveItem` para mover entre colunas, `onReorderItem` opcional para reordenar dentro da mesma coluna
- Cards com titulo e descricao opcional

### Dependencias

Ambos requerem `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (ja instalados).

### Pagina de Exemplo

Ambos componentes sao demonstrados na galeria de componentes em `/examples/components` (secao "Advanced"). O SortableList inclui 5 items demo reordenaveis. O KanbanBoard inclui 3 colunas com cards demo.

## Criterios de Aceite

- [ ] RF01: Copia com toast de sucesso/erro
- [ ] RF02: useClipboard com copy, copied, error e reset
- [ ] RF03: Share via Web Share API quando navigator.canShare
- [ ] RF04: Fallback para copiar link
- [ ] RF05: Geracao de URL absoluta para compartilhar
- [ ] RF06: useKeyboardShortcut e ShortcutProvider funcionais
- [ ] RF07: Shortcuts contextuais por pagina
- [ ] RF08: Cheat sheet modal com tecla ?
- [x] RF09: SortableList com dnd-kit e persistencia
- [x] RF10: KanbanBoard com colunas e cards arrastaveis
- [ ] RF11: FileDropZone com drag & drop
- [ ] RF12: DnD acessivel com teclado
- [ ] Testes unitarios para useClipboard, useShare, useKeyboardShortcut
- [ ] Storybook com exemplos de SortableList e Kanban

## Notas de Implementacao

- O hook `useClipboard` e definido na spec de [Hooks & Utilitarios](../h-plataforma/hooks-utilitarios.md) como implementacao canonica. Esta spec documenta o **pattern de uso** (com toast de feedback) e o componente `CopyButton`.
- O hook de atalhos de teclado usa o nome padrao `useKeyboardShortcut` definido em [Hooks & Utilitarios](../h-plataforma/hooks-utilitarios.md). Esta spec define o **sistema de shortcuts** (registro, cheat sheet, contextos).
- **Upload via drag** e responsabilidade da spec de [Arquivos & Media](../g-media-conteudo/arquivos-media.md). Esta spec cobre drag & drop para **reordenacao e kanban**.

## Referencias

- [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [dnd-kit](https://dndkit.com/)
- [ARIA: keyboard drag and drop](https://www.w3.org/WAI/ARIA/apg/patterns/drag-and-drop/)
