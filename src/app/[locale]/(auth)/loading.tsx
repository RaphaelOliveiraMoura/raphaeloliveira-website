import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="w-full space-y-6 rounded-lg border bg-card p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-7 w-32" />
        <Skeleton className="mx-auto h-4 w-48" />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
