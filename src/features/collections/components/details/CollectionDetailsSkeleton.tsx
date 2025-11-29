import { SkeletonHeader, SkeletonSection } from "@/components/ui/skeleton-card"

export function CollectionDetailsSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <SkeletonHeader />
      <SkeletonSection titleHeight="h-6" contentLines={4} />
      <SkeletonSection titleHeight="h-6" contentLines={3} />
    </div>
  )
}
