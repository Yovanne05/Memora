import { useId } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export interface SkeletonCardProps {
  lines?: number
  showImage?: boolean
  imageHeight?: string
}

export function SkeletonCard({
  lines = 3,
  showImage = true,
  imageHeight = "h-48",
}: Readonly<SkeletonCardProps>) {
  const cardId = useId()

  return (
    <Card>
      {showImage && <Skeleton className={`w-full rounded-none ${imageHeight}`} />}
      <CardContent className="pt-4">
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          {lines > 1 && <Skeleton className="h-4 w-1/2" />}
          {lines > 2 &&
            Array.from({ length: lines - 2 }).map((_, index) => (
              <Skeleton
                key={`${cardId}-line-${index}`}
                className={`h-4 ${index === lines - 3 ? "w-5/6" : "w-full"}`}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
