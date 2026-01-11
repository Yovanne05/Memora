import { ChevronRight, Files, FolderClosed, Flag } from 'lucide-react'
import { FavoriteButton } from '@/components/favorite-button'
import { Button } from '@/components/ui/button'
import type { Collection } from '@/features/collections/models/collection.model'
import { cn } from '@/lib/utils'

type CollectionTreeHeaderProps = {
  collection: Collection
  isExpanded: boolean
  isActive: boolean
  notesCount: number
  favorite: boolean
  onToggle: () => void
  onSelect: () => void
  onToggleFavorite: (event: React.MouseEvent) => void
  onOpenReport: (event: React.MouseEvent) => void
  isFavoritePending: boolean
}

export function CollectionTreeHeader({
  collection,
  isExpanded,
  isActive,
  notesCount,
  favorite,
  onToggle,
  onSelect,
  onToggleFavorite,
  onOpenReport,
  isFavoritePending,
}: Readonly<CollectionTreeHeaderProps>) {
  return (
    <div className="flex items-center gap-1 group">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm hover:bg-accent"
        aria-label={isExpanded ? 'Replier' : 'Déplier'}
        aria-expanded={isExpanded}
      >
        <ChevronRight
          className={cn(
            'h-4 w-4 transition-transform',
            isExpanded && 'rotate-90'
          )}
        />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'flex flex-1 min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-accent text-accent-foreground font-medium'
        )}
      >
        <FolderClosed className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 min-w-0 truncate text-left">
          {collection.name}
        </span>

        {notesCount > 0 && (
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Files className="h-3 w-3" />
            {notesCount}
          </span>
        )}
      </button>

      <FavoriteButton
        pressed={favorite}
        label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        disabled={isFavoritePending}
        onClick={onToggleFavorite}
        size="sm"
        className={cn(
          'h-7 w-7 shrink-0',
          !favorite && 'opacity-0 group-hover:opacity-100',
          'text-muted-foreground hover:text-foreground'
        )}
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenReport}
        className={cn(
          'h-7 w-7 shrink-0',
          'opacity-0 group-hover:opacity-100',
          'text-muted-foreground hover:text-foreground'
        )}
        aria-label="Signaler"
      >
        <Flag className="h-4 w-4" />
      </Button>
    </div>
  )
}
