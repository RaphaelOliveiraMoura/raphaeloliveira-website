"use client";

import { useState } from "react";

import {
  ArrowLeft,
  ChevronUp,
  MessageSquare,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";

import { Breadcrumbs } from "@/components/navigation";
import { ConfirmDialog, EmptyState, ErrorState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import {
  useAddFeedbackResponse,
  useCreateFeedback,
  useDeleteFeedback,
  useFeedbackDetail,
  useFeedbackList,
  useFeedbackStats,
  useVoteFeedback,
} from "@/lib/api/hooks";
import { formatRelativeTime } from "@/lib/datetime";
import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";
import { useDebounce } from "@/hooks";

import type { FeedbackStatus, FeedbackType } from "@/types/api";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  open: "default",
  under_review: "secondary",
  planned: "secondary",
  in_progress: "default",
  resolved: "outline",
  closed: "outline",
};

const PRIORITY_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  critical: "destructive",
};

export default function FeedbackPage() {
  const t = useTranslations("common");

  // List state
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Detail state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  // Create state
  const [createOpen, setCreateOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<FeedbackType>("improvement");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Queries
  const {
    data: listData,
    isLoading,
    error,
    refetch,
  } = useFeedbackList({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    type: (typeFilter || undefined) as FeedbackType | undefined,
    status: (statusFilter || undefined) as FeedbackStatus | undefined,
  });

  const { data: stats } = useFeedbackStats();
  const { data: detail } = useFeedbackDetail(selectedId ?? "");

  // Mutations
  const createFeedback = useCreateFeedback();
  const deleteFeedback = useDeleteFeedback();
  const voteFeedback = useVoteFeedback();
  const addResponse = useAddFeedbackResponse();

  const items = listData?.data ?? [];
  const meta = listData?.meta;

  async function handleCreate() {
    try {
      await createFeedback.mutateAsync({
        type: formType,
        title: formTitle,
        description: formDescription,
      });
      toast.success("Feedback submitted");
      setCreateOpen(false);
      setFormTitle("");
      setFormDescription("");
    } catch {
      toast.error("Failed to submit feedback");
    }
  }

  async function handleVote(id: string) {
    try {
      await voteFeedback.mutateAsync(id);
      toast.success("Vote toggled");
    } catch {
      toast.error("Failed to vote");
    }
  }

  async function handleAddResponse() {
    if (!selectedId || !responseText.trim()) return;
    try {
      await addResponse.mutateAsync({
        feedbackId: selectedId,
        message: responseText,
      });
      toast.success("Response added");
      setResponseText("");
    } catch {
      toast.error("Failed to add response");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteFeedback.mutateAsync(deleteId);
      toast.success("Feedback deleted");
      setDeleteId(null);
      if (selectedId === deleteId) setSelectedId(null);
    } catch {
      toast.error("Failed to delete feedback");
    }
  }

  // Detail view
  if (selectedId && detail) {
    return (
      <div className="space-y-6">
        <Breadcrumbs />

        <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
          <ArrowLeft className="mr-2 size-4" />
          Back to list
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle>{detail.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={STATUS_VARIANT[detail.status] ?? "outline"}>
                    {detail.status.replace("_", " ")}
                  </Badge>
                  <Badge
                    variant={PRIORITY_VARIANT[detail.priority] ?? "outline"}
                  >
                    {detail.priority}
                  </Badge>
                  <Badge variant="outline">{detail.type}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote(detail.id)}
                >
                  <ChevronUp className="mr-1 size-4" />
                  {detail.voteCount}
                  {detail.hasVoted && " (voted)"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => setDeleteId(detail.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{detail.description}</p>
            <p className="text-xs text-muted-foreground">
              Created {formatRelativeTime(new Date(detail.createdAt))}
            </p>

            <Separator />

            {/* Responses thread */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                Responses ({detail.responses.length})
              </h3>
              {detail.responses.map((resp) => (
                <div
                  key={resp.id}
                  className={`rounded-md border p-3 ${resp.isInternal ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950" : ""}`}
                >
                  <p className="text-sm">{resp.message}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatRelativeTime(new Date(resp.createdAt))}</span>
                    {resp.isInternal && (
                      <Badge variant="outline" className="text-xs">
                        Internal
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {/* Add response */}
              <div className="flex gap-2">
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write a response..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleAddResponse}
                  disabled={addResponse.isPending || !responseText.trim()}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(null)}
          title="Delete Feedback"
          description="Are you sure you want to delete this feedback?"
          onConfirm={handleDelete}
          isLoading={deleteFeedback.isPending}
          variant="destructive"
        />
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
          <p className="text-muted-foreground">
            Collect and manage user feedback
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Submit Feedback
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold">{stats.byStatus.open ?? 0}</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold">
                {stats.byStatus.resolved ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search feedback..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="feature_request">Feature</SelectItem>
            <SelectItem value="improvement">Improvement</SelectItem>
            <SelectItem value="question">Question</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {error ? (
        <ErrorState
          title="Error loading feedback"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("loading")}
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="size-8" />}
          title="No feedback"
          description="Be the first to submit feedback."
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => setSelectedId(item.id)}
            >
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <Badge
                      variant={STATUS_VARIANT[item.status] ?? "outline"}
                      className="text-xs"
                    >
                      {item.status.replace("_", " ")}
                    </Badge>
                    <Badge
                      variant={PRIORITY_VARIANT[item.priority] ?? "outline"}
                      className="text-xs"
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.type} | {formatRelativeTime(new Date(item.createdAt))}
                    {item.voteCount !== undefined &&
                      ` | ${item.voteCount} votes`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(item.id);
                    }}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(item.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
            <DialogDescription>
              Share your thoughts, report bugs, or request features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formType}
                onValueChange={(v) => setFormType(v as FeedbackType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature_request">
                    Feature Request
                  </SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Brief summary"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Detailed description"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                createFeedback.isPending ||
                !formTitle.trim() ||
                !formDescription.trim()
              }
            >
              {createFeedback.isPending ? t("loading") : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Feedback"
        description="Are you sure you want to delete this feedback?"
        onConfirm={handleDelete}
        isLoading={deleteFeedback.isPending}
        variant="destructive"
      />
    </div>
  );
}
