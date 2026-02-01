import { Separator } from '@/components/ui/separator'
import { RichTextDisplay } from '@/components/editor/RichTextDisplay'
import { FlashcardsSection } from '@/features/flashcards/components/FlashcardsSection'
import { cn } from '@/lib/utils'
import { formatLongDateTime } from '@/lib/format.utils'
import { useResizable } from '@/hooks/useResizable'
import type { Note } from '../models/note.model'
import { NoteSidebarHeader } from './note-sidebar/NoteSidebarHeader'
import { NoteSidebarInfo } from './note-sidebar/NoteSidebarInfo'
import { NoteSidebarOverview } from './note-sidebar/NoteSidebarOverview'
import { NoteSidebarRelatedNotes } from './note-sidebar/NoteSidebarRelatedNotes'
import { NoteSidebarResizer } from './note-sidebar/NoteSidebarResizer'

interface NoteSidebarProps {
  readonly note: Note | null
  readonly open: boolean
  readonly onClose: () => void
  readonly relatedNotes?: Note[]
  readonly onNoteClick?: (noteId: string) => void
}

export function NoteSidebar({
  note,
  open,
  onClose,
  relatedNotes = [],
  onNoteClick,
}: Readonly<NoteSidebarProps>) {
  const maxWidth = (globalThis.window?.innerWidth ?? 1200) * 0.8

  const { width, isResizing, handleMouseDown, resizeRef } = useResizable({
    minWidth: 320,
    maxWidth,
    defaultWidth: 480,
    storageKey: 'note-sidebar-width',
  })

  if (!note) return null

  const formattedCreatedAt = formatLongDateTime(note.createdAt)
  const formattedUpdatedAt = formatLongDateTime(note.updatedAt)

  const content = (
    <>
      <NoteSidebarRelatedNotes notes={relatedNotes} onNoteClick={onNoteClick} />

      <div className="px-3 py-4 space-y-4 sm:px-6 sm:py-6 sm:space-y-6">
        <NoteSidebarOverview note={note} />

        <Separator />

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 sm:mb-3">
            Contenu
          </h3>
          <RichTextDisplay content={note.content ?? ''} />
        </div>

        <Separator />

        <NoteSidebarInfo
          createdAt={formattedCreatedAt}
          updatedAt={formattedUpdatedAt}
        />

        <FlashcardsSection noteId={note.id} />
      </div>
    </>
  )

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  // Mobile: popup/drawer style au centre de l'écran
  return (
    <>
      {/* Overlay sur mobile */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={onClose}
          aria-label="Fermer le panneau"
        />
      )}

      {/* Contenu */}
      <aside
        ref={resizeRef}
        style={isMobile ? undefined : { width: `${width}px` }}
        className={cn(
          'fixed z-50 bg-background transition-all duration-300 ease-in-out flex flex-col',
          // Mobile: popup centré avec hauteur fixe
          'bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-2xl border-t shadow-2xl',
          // Desktop: sidebar à droite pleine hauteur
          'sm:top-0 sm:bottom-auto sm:left-auto sm:right-0 sm:w-auto sm:h-full sm:rounded-none sm:border-l sm:border-t-0',
          open
            ? 'translate-y-0 sm:translate-y-0 sm:translate-x-0'
            : 'translate-y-full sm:translate-y-0 sm:translate-x-full',
          isResizing && 'transition-none'
        )}
      >
        <div className="hidden sm:block">
          <NoteSidebarResizer
            isResizing={isResizing}
            onResizeStart={handleMouseDown}
          />
        </div>
        <NoteSidebarHeader onClose={onClose} />

        <div className="flex-1 overflow-y-auto">{content}</div>
      </aside>
    </>
  )
}
