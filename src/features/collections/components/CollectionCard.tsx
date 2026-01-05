import { memo, useCallback } from "react"
import type { Collection } from "../models/collection.model"
import { ResourceCard, type ResourceCardAction } from "@/components/shared/ResourceCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TagList } from "@/components/ui/tag-list"
import { FileText, Files, Star } from "lucide-react"
import { useRouter } from "@tanstack/react-router"
import {
  VISIBILITY_LABELS,
  VISIBILITY_BADGE_CLASSES,
  formatShortDate,
} from "@/lib/format.utils"
import { useToggleCollectionFavoriteMutation } from "../hooks/useToggleCollectionFavoriteMutation"

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
    handleNavigate()
  }, [onCardClick, collection, handleNavigate])

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      toggleFavorite.mutate({ collectionId: collection.id, next: !favorite })
    },
    [toggleFavorite, collection.id, favorite]
  )

  const actions: ResourceCardAction[] = []
  if (onEdit) {
    actions.push({
      label: "Modifier",
      onClick: (e) => {
        e.stopPropagation()
        onEdit(collection)
      },
    })
  }
  if (onDelete) {
    actions.push({
      label: "Supprimer",
      variant: "destructive",
      onClick: (e) => {
        e.stopPropagation()
        onDelete(collection)
      },
    })
  }

  const headerActions = (
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
  )

  const badges = (
    <>
      <Badge variant="outline" className={VISIBILITY_BADGE_CLASSES[collection.visibility]}>
        {VISIBILITY_LABELS[collection.visibility]}
      </Badge>
      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
        <Files className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{collection.notes.length}</span>
      </div>
    </>
  )

  const footer = (
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

  return (
    <ResourceCard
      id={collection.id}
      title={collection.name}
      description={collection.description}
      icon={FileText}
      onClick={handleCardClick}
      onToggleSelection={onToggleSelection}
      actions={actions}
      headerActions={headerActions}
      isSelected={isSelected}
      selectionMode={selectionMode}
      compact={compact}
      readOnly={readOnly}
      badges={badges}
      footer={footer}
    />
  )
})
