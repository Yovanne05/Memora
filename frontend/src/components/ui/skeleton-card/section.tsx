import { useId } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export interface SkeletonSectionProps {
  titleHeight?: string
  contentLines?: number
  className?: string
}

export function SkeletonSection({
  titleHeight = "h-6",
  contentLines = 3,
  className = "",
}: Readonly<SkeletonSectionProps>) {
  const sectionId = useId()

  return (
    <div className={`space-y-4 ${className}`}>
      <Skeleton className={`w-48 ${titleHeight}`} />
      <div className="space-y-3 pl-4">
        {Array.from({ length: contentLines }).map((_, index) => (
          <Skeleton
            key={`${sectionId}-line-${index}`}
            className={`h-4 ${index === contentLines - 1 ? "w-5/6" : "w-full"}`}
          />
        ))}
      </div>
    </div>
  )
}
