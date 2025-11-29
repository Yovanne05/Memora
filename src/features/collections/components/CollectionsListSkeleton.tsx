import { SkeletonCard } from "@/components/ui/skeleton-card"

const SKELETON_COUNT = 6

export function CollectionsListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
        <SkeletonCard key={idx} lines={2} />
      ))}
    </div>
  )
}
