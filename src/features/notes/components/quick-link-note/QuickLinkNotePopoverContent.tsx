import { PopoverContent } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { QuickLinkNoteList } from "./QuickLinkNoteList"
import { QuickLinkNoteSearch } from "./QuickLinkNoteSearch"
import type { Note } from "../../models/note.model"

type QuickLinkNotePopoverContentProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  availableNotes: Note[]
  isLoading: boolean
  isPending: boolean
  onLink: (noteId: string, noteTitle: string) => void
}

export function QuickLinkNotePopoverContent({
  searchQuery,
  onSearchChange,
  availableNotes,
  isLoading,
  isPending,
  onLink,
}: Readonly<QuickLinkNotePopoverContentProps>) {
  return (
    <PopoverContent className="w-80 p-0" align="end">
      <div className="flex flex-col">
        <QuickLinkNoteSearch value={searchQuery} onChange={onSearchChange} />
        <ScrollArea className="max-h-[300px]">
          <QuickLinkNoteList
            availableNotes={availableNotes}
            isLoading={isLoading}
            isPending={isPending}
            searchQuery={searchQuery}
            onLink={onLink}
          />
        </ScrollArea>
      </div>
    </PopoverContent>
  )
}
