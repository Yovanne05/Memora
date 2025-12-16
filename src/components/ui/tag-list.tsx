import { cn } from "@/lib/utils"
import { Badge } from "./badge"

export interface TagListProps {
  tags: string[]
  maxVisible?: number
  size?: "sm" | "md"
  variant?: "default" | "secondary" | "outline"
  className?: string
}

export function TagList({
  tags,
  maxVisible = 3,
  size = "sm",
  variant = "secondary",
  className,
}: TagListProps) {
  if (!tags || tags.length === 0) return null

  const visibleTags = tags.slice(0, maxVisible)
  const remainingCount = tags.length - maxVisible

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visibleTags.map((tag, index) => (
        <Badge
          key={index}
          variant={variant}
          className={cn(
            size === "sm" && "px-2 py-0 text-xs",
            size === "md" && "px-2.5 py-0.5 text-sm"
          )}
        >
          {tag}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge
          variant="outline"
          className={cn(
            "text-muted-foreground",
            size === "sm" && "px-2 py-0 text-xs",
            size === "md" && "px-2.5 py-0.5 text-sm"
          )}
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  )
}
