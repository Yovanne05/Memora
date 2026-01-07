import { useId } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export interface LoadingStateProps {
  count?: number
  lines?: number
  layout?: "grid" | "list"
  className?: string
}

export function LoadingState({
  count = 6,
  lines = 3,
  layout = "grid",
  className = "",
}: Readonly<LoadingStateProps>) {
  const skeletonId = useId()

  const gridClasses =
    layout === "grid"
      ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      : "space-y-4"

  return (
    <div className={`${gridClasses} ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`${skeletonId}-${idx}`}
          className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          {Array.from({ length: lines }).map((_, lineIdx) => (
            <Skeleton
              key={lineIdx}
              className={`h-4 ${
                lineIdx === 0 ? "w-3/4" : lineIdx === lines - 1 ? "w-5/6" : "w-full"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
