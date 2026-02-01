import { Plus, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuickAddNote } from '@/features/notes/components/QuickAddNote'

interface ActionBarProps {
  onCreateNote?: () => void
  onCreateCollection?: () => void
  collectionId?: string
  variant?: 'workspace' | 'collection'
  canAddNote?: boolean
  canAddCollection?: boolean
}

export function ActionBar({
  onCreateNote,
  onCreateCollection,
  collectionId,
  variant = 'workspace',
  canAddNote = true,
  canAddCollection = true,
}: Readonly<ActionBarProps>) {
  if (variant === 'collection' && collectionId) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <QuickAddNote
          collectionId={collectionId}
          triggerVariant="default"
          triggerSize="sm"
          showLabel
          disabled={!canAddNote}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {onCreateNote && (
        <Button
          onClick={onCreateNote}
          variant="default"
          size="default"
          className="gap-2"
          disabled={!canAddNote}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nouvelle note</span>
          <span className="sm:hidden">Note</span>
        </Button>
      )}
      {onCreateCollection && (
        <Button
          onClick={onCreateCollection}
          variant="outline"
          size="default"
          className="gap-2"
          disabled={!canAddCollection}
        >
          <FolderPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Nouvelle collection</span>
          <span className="sm:hidden">Collection</span>
        </Button>
      )}
    </div>
  )
}
