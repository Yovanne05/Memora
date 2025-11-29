import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export interface SkeletonCardProps {
  /**
   * Number of lines to display in the skeleton
   * @default 3
   */
  lines?: number
  /**
   * Show image placeholder at the top
   * @default true
   */
  showImage?: boolean
  /**
   * Height of the image placeholder
   * @default "h-48"
   */
  imageHeight?: string
}

export function SkeletonCard({
  lines = 3,
  showImage = true,
  imageHeight = "h-48",
}: SkeletonCardProps) {
  return (
    <Card>
      {showImage && <Skeleton className={`w-full rounded-none ${imageHeight}`} />}
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Title */}
          <Skeleton className="h-5 w-3/4" />

          {/* Description/subtitle */}
          {lines > 1 && <Skeleton className="h-4 w-1/2" />}

          {/* Content lines */}
          {lines > 2 &&
            Array.from({ length: lines - 2 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-4 ${i === lines - 3 ? "w-5/6" : "w-full"}`}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  )
}

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
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-5/6" : "w-full"}`}
        />
      ))}
    </div>
  )
}

export interface SkeletonSectionProps {
  /**
   * Title height class
   * @default "h-6"
   */
  titleHeight?: string
  /**
   * Number of content lines
   * @default 3
   */
  contentLines?: number
  /**
   * Additional className for the container
   */
  className?: string
}

export function SkeletonSection({
  titleHeight = "h-6",
  contentLines = 3,
  className = "",
}: SkeletonSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <Skeleton className={`w-48 ${titleHeight}`} />
      <div className="space-y-3 pl-4">
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-4 ${i === contentLines - 1 ? "w-5/6" : "w-full"}`}
          />
        ))}
      </div>
    </div>
  )
}
