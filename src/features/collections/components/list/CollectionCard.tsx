import { memo, useCallback } from "react"
import type { Collection } from "../../models/collection.model"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { FileText, MoreHorizontal } from "lucide-react"
import { useRouter } from "@tanstack/react-router"
import { formatCollectionDate, getVisibilityLabel, getVisibilityBadgeClasses } from "../../lib/collection-format.utils"

interface CollectionCardProps {
  collection: Collection
  onEdit?: (c: Collection) => void
  onDelete?: (c: Collection) => void
  onCardClick?: (c: Collection) => void
}

export const CollectionCard = memo(function CollectionCard({
  collection,
  onEdit,
  onDelete,
  onCardClick,
}: CollectionCardProps) {
  const router = useRouter()

  const handleNavigate = useCallback(() => {
    router.navigate({
      to: "/app/collections/$id",
      params: { id: collection.id },
    })
  }, [router, collection.id])

  const handleCardClick = useCallback(() => {
    if (onCardClick) {
      onCardClick(collection)
    } else {
      handleNavigate()
    }
  }, [onCardClick, collection, handleNavigate])

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(collection)
  }, [onEdit, collection])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(collection)
  }, [onDelete, collection])

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  return (
    <Card
      className="group flex h-full cursor-pointer flex-col justify-between border border-border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-base">{collection.name}</CardTitle>
            {collection.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={stopPropagation}
              aria-label="Options de la collection"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" onClick={stopPropagation}>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleEdit}
            >
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleDelete}
            >
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={getVisibilityBadgeClasses(collection.visibility)}
          >
            {getVisibilityLabel(collection.visibility)}
          </Badge>

          <span className="text-xs text-muted-foreground">
            Créée le {formatCollectionDate(collection.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
})
