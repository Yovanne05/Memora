import { memo } from "react"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import type { Note } from "../models/note.model"
import { QuickLinkNotePopoverContent } from "./quick-link-note/QuickLinkNotePopoverContent"
import { QuickLinkNoteTrigger } from "./quick-link-note/QuickLinkNoteTrigger"
import { useQuickLinkNote } from "../hooks/useQuickLinkNote"

interface QuickLinkNoteProps {
  readonly note: Note
  readonly onSuccess?: () => void
  readonly triggerVariant?: "default" | "outline" | "ghost"
  readonly triggerSize?: "default" | "sm" | "lg" | "icon"
  readonly showLabel?: boolean
}

export const QuickLinkNote = memo(function QuickLinkNote({
  note,
  onSuccess,
  triggerVariant = "outline",
  triggerSize = "sm",
  showLabel = true,
}: Readonly<QuickLinkNoteProps>) {
  const {
    open,
    searchQuery,
    setSearchQuery,
    availableNotes,
    isLoading,
    isPending,
    handleLinkNote,
    handleOpenChange,
  } = useQuickLinkNote({ note, onSuccess })

  if (!note.collectionId) {
    return (
      <QuickLinkNoteTrigger
        variant={triggerVariant}
        size={triggerSize}
        showLabel={showLabel}
        disabled
        title="La note doit appartenir à une collection pour être liée"
      />
    )
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <QuickLinkNoteTrigger
          variant={triggerVariant}
          size={triggerSize}
          showLabel={showLabel}
        />
      </PopoverTrigger>
      <QuickLinkNotePopoverContent
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        availableNotes={availableNotes}
        isLoading={isLoading}
        isPending={isPending}
        onLink={handleLinkNote}
      />
    </Popover>
  )
})



