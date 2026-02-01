import { Link } from "@tanstack/react-router"
import { FileText, FolderClosed, Eye, Lock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TagList } from "@/components/ui/tag-list"
import type { Collection } from "@/features/collections/models/collection.model"
import {
  VISIBILITY_BADGE_CLASSES,
  VISIBILITY_LABELS,
  formatShortDate,
} from "@/lib/format.utils"

type CollectionResultCardProps = {
  collection: Collection
}

export function CollectionResultCard({
  collection,
}: Readonly<CollectionResultCardProps>) {
  return (
    <Link
      to="/app/workspace/collections/$collectionId"
      params={{ collectionId: collection.id }}
      className="block h-full"
      aria-label={`Ouvrir la collection ${collection.name}`}
    >
      <Card className="group flex h-full cursor-pointer flex-col justify-between border border-border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted shrink-0">
              <FolderClosed className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-base">{collection.name}</CardTitle>
              {collection.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {collection.description}
                </p>
              )}
            </div>
          </div>

          <Badge
            variant="secondary"
            className={VISIBILITY_BADGE_CLASSES[collection.visibility]}
          >
            {collection.visibility === "public" ? (
              <Eye className="h-3 w-3" />
            ) : (
              <Lock className="h-3 w-3" />
            )}
            {VISIBILITY_LABELS[collection.visibility]}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-2 pt-0 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span>
              {collection.notes.length} note
              {collection.notes.length > 1 ? "s" : ""}
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span>{formatShortDate(collection.createdAt)}</span>
          </div>

          {collection.tags && collection.tags.length > 0 && (
            <TagList tags={collection.tags} maxVisible={3} size="sm" />
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
