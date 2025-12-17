import { useId } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function NotesListSkeleton() {
  const skeletonId = useId();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={`${skeletonId}-${idx}`} className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  )
}

