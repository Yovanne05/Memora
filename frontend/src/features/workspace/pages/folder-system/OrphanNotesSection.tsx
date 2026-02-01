import { FileText } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { NotesGrid } from '@/features/notes/components/NotesGrid'
import { NotesPagination } from '@/features/notes/components/NotesPagination'
import type { Note } from '@/features/notes/models/note.model'

interface OrphanNotesSectionProps {
  notes: Note[] | null
  total: number
  limit: number
  page: number
  maxPage: number
  onPageChange: (page: number) => void
}

export function OrphanNotesSection({
  notes,
  total,
  limit,
  page,
  maxPage,
  onPageChange,
}: Readonly<OrphanNotesSectionProps>) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'orphan-notes-zone',
    data: { collectionId: null, collectionName: 'Notes orphelines' },
  })

  const hasNotes = notes && notes.length > 0

  return (
    <section className="space-y-4">
      <div
        ref={setNodeRef}
        className={cn(
          'rounded-lg transition-all',
          isOver && 'ring-2 ring-primary ring-offset-2 bg-accent/50'
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Notes orphelines</h2>
          <span className="text-sm text-muted-foreground">({total})</span>
        </div>

        {!hasNotes ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed">
            <p className="text-sm text-muted-foreground">
              Aucune note orpheline
            </p>
            <p className="text-xs text-muted-foreground">
              Créez une note ou glissez-en une depuis une collection
            </p>
          </div>
        ) : (
          <>
            <NotesGrid items={notes} showQuickActions showFavoriteButton />

            {total > limit && (
              <div className="mt-6">
                <NotesPagination
                  page={page}
                  maxPage={maxPage}
                  setPage={onPageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
