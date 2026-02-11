"use client";

import { useCallback, useState } from "react";
import {
  useDropzone,
  type Accept,
  type FileRejection,
} from "react-dropzone";

import { cn } from "@/lib/utils";
import { useObjectUrl } from "@/hooks/use-object-url";
import { useTranslations } from "@/lib/i18n";

interface FileUploadProps {
  onUpload: (files: File[]) => void | Promise<void>;
  accept?: Accept;
  maxSize?: number;
  maxFiles?: number;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    "application/pdf": [".pdf"],
  },
  maxSize = 5 * 1024 * 1024,
  maxFiles = 5,
  className,
}: FileUploadProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const t = useTranslations("common");

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setErrorMessage(null);
      if (rejectedFiles.length > 0) {
        const messages = rejectedFiles.flatMap((r) =>
          r.errors.map((e) => e.message)
        );
        setErrorMessage(messages.join("; "));
      }
      if (acceptedFiles.length > 0) {
        setFiles(acceptedFiles);
        void Promise.resolve(onUpload(acceptedFiles));
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
      >
        <input {...getInputProps()} aria-label={t("fileUpload.selectFiles")} />
        <p className="text-muted-foreground text-sm">
          {isDragActive
            ? t("fileUpload.dropHere")
            : t("fileUpload.dragOrClick")}
        </p>
      </div>
      {errorMessage && (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      )}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {files.map((file) => (
            <FilePreview key={file.name} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilePreview({ file }: { file: File }) {
  const url = useObjectUrl(file);
  const t = useTranslations("common");
  const isImage = file.type.startsWith("image/");

  return (
    <div className="flex flex-col items-center gap-1">
      {isImage && url ? (
        // eslint-disable-next-line @next/next/no-img-element -- Blob URLs from createObjectURL are not compatible with next/image
        <img
          src={url}
          alt={file.name}
          className="h-20 w-20 rounded object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded border bg-muted">
          <span className="text-muted-foreground text-xs">{t("fileUpload.fileType")}</span>
        </div>
      )}
      <span className="text-muted-foreground max-w-[80px] truncate text-xs">
        {file.name}
      </span>
    </div>
  );
}
