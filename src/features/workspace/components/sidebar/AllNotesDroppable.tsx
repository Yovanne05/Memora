import { useDroppable } from '@dnd-kit/core'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DroppableCollectionData } from '@/features/notes/hooks/useDragAndDropNotes'

interface AllNotesDroppableProps {
  isActive: boolean
  onClick: () => void
}

export function AllNotesDroppable({
  isActive,
  onClick,
}: AllNotesDroppableProps) {
  const dropData: DroppableCollectionData = {
    collectionId: null,
    collectionName: null,
  }

  const { setNodeRef, isOver } = useDroppable({
    id: 'all-notes-drop-zone',
    data: dropData,
  })

  return (
    <div ref={setNodeRef}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-accent text-accent-foreground',
          isOver && 'bg-accent/50 ring-2 ring-primary/50'
        )}
      >
        <FileText className="h-4 w-4" />
        Toutes les notes
      </button>
    </div>
  )
}
