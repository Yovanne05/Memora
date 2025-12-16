  import { useId } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"

export interface TagListProps {
  readonly tags: string[]
  readonly maxVisible?: number
  readonly size?: "sm" | "md"
  readonly variant?: "default" | "secondary" | "outline"
  readonly className?: string
}

export function TagList({
  tags,
  maxVisible = 3,
  size = "sm",
  variant = "secondary",
  className,
}: Readonly<TagListProps>) {
  const listId = useId();

  if (!tags || tags.length === 0) return null

  const visibleTags = tags.slice(0, maxVisible)
  const remainingCount = tags.length - maxVisible

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visibleTags.map((tag) => (
        <Badge
          key={`${listId}-tag-${tag}`}
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
