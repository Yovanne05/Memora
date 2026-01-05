import { memo, useCallback } from "react"
import type { Collection } from "../../models/collection.model"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TagList } from "@/components/ui/tag-list"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, MoreHorizontal, Files, Star } from "lucide-react"
import { useRouter } from "@tanstack/react-router"
import {
  VISIBILITY_LABELS,
  VISIBILITY_BADGE_CLASSES,
  formatShortDate,
} from "@/lib/format.utils"
import { useToggleCollectionFavoriteMutation } from "../../hooks/useToggleCollectionFavorite"

interface CollectionCardProps {
  readonly collection: Collection
  readonly onEdit?: (c: Collection) => void
  readonly onDelete?: (c: Collection) => void
  readonly onCardClick?: (c: Collection) => void
  readonly isSelected?: boolean
  readonly onToggleSelection?: (id: string) => void
  readonly selectionMode?: boolean
  readonly compact?: boolean
  readonly readOnly?: boolean
}

export const CollectionCard = memo(function CollectionCard({
  collection,
  onEdit,
  onDelete,
  onCardClick,
  isSelected = false,
  onToggleSelection,
  selectionMode = false,
  compact = false,
  readOnly = false,
}: Readonly<CollectionCardProps>) {
  const router = useRouter()
  const toggleFavorite = useToggleCollectionFavoriteMutation()

  const favorite = collection.isFavorite === true

  const handleNavigate = useCallback(() => {
    router.navigate({
      to: "/app/workspace/collections/$collectionId",
      params: { collectionId: collection.id },
    })
  }, [router, collection.id])

  const handleCardClick = useCallback(() => {
    if (onCardClick) {
      onCardClick(collection)
      return
    }

    if (selectionMode && onToggleSelection) {
      onToggleSelection(collection.id)
      return
    }

    handleNavigate()
  }, [onCardClick, selectionMode, onToggleSelection, collection, handleNavigate])

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onEdit?.(collection)
    },
    [onEdit, collection]
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete?.(collection)
    },
    [onDelete, collection]
  )

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      toggleFavorite.mutate({ collectionId: collection.id, next: !favorite })
    },
    [toggleFavorite, collection.id, favorite]
  )

  return (
    <Card
      className={`group flex h-full cursor-pointer flex-col justify-between border text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
      onClick={handleCardClick}
    >
      <CardHeader
        className={`flex flex-row items-start justify-between gap-3 ${
          compact ? "pb-1" : "pb-2"
        }`}
      >
        <div className="flex items-start gap-3 flex-1">
          {selectionMode && (
            <div className="pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelection?.(collection.id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={
                  isSelected
                    ? "Désélectionner la collection"
                    : "Sélectionner la collection"
                }
              />
            </div>
          )}

          <div
            className={`flex items-center justify-center rounded-lg border border-border bg-muted shrink-0 ${
              compact ? "h-8 w-8" : "h-10 w-10"
            }`}
          >
            <FileText
              className={`text-muted-foreground ${
                compact ? "h-4 w-4" : "h-5 w-5"
              }`}
              aria-hidden="true"
            />
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className={compact ? "text-sm" : "text-base"}>
              {collection.name}
            </CardTitle>
            {collection.description && (
              <p
                className={`line-clamp-2 text-muted-foreground ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                {collection.description}
              </p>
            )}
          </div>
        </div>

        {!selectionMode && !readOnly && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              onClick={handleFavoriteClick}
              aria-pressed={favorite}
              aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              disabled={toggleFavorite.isPending}
            >
              <Star
                className={`h-4 w-4 transition ${
                  favorite ? "fill-current text-primary" : "text-muted-foreground"
                }`}
                aria-hidden="true"
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={stopPropagation}
                  aria-label="Options de la collection"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" onClick={stopPropagation}>
                <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
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
          </div>
        )}
      </CardHeader>

      <CardContent className={`space-y-3 ${compact ? "pt-0 pb-2" : "pt-0"}`}>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className={VISIBILITY_BADGE_CLASSES[collection.visibility]}>
            {VISIBILITY_LABELS[collection.visibility]}
          </Badge>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Files className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{collection.notes.length}</span>
          </div>
        </div>

        {collection.tags && collection.tags.length > 0 && (
          <TagList tags={collection.tags} maxVisible={compact ? 2 : 3} size="sm" />
        )}

        {!compact && (
          <div className="text-xs text-muted-foreground">
            Créée le {formatShortDate(collection.createdAt)}
          </div>
        )}
      </CardContent>
    </Card>
  )
})