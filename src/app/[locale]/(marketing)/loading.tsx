import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <Skeleton className="mx-auto h-12 w-3/4" />
        <Skeleton className="mx-auto h-5 w-2/3" />
        <div className="flex justify-center gap-4 pt-4">
          <Skeleton className="h-11 w-36" />
          <Skeleton className="h-11 w-36" />
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border p-6">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
