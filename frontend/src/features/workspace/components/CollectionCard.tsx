import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Folder } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

import type { Collection } from '@/features/collections/models/collection.model'
import { ResourceCard } from '@/components/shared/ResourceCard'
import type { DroppableCollectionData } from '@/features/notes/hooks/useDragAndDropNotes'

interface CollectionCardProps {
  collection: Collection
  mode?: 'default' | 'favorites'
  showDropIndicator?: boolean
}

export const CollectionCard = memo(function CollectionCard({
  collection,
  mode = 'default',
  showDropIndicator = true,
}: Readonly<CollectionCardProps>) {
  const navigate = useNavigate()

  const dropData: DroppableCollectionData = {
    collectionId: collection.id,
    collectionName: collection.name,
  }

  const { setNodeRef, isOver } = useDroppable({
    id: 'collection-' + collection.id,
    data: dropData,
  })

  const notesCount = collection.notes?.length || 0

  const handleClick = useCallback(() => {
    const basePath =
      mode === 'favorites'
        ? '/app/workspace/favorites/collections'
        : '/app/workspace/collections'

    navigate({ to: basePath + '/' + collection.id })
  }, [collection.id, mode, navigate])

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-all',
        showDropIndicator &&
          isOver &&
          'ring-2 ring-primary ring-offset-2 scale-105'
      )}
    >
      <ResourceCard
        id={collection.id}
        icon={Folder}
        title={collection.name}
        description={collection.description}
        onClick={handleClick}
        metadata={
          <div className="flex items-center justify-between text-xs text-muted-foreground w-full">
            <span>
              {notesCount} {notesCount === 1 ? 'note' : 'notes'}
            </span>
            {collection.tags && collection.tags.length > 0 && (
              <span className="truncate max-w-[120px]">
                {collection.tags.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
        }
      />
    </div>
  )
})
