# Rich Content

> **Status:** `rascunho`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Sistema de conteudo rico para o Core Stack: renderizacao de Markdown (react-markdown), syntax highlighting para codigo (shiki), editor WYSIWYG (Tiptap), estilos de prosa/tipografia para conteudo longo (blog, termos, documentacao), sanitizacao de conteudo gerado por usuario (prevencao XSS), embeds responsivos (YouTube, Twitter/X), geracao automatica de indice (TOC) a partir de headings e botao de copiar codigo em blocos de codigo.

## Motivacao

Documentacao, blogs, termos de uso e comentarios frequentemente exigem Markdown ou HTML rico. Um template base deve oferecer renderizacao segura, syntax highlighting para documentacao tecnica, editor para criacao de conteudo e tipografia adequada para leitura longa. Sanitizacao e critica para prevenir XSS em conteudo gerado por usuario.

## Requisitos Funcionais

- **RF01:** Renderizacao de Markdown com suporte a headings, listas, links, imagens, tabelas, code blocks
- **RF02:** Syntax highlighting em blocos de codigo com shiki. Utilizar `shiki` como highlighter padrao (suporte a temas, server-side rendering, performante). Prism nao sera incluido para evitar duplicidade.
- **RF03:** Tema de syntax configurável (light/dark)
- **RF04:** Editor WYSIWYG baseado em Tiptap com toolbar basica (bold, italic, listas, links)
- **RF05:** Estilos de prosa/tipografia para conteudo longo: titulos, paragrafos, listas, blockquotes, codigo inline
- **RF06:** Sanitizacao de HTML/Markdown para prevenir XSS (DOMPurify ou similar)
- **RF07:** Embeds responsivos: YouTube, Twitter/X, iframes com aspect-ratio preservado
- **RF08:** TOC (Table of Contents) gerado automaticamente a partir de headings (h2, h3)
- **RF09:** Botao "Copiar" em blocos de codigo com feedback visual

## Requisitos Nao-Funcionais

- **RNF01:** Seguranca - sanitizacao obrigatoria para conteudo user-generated
- **RNF02:** Performance - syntax highlighting lazy ou em build-time quando possivel
- **RNF03:** Acessibilidade - contraste em code blocks, estrutura semantica (headings)
- **RNF04:** TypeScript - tipos para componentes de Markdown e props do editor

## Design da API / Interface

### Markdown Rendering

```tsx
// src/components/content/MarkdownContent.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
import { sanitize } from "@/lib/security/sanitize";

interface MarkdownContentProps {
  content: string;
  sanitize?: boolean; // default true para user content
  className?: string;
}

export function MarkdownContent({ content, sanitize: doSanitize = true, className }: MarkdownContentProps) {
  const safeContent = doSanitize ? sanitize(content) : content;

  return (
    <div className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ node, inline, className, children, ...props }) =>
            inline ? (
              <code className={cn("rounded bg-muted px-1 py-0.5", className)} {...props}>
                {children}
              </code>
            ) : (
              <CodeBlock
                language={className?.replace("language-", "") ?? "text"}
                code={String(children).replace(/\n$/, "")}
              />
            ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
}
```

### Code Block com Syntax Highlight e Copy

```tsx
// src/components/content/CodeBlock.tsx
"use client";

import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const { copy, copied } = useClipboard();

  useEffect(() => {
    codeToHtml(code, {
      lang: language,
      theme: "github-dark",
    }).then(setHtml);
  }, [code, language]);

  return (
    <div className="relative group rounded-lg overflow-hidden border">
      {filename && (
        <div className="px-4 py-2 bg-muted text-sm font-mono">{filename}</div>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => copy(code)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded bg-muted hover:bg-muted/80"
          aria-label="Copiar código"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
        <div
          className="p-4 overflow-x-auto text-sm"
          dangerouslySetInnerHTML={{ __html: html || "" }}
        />
      </div>
    </div>
  );
}
```

### Sanitizacao

```tsx
// src/lib/security/sanitize.ts
import DOMPurify from "dompurify";

export function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "code", "pre", "blockquote", "img"],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class"],
  });
}
```

### Rich Text Editor (Tiptap)

```tsx
// src/components/content/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from "lucide-react";

interface RichTextEditorProps {
  content?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  minHeight?: string;
}

export function RichTextEditor({
  content = "",
  placeholder = "Escreva aqui...",
  onChange,
  minHeight = "150px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex gap-1 p-2 border-b bg-muted/30">
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="p-4" style={{ minHeight }} />
    </div>
  );
}
```

### Prose / Typography Styles

> Utilizar `@tailwindcss/typography` como plugin base para prose styles. O arquivo `prose.css` customiza tokens especificos (cores, espacamento) sobre a base do plugin.

```css
/* src/styles/prose.css ou em globals.css */
@layer components {
  .prose {
    @apply text-foreground;
  }
  .prose h1 { @apply text-3xl font-bold mt-8 mb-4; }
  .prose h2 { @apply text-2xl font-semibold mt-8 mb-3 border-b pb-2; }
  .prose h3 { @apply text-xl font-semibold mt-6 mb-2; }
  .prose p { @apply my-4 leading-7; }
  .prose ul { @apply list-disc pl-6 my-4 space-y-1; }
  .prose ol { @apply list-decimal pl-6 my-4 space-y-1; }
  .prose blockquote { @apply border-l-4 border-muted-foreground pl-4 italic my-4; }
  .prose code { @apply bg-muted rounded px-1 py-0.5 text-sm font-mono; }
  .prose pre { @apply p-4 rounded-lg overflow-x-auto my-4; }
  .prose a { @apply text-primary underline underline-offset-4 hover:text-primary/80; }
}
```

### Embeds Responsivos

```tsx
// src/components/content/ResponsiveEmbed.tsx
"use client";

import { cn } from "@/lib/utils";

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

interface ResponsiveEmbedProps {
  type: "youtube" | "twitter" | "generic";
  url: string;
  className?: string;
}

export function ResponsiveEmbed({ type, url, className }: ResponsiveEmbedProps) {
  if (type === "youtube") {
    const videoId = extractYouTubeId(url);
    return (
      <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden", className)}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube embed"
          className="absolute inset-0 w-full h-full"
          allowFullScreen
        />
      </div>
    );
  }

  if (type === "twitter") {
    return (
      <div className={cn("relative w-full max-w-md", className)}>
        <blockquote className="twitter-tweet">
          <a href={url} />
        </blockquote>
        <script async src="https://platform.twitter.com/widgets.js" />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden", className)}>
      <iframe src={url} title="Embed" className="absolute inset-0 w-full h-full" />
    </div>
  );
}
```

### Table of Contents

```tsx
// src/components/content/TableOfContents.tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number; // 2 = h2, 3 = h3
}

interface TableOfContentsProps {
  containerRef: React.RefObject<HTMLElement>;
  className?: string;
}

export function TableOfContents({ containerRef, className }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const headings = el.querySelectorAll("h2, h3");
    const tocItems: TocItem[] = [];
    headings.forEach((h, i) => {
      const id = h.id || `heading-${i}`;
      if (!h.id) h.id = id;
      tocItems.push({
        id,
        text: h.textContent ?? "",
        level: parseInt(h.tagName[1], 10),
      });
    });
    setItems(tocItems);
  }, [containerRef]);

  return (
    <nav className={cn("space-y-2", className)} aria-label="Índice">
      <h3 className="font-semibold text-sm">Neste artigo</h3>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ marginLeft: (item.level - 2) * 12 }}
            className="text-muted-foreground hover:text-foreground"
          >
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

## Estrutura de Arquivos

```
src/
├── components/
│   └── content/
│       ├── MarkdownContent.tsx
│       ├── CodeBlock.tsx
│       ├── RichTextEditor.tsx
│       ├── ResponsiveEmbed.tsx
│       └── TableOfContents.tsx
├── lib/
│   └── security/
│       └── sanitize.ts
└── styles/
    └── prose.css
```

## Dependencias

### Bibliotecas Externas

- `react-markdown` - renderizacao Markdown
- `remark-gfm` - GitHub Flavored Markdown (tabelas, strikethrough)
- `shiki` - syntax highlighting (highlighter padrao do projeto)
- `@tiptap/react` - editor WYSIWYG
- `@tiptap/starter-kit` - extensoes basicas
- `@tiptap/extension-link` - links
- `@tiptap/extension-placeholder` - placeholder
- `dompurify` - sanitizacao XSS
- `@tailwindcss/typography` - plugin base para prose styles

### Specs Relacionados

- [Seguranca & Configuracao](../e-infraestrutura/seguranca-configuracao.md) - sanitizacao, CSP
- [Feedback & Orientacao](../f-padroes-ux/feedback-orientacao.md) - toast apos copiar codigo
- [Interacoes Avancadas](../f-padroes-ux/interacoes-avancadas.md) - useClipboard
- [Design System](../a-fundacao-visual/design-system.md) - typography tokens

## Notas de Implementacao

- A sanitizacao de HTML usa `DOMPurify`, alinhado com a spec de [Seguranca & Configuracao](../e-infraestrutura/seguranca-configuracao.md).
- O botao "Copiar" no `CodeBlock` utiliza o hook `useClipboard` da spec de [Hooks & Utilitarios](../h-plataforma/hooks-utilitarios.md).
- Prose styles dependem do plugin `@tailwindcss/typography`. O arquivo `prose.css` customiza sobre a base do plugin.

## Criterios de Aceite

- [ ] RF01: Markdown renderizado com remark-gfm
- [ ] RF02: Syntax highlighting com shiki
- [ ] RF03: Tema light/dark para code blocks
- [ ] RF04: RichTextEditor com Tiptap e toolbar basica
- [ ] RF05: Estilos prose aplicados corretamente
- [ ] RF06: Sanitizacao para conteudo user-generated
- [ ] RF07: ResponsiveEmbed para YouTube e Twitter
- [ ] RF08: TableOfContents gerado a partir de headings
- [ ] RF09: Botao copiar em CodeBlock com feedback
- [ ] Testes unitarios para sanitize
- [ ] Storybook com MarkdownContent, CodeBlock, RichTextEditor

## Referencias

- [react-markdown](https://github.com/remarkjs/react-markdown)
- [remark-gfm](https://github.com/remarkjs/remark-gfm)
- [shiki](https://shiki.matsu.io/)
- [Tiptap](https://tiptap.dev/)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)
