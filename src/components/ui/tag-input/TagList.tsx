import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type TagListProps = {
  tags: string[]
  disabled: boolean
  onRemove: (index: number) => void
  id: string
}

export function TagList({ tags, disabled, onRemove, id }: Readonly<TagListProps>) {
  return tags.map((tag, index) => (
    <Badge
      key={`${id}-tag-${tag}-${index}`}
      variant="secondary"
      className="gap-1 pr-1 text-xs"
    >
      {tag}
      {!disabled && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="ml-1 rounded-sm hover:bg-secondary-foreground/20 focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label={`Supprimer le tag ${tag}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  ))
}
