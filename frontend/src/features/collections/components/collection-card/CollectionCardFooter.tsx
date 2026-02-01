import { TagList } from "@/components/ui/tag-list"
import type { Collection } from "../../models/collection.model"
import { formatShortDate } from "@/lib/format.utils"

type CollectionCardFooterProps = {
  collection: Collection
  compact: boolean
}

export function CollectionCardFooter({
  collection,
  compact,
}: Readonly<CollectionCardFooterProps>) {
  return (
    <>
      {collection.tags && collection.tags.length > 0 && (
        <TagList tags={collection.tags} maxVisible={compact ? 2 : 3} size="sm" />
      )}
      {!compact && (
        <div className="text-xs text-muted-foreground">
          Créée le {formatShortDate(collection.createdAt)}
        </div>
      )}
    </>
  )
}
