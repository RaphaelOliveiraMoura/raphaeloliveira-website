"use client";

import { useState } from "react";

import { Download, FileIcon, Search, Trash2, Upload } from "lucide-react";

import { Breadcrumbs } from "@/components/navigation";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FileUpload,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useDeleteUpload, useUploadFile, useUploads } from "@/lib/api/hooks";
import { formatRelativeTime } from "@/lib/datetime";
import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";
import { useDebounce } from "@/hooks";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageType(contentType: string): boolean {
  return contentType.startsWith("image/");
}

export default function UploadsPage() {
  const t = useTranslations("common");

  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data, isLoading, error, refetch } = useUploads({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
  });

  const uploadFile = useUploadFile();
  const deleteUpload = useDeleteUpload();

  const uploads = data?.data ?? [];
  const meta = data?.meta;

  async function handleUpload(files: File[]) {
    for (const file of files) {
      try {
        await uploadFile.mutateAsync(file);
        toast.success(`${file.name} uploaded`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteUpload.mutateAsync(deleteId);
      toast.success("File deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete file");
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Uploads</h1>
        <p className="text-muted-foreground">
          Upload, manage and download files
        </p>
      </div>

      {/* Upload area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Files</CardTitle>
          <CardDescription>
            Drag and drop or click to upload files (max 5MB each)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            onUpload={handleUpload}
            maxSize={5 * 1024 * 1024}
            maxFiles={5}
          />
        </CardContent>
      </Card>

      {/* Files list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Files</CardTitle>
              <CardDescription>
                {meta ? `${meta.total} files total` : t("loading")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          {error ? (
            <ErrorState
              title="Error loading files"
              error={error}
              onRetry={() => void refetch()}
            />
          ) : isLoading ? (
            <p className="text-center text-muted-foreground py-8">
              {t("loading")}
            </p>
          ) : uploads.length === 0 ? (
            <EmptyState
              icon={<Upload className="size-8" />}
              title="No files"
              description="Upload some files to get started."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {uploads.map((upload) => (
                <Card key={upload.id} className="overflow-hidden">
                  <div className="flex h-32 items-center justify-center bg-muted">
                    {isImageType(upload.contentType) && upload.url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- URL dinamica do backend (signed URL), nao conhecida em build time
                      <img
                        src={upload.url}
                        alt={upload.originalName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileIcon className="size-12 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="space-y-2 p-3">
                    <p
                      className="truncate text-sm font-medium"
                      title={upload.originalName}
                    >
                      {upload.originalName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {upload.contentType}
                      </Badge>
                      <span>{formatFileSize(upload.size)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(upload.createdAt))}
                    </p>
                    <div className="flex gap-1">
                      {upload.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a
                            href={upload.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-1 size-3" />
                            Download
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteId(upload.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete File"
        description="Are you sure you want to delete this file? This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={deleteUpload.isPending}
        variant="destructive"
      />
    </div>
  );
}
