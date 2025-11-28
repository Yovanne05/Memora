import { Skeleton } from "@/components/ui/skeleton"

const SKELETON_COUNT = 6

export function CollectionsListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
        <div key={idx} className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  )
}
