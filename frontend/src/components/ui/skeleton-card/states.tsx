import { useId } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonHeader() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    </div>
  )
}

export function SkeletonContent({
  lines = 4,
  className = "",
}: Readonly<{
  lines?: number
  className?: string
}>) {
  const contentId = useId()

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={`${contentId}-line-${index}`}
          className={`h-4 ${index === lines - 1 ? "w-5/6" : "w-full"}`}
        />
      ))}
    </div>
  )
}
