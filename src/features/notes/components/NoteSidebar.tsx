import { Separator } from "@/components/ui/separator"
import { FlashcardsSection } from "@/features/flashcards/components/FlashcardsSection"
import { RichTextDisplay } from "@/components/editor/RichTextDisplay"
import { cn } from "@/lib/utils"
import { useResizable } from "@/hooks/useResizable"
import type { Note } from "../models/note.model"
import { NoteSidebarHeader } from "./note-sidebar/NoteSidebarHeader"
import { NoteSidebarInfo } from "./note-sidebar/NoteSidebarInfo"
import { NoteSidebarOverview } from "./note-sidebar/NoteSidebarOverview"
import { NoteSidebarRelatedNotes } from "./note-sidebar/NoteSidebarRelatedNotes"
import { NoteSidebarResizer } from "./note-sidebar/NoteSidebarResizer"

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
    storageKey: "note-sidebar-width",
  })

  if (!note) return null

  const formattedCreatedAt = new Date(note.createdAt).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const formattedUpdatedAt = new Date(note.updatedAt).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <aside
      ref={resizeRef}
      style={{ width: `${width}px` }}
      className={cn(
        "fixed top-0 right-0 h-full bg-background border-l shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
        open ? "translate-x-0" : "translate-x-full",
        isResizing && "transition-none"
      )}
    >
      <NoteSidebarResizer isResizing={isResizing} onResizeStart={handleMouseDown} />
      <NoteSidebarHeader onClose={onClose} />

      <div className="flex-1 overflow-y-auto">
        <NoteSidebarRelatedNotes notes={relatedNotes} onNoteClick={onNoteClick} />

        <div className="px-6 py-6 space-y-6">
          <NoteSidebarOverview note={note} />

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Contenu</h3>
            <RichTextDisplay content={note.content} />
          </div>

          <Separator />

          <NoteSidebarInfo createdAt={formattedCreatedAt} updatedAt={formattedUpdatedAt} />

          <FlashcardsSection noteId={note.id} />
        </div>
      </div>
    </aside>
  )
}
