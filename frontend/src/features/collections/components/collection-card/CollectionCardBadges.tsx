import { Files } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { Collection } from "../../models/collection.model"
import { VISIBILITY_BADGE_CLASSES, VISIBILITY_LABELS } from "@/lib/format.utils"

type CollectionCardBadgesProps = {
  collection: Collection
}

export function CollectionCardBadges({
  collection,
}: Readonly<CollectionCardBadgesProps>) {
  return (
    <>
      <Badge
        variant="outline"
        className={VISIBILITY_BADGE_CLASSES[collection.visibility]}
      >
        {VISIBILITY_LABELS[collection.visibility]}
      </Badge>
      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
        <Files className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{collection.notes.length}</span>
      </div>
    </>
  )
}
