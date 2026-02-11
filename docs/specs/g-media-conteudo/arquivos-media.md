# Arquivos & Media

> **Status:** `concluido`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Sistema de gerenciamento de arquivos e midia para o Core Stack: upload com zona de drag & drop, barra de progresso, preview (imagens e PDFs), multiplos arquivos, validacao de tipo e tamanho, crop/resize de imagens pre-upload, galeria/lightbox com zoom e navegacao por teclado, componente Avatar com fallback de iniciais e indicador de status, imagens responsivas via Next/Image com blur placeholder e lazy loading, player de video basico e download com progresso.

> **Nota:** Este spec define o componente canônico `FileUpload` para upload de arquivos. A spec de [Interacoes Avancadas](../f-padroes-ux/interacoes-avancadas.md) referencia este componente para o aspecto de drag & drop.

## Motivacao

Aplicacoes modernas frequentemente lidam com upload de arquivos (avatares, documentos), exibicao de galerias, avatares de usuario e midia embarcada. Um template base deve oferecer componentes prontos e padroes consistentes: validacao de arquivos, preview antes do envio, lightbox acessivel, avatares com fallback e imagens otimizadas para performance (blur, lazy loading).

## Requisitos Funcionais

- **RF01:** Zona de upload drag & drop com feedback visual (hover, estado ativo)
- **RF02:** Barra de progresso durante upload (0-100%)
- **RF03:** Preview de arquivos: thumbnails para imagens, icone para PDFs
- **RF04:** Upload multiplo com lista de arquivos selecionados
- **RF05:** Validacao: tipos de arquivo aceitos (accept), tamanho maximo (maxSize), mensagens de erro
- **RF06:** Crop e resize de imagem antes do upload (opcional, via lib como react-image-crop)
- **RF07:** Galeria/lightbox com zoom, navegacao anterior/proximo, teclado (Escape, setas)
- **RF08:** Componente Avatar com imagem, fallback de iniciais, indicador de status (online, offline, busy)
- **RF09:** Imagens responsivas com Next/Image, blur placeholder e lazy loading
- **RF10:** Player de video basico (play/pause, volume, fullscreen, tecla Espaco)
- **RF11:** Download de arquivo com indicador de progresso (fetch + ReadableStream ou similar)

## Requisitos Nao-Funcionais

- **RNF01:** Acessibilidade - labels em zonas de upload, suporte a teclado no lightbox
- **RNF02:** Performance - preview de imagens via URL.createObjectURL com revoke
- **RNF03:** Seguranca - validacao de tipo no cliente e servidor
- **RNF04:** TypeScript - tipos para FileWithPreview, UploadState, etc.

## Design da API / Interface

### File Upload com react-dropzone

```tsx
// src/components/shared/FileUpload.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
}

export function FileUpload({ onUpload, accept, maxSize = 5 * 1024 * 1024, maxFiles = 5 }: FileUploadProps) {
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const urls = acceptedFiles
      .filter((f) => f.type.startsWith("image/") || f.type === "application/pdf")
      .map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews(urls);

    // Simulate progress - em producao usar XMLHttpRequest.upload.onprogress
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? (clearInterval(interval), 100) : p + 10));
    }, 200);
    onUpload(acceptedFiles).finally(() => {
      clearInterval(interval);
      setProgress(100);
      urls.forEach((u) => URL.revokeObjectURL(u.url));
    });
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: accept ?? { "image/*": [".png", ".jpg", ".jpeg", ".webp"], "application/pdf": [".pdf"] },
    maxSize,
    maxFiles,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
      >
        <input {...getInputProps()} />
        Arraste arquivos ou clique para selecionar
      </div>
      {fileRejections.length > 0 && (
        <p className="mt-2 text-sm text-destructive">
          {fileRejections.map((r) => r.errors.map((e) => e.message).join(", ")).join("; ")}
        </p>
      )}
      {progress > 0 && <Progress value={progress} className="mt-4" />}
      <div className="mt-4 flex gap-2 flex-wrap">
        {previews.map((p) => (
          <div key={p.file.name} className="relative">
            <img src={p.url} alt={p.file.name} className="h-20 w-20 rounded object-cover" />
            <span className="text-xs truncate block w-20">{p.file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Image Crop antes do Upload

```tsx
// src/components/shared/ImageCropUpload.tsx
"use client";

import { useState, useCallback } from "react"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button } from "@/components/ui/button"

interface ImageCropUploadProps {
  onCropped: (blob: Blob) => void
  aspectRatio?: number
}

export function ImageCropUpload({ onCropped, aspectRatio = 1 }: ImageCropUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()

  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const onCropComplete = useCallback(async () => {
    if (!imageSrc || !crop) return
    // Criar canvas com a area recortada e converter para blob
    const image = new Image()
    image.src = imageSrc
    const canvas = document.createElement("canvas")
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext("2d")
    ctx?.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
    canvas.toBlob((blob) => blob && onCropped(blob))
  }, [imageSrc, crop, onCropped])

  return (
    <div className="space-y-4">
      <input type="file" accept="image/*" onChange={onSelectFile} />
      {imageSrc && (
        <>
          <ReactCrop crop={crop} onChange={setCrop} aspect={aspectRatio}>
            <img src={imageSrc} alt="Imagem para recorte" />
          </ReactCrop>
          <Button onClick={onCropComplete}>Confirmar Recorte</Button>
        </>
      )}
    </div>
  )
}
```

### Galeria / Lightbox

> RF07 (zoom) sera implementado via CSS `transform: scale()` com controles de + e - no lightbox.

```tsx
// src/components/shared/Lightbox.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LightboxProps {
  images: { src: string; alt?: string }[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Lightbox({ images, initialIndex = 0, open, onOpenChange }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowLeft") setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
      if (e.key === "ArrowRight") setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, images.length, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <img src={images[index]?.src} alt={images[index]?.alt ?? ""} className="w-full h-auto" />
        <div className="flex justify-between p-4">
          <Button variant="outline" onClick={() => setIndex((i) => (i > 0 ? i - 1 : images.length - 1))}>
            Anterior
          </Button>
          <span>{index + 1} / {images.length}</span>
          <Button variant="outline" onClick={() => setIndex((i) => (i < images.length - 1 ? i + 1 : 0))}>
            Próximo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Avatar

```tsx
// src/components/shared/Avatar.tsx
import { Avatar as RadixAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Status = "online" | "offline" | "busy" | "away";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string; // iniciais, ex: "RM"
  status?: Status;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusColors: Record<Status, string> = {
  online: "bg-green-500",
  offline: "bg-muted-foreground",
  busy: "bg-red-500",
  away: "bg-yellow-500",
};

export function Avatar({ src, alt, fallback, status, size = "md", className }: AvatarProps) {
  const sizeClasses = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };

  return (
    <div className="relative inline-block">
      <RadixAvatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={src ?? undefined} alt={alt} />
        <AvatarFallback>{fallback ?? "?"}</AvatarFallback>
      </RadixAvatar>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background",
            statusColors[status]
          )}
          aria-hidden
        />
      )}
    </div>
  );
}

// Uso: <Avatar src={user.avatarUrl} fallback={getInitials(user.name)} status="online" />
```

### Responsive Image (Next/Image)

```tsx
// src/components/shared/ResponsiveImage.tsx
import Image from "next/image";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  blurDataURL,
  fill,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: ResponsiveImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      fill={fill}
      sizes={sizes}
      priority={priority}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
      loading={priority ? undefined : "lazy"}
    />
  );
}
```

### Video Player

```tsx
// src/components/shared/VideoPlayer.tsx
"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Maximize } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
    setPlaying(!v.paused);
  };

  const requestFullscreen = () => videoRef.current?.requestFullscreen?.();

  return (
    <div className={cn("relative rounded-lg overflow-hidden bg-black", className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onKeyDown={(e) => e.key === " " && (e.preventDefault(), togglePlay())}
        tabIndex={0}
      />
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <Button size="icon" variant="ghost" onClick={togglePlay}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={requestFullscreen}>
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

### Download com Progresso

```tsx
// src/lib/media/downloadWithProgress.ts
export async function downloadWithProgress(
  url: string,
  filename: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const res = await fetch(url);
  if (!res.body) throw new Error("No body");
  const total = Number(res.headers.get("content-length")) || 0;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total > 0) onProgress?.(Math.round((received / total) * 100));
  }

  const blob = new Blob(chunks);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
```

## Estrutura de Arquivos

```
src/
├── components/
│   └── shared/
│       ├── FileUpload.tsx
│       ├── ImageCropUpload.tsx
│       ├── Lightbox.tsx
│       ├── Avatar.tsx
│       ├── ResponsiveImage.tsx
│       └── VideoPlayer.tsx
├── lib/
│   └── media/
│       ├── downloadWithProgress.ts
│       └── validateFile.ts
└── hooks/
    └── useObjectUrl.ts         # createObjectURL com revoke no cleanup
```

## Dependencias

### Bibliotecas Externas

- `react-dropzone` - zona de upload com DnD
- `react-image-crop` ou `react-easy-crop` - crop de imagens
- `next` - Image com blur, lazy loading
- (VideoPlayer pode ser nativo ou `video.js` para recursos avancados)

### Specs Relacionados

- [Feedback & Orientacao](../f-padroes-ux/feedback-orientacao.md) - progress bar, toasts de erro
- [Interacoes Avancadas](../f-padroes-ux/interacoes-avancadas.md) - FileDropZone
- [Seguranca & Configuracao](../e-infraestrutura/seguranca-configuracao.md) - validacao de arquivos no servidor
- [Design System](../a-fundacao-visual/design-system.md) - tokens para Avatar

## Notas de Implementacao

- `FileUpload` e o componente canonico para upload de arquivos neste projeto. A spec de [Interacoes Avancadas](../f-padroes-ux/interacoes-avancadas.md) cobre drag & drop para reordenacao; upload via drag e responsabilidade deste componente.
- `Avatar` com fallback de iniciais e baseado no componente `Avatar` do shadcn/ui, customizado com logica de iniciais.
- O hook `useObjectUrl` (listado na estrutura de arquivos) encapsula `URL.createObjectURL` / `revokeObjectURL` com cleanup automatico via `useEffect`.

## Regras de Uso — Componentes Implementados

### ImageCropUpload

```tsx
import { ImageCropUpload } from "@/components/shared";

<ImageCropUpload
  onCropped={(blob) => handleUpload(blob)}
  aspectRatio={16 / 9}          // default: 1 (quadrado)
  label="Select image"          // texto do botao
  confirmLabel="Confirm crop"   // botao de confirmacao
  cancelLabel="Cancel"          // botao de cancelar
/>
```

**Comportamento:** Abre dialog modal com area de crop interativa (react-image-crop). O blob resultante e gerado via Canvas API com qualidade JPEG 90%. O aspect ratio e configuravel.

### Lightbox

```tsx
import { Lightbox } from "@/components/shared";

const [open, setOpen] = useState(false);

<Lightbox
  images={[
    { src: "/photo1.jpg", alt: "Description 1" },
    { src: "/photo2.jpg", alt: "Description 2" },
  ]}
  open={open}
  onOpenChange={setOpen}
  initialIndex={0}   // default: 0
/>
```

**Comportamento:** Dialog fullscreen com navegacao por setas (teclado ArrowLeft/ArrowRight), zoom (+/-) de 100% a 300%, indicador de posicao. Escape fecha. Loop entre imagens.

### VideoPlayer

```tsx
import { VideoPlayer } from "@/components/shared";

<VideoPlayer
  src="/video.mp4"
  poster="/poster.jpg"   // opcional
  className="aspect-video max-w-lg"
/>
```

**Comportamento:** Player nativo com overlay de controles (play/pause, mute, fullscreen, seek bar). Controles auto-hide apos 3s de inatividade. Tecla Espaco para play/pause. Overlay central de play quando pausado.

### Pagina de Exemplo

Todos os tres componentes sao demonstrados na galeria de componentes em `/examples/components` (secao "Advanced").

## Criterios de Aceite

- [ ] RF01: Zona de upload com drag & drop e feedback visual
- [ ] RF02: Barra de progresso durante upload
- [ ] RF03: Preview de imagens e PDFs
- [ ] RF04: Upload multiplo com lista de arquivos
- [ ] RF05: Validacao de tipo e tamanho com mensagens
- [x] RF06: ImageCropUpload funcional
- [x] RF07: Lightbox com zoom, navegacao e teclado
- [ ] RF08: Avatar com imagem, iniciais e status
- [ ] RF09: ResponsiveImage com Next/Image, blur e lazy
- [x] RF10: VideoPlayer basico (play, pause, fullscreen)
- [ ] RF11: downloadWithProgress com callback onProgress
- [ ] Testes unitarios para validacao e downloadWithProgress
- [ ] Storybook com exemplos de todos os componentes

## Referencias

- [react-dropzone](https://react-dropzone.js.org/)
- [react-image-crop](https://github.com/DominicTobias/react-image-crop)
- [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image)
- [Fetch with ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
- [Radix Avatar](https://www.radix-ui.com/primitives/docs/components/avatar)
