"use client";

import { useEffect, useState } from "react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

interface LightboxImage {
  src: string;
  alt?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

export function Lightbox({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open && !prevOpen) {
    setCurrentIndex(initialIndex);
    setZoom(MIN_ZOOM);
  }
  if (open !== prevOpen) {
    setPrevOpen(open);
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoom(MIN_ZOOM);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoom(MIN_ZOOM);
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          setCurrentIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1,
          );
          setZoom(MIN_ZOOM);
          break;
        case "ArrowRight":
          event.preventDefault();
          setCurrentIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1,
          );
          setZoom(MIN_ZOOM);
          break;
        case "+":
        case "=":
          event.preventDefault();
          setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
          break;
        case "-":
          event.preventDefault();
          setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, images.length]);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-4 bg-black/95 p-4 sm:max-w-[90vw]"
        showCloseButton
      >
        <DialogTitle className="sr-only">
          {currentImage?.alt ?? `Image ${currentIndex + 1}`}
        </DialogTitle>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className="text-white hover:bg-white/20"
          >
            <ZoomOutIcon />
          </Button>
          <span className="text-muted-foreground min-w-[3ch] text-center text-xs">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="text-white hover:bg-white/20"
          >
            <ZoomInIcon />
          </Button>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              aria-label="Previous image"
              className="absolute left-2 z-10 text-white hover:bg-white/20"
            >
              <ChevronLeftIcon />
            </Button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element -- Lightbox displays arbitrary external URLs not compatible with next/image optimization */}
          <img
            src={currentImage?.src}
            alt={currentImage?.alt ?? ""}
            className={cn(
              "max-h-[70vh] max-w-full object-contain transition-transform duration-200",
            )}
            style={{ transform: `scale(${zoom})` }}
            draggable={false}
          />

          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              aria-label="Next image"
              className="absolute right-2 z-10 text-white hover:bg-white/20"
            >
              <ChevronRightIcon />
            </Button>
          )}
        </div>

        {images.length > 1 && (
          <p className="text-muted-foreground text-sm">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
