"use client";

import { useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

interface ImageCropUploadProps {
  onCropped: (blob: Blob) => void;
  aspectRatio?: number;
  className?: string;
  label?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

function getCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Failed to get canvas context"));

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/jpeg",
      0.9
    );
  });
}

export function ImageCropUpload({
  onCropped,
  aspectRatio = 1,
  className,
  label = "Select image",
  confirmLabel = "Confirm crop",
  cancelLabel = "Cancel",
}: ImageCropUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop(undefined);
      setDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    if (!imageRef.current || !crop) return;

    const pixelCrop: PixelCrop = {
      unit: "px",
      x: crop.unit === "%" ? (crop.x / 100) * imageRef.current.width : crop.x,
      y: crop.unit === "%" ? (crop.y / 100) * imageRef.current.height : crop.y,
      width:
        crop.unit === "%"
          ? (crop.width / 100) * imageRef.current.width
          : crop.width,
      height:
        crop.unit === "%"
          ? (crop.height / 100) * imageRef.current.height
          : crop.height,
    };

    try {
      const blob = await getCroppedBlob(imageRef.current, pixelCrop);
      onCropped(blob);
      setDialogOpen(false);
      setImageSrc(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      // Crop failed silently
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setImageSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-crop-input"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop image</DialogTitle>
            <DialogDescription>
              Adjust the selection area to crop your image.
            </DialogDescription>
          </DialogHeader>

          {imageSrc && (
            <div className="flex items-center justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={aspectRatio}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Data URL from FileReader, not compatible with next/image */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Image to crop"
                  className="max-h-[60vh] max-w-full"
                />
              </ReactCrop>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <Button onClick={() => void handleConfirm()} disabled={!crop}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
