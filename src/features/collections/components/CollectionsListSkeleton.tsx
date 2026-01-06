import { useId } from "react"
import { SkeletonCard } from "@/components/ui/skeleton-card"

const SKELETON_COUNT = 6

export function CollectionsListSkeleton() {
  const skeletonId = useId();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
        <SkeletonCard key={`${skeletonId}-${idx}`} lines={2} />
      ))}
    </div>
  )
}
