import { useCallback } from "react"
import { CollectionCard } from "./CollectionCard"
import { CollectionsListSkeleton } from "./CollectionsListSkeleton"
import type { Collection } from "../../models/collection.model"

interface CollectionsContentProps {
  loading: boolean
  error: string | null
  collections: Collection[]
  onRetry: () => void
  onEdit: (collection: Collection) => void
  onDelete: (collection: Collection) => void
  isSelected?: (id: string) => boolean
  onToggleSelection?: (id: string) => void
  selectionMode?: boolean
}

export function CollectionsContent({
  loading,
  error,
  collections,
  onRetry,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelection,
  selectionMode = false,
}: Readonly<CollectionsContentProps>) {
  const handleSelectionCardClick = useCallback(
    (collection: Collection) => {
      onToggleSelection?.(collection.id)
    },
    [onToggleSelection]
  )

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}{" "}
        <button
          type="button"
          onClick={onRetry}
          className="font-medium underline underline-offset-2"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (loading) {
    return <CollectionsListSkeleton />
  }

  if (!collections.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border bg-card text-muted-foreground">
        Aucune collection trouvée. Essayez de modifier vos filtres.
      </div>
    )
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          onEdit={onEdit}
          onDelete={onDelete}
          isSelected={isSelected?.(collection.id)}
          onToggleSelection={onToggleSelection}
          selectionMode={selectionMode}
          onCardClick={selectionMode ? handleSelectionCardClick : undefined}
        />
      ))}
    </section>
  )
}
