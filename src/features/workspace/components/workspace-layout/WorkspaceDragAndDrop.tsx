import { memo, type ReactNode } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { SensorDescriptor } from '@dnd-kit/core'
import type { Note } from '@/features/notes/models/note.model'
import { NoteCard } from '@/features/notes/components/NoteCard'

interface WorkspaceDragAndDropProps {
  children: ReactNode
  activeNote: Note | null
  sensors: SensorDescriptor<any>[]
  onDragStart: (event: any) => void
  onDragEnd: (event: any) => void
  onDragCancel: () => void
}

export const WorkspaceDragAndDrop = memo(function WorkspaceDragAndDrop({
  children,
  activeNote,
  sensors,
  onDragStart,
  onDragEnd,
  onDragCancel,
}: Readonly<WorkspaceDragAndDropProps>) {
  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}

      <DragOverlay>
        {activeNote ? (
          <div className="rotate-3 opacity-80">
            <NoteCard
              note={activeNote}
              showQuickActions={false}
              showFavoriteButton={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
})
