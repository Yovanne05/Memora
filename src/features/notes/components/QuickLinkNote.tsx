import { useState } from "react"
import { Link2, Search } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

import { useNotesQuery } from "../hooks/useNotesQuery"
import { useCreateNoteLinkMutation } from "../hooks/useCreateNoteLinkMutation"
import { useNoteLinksQuery } from "../hooks/useNoteLinksQuery"
import type { Note } from "../models/note.model"

interface QuickLinkNoteProps {
  readonly note: Note
  readonly onSuccess?: () => void
  readonly triggerVariant?: "default" | "outline" | "ghost"
  readonly triggerSize?: "default" | "sm" | "lg" | "icon"
  readonly showLabel?: boolean
}

export function QuickLinkNote({
  note,
  onSuccess,
  triggerVariant = "outline",
  triggerSize = "sm",
  showLabel = true
}: Readonly<QuickLinkNoteProps>) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: notesData, isLoading } = useNotesQuery(0, 50, {
    collection_id: note.collectionId,
  })

  const { data: existingLinks = [] } = useNoteLinksQuery(note.id)
  const createLinkMutation = useCreateNoteLinkMutation(note.id)

  const existingLinkIds = new Set(existingLinks.map(l => l.linkedNoteId))

  const availableNotes = (notesData?.items ?? [])
    .filter(n => n.id !== note.id)
    .filter(n => !existingLinkIds.has(n.id))
    .filter(n =>
      searchQuery === "" ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleLinkNote = async (targetNoteId: string, targetNoteTitle: string) => {
    try {
      await createLinkMutation.mutateAsync({ linkedNoteId: targetNoteId })
      toast.success(`Note liée à "${targetNoteTitle}"`)
      setSearchQuery("")
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      toast.error("Erreur lors de la liaison de la note")
    }
  }

  if (!note.collectionId) {
    return (
      <Button
        variant={triggerVariant}
        size={triggerSize}
        disabled
        title="La note doit appartenir à une collection pour être liée"
        className={showLabel ? "gap-2" : ""}
      >
        <Link2 className="h-4 w-4" />
        {showLabel && "Lier une note"}
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={showLabel ? "gap-2" : ""}
        >
          <Link2 className="h-4 w-4" />
          {showLabel && "Lier une note"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
                autoFocus
              />
            </div>
          </div>

          <ScrollArea className="max-h-[300px]">
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Chargement...
              </div>
            )}

            {!isLoading && availableNotes.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchQuery ? "Aucune note trouvée" : "Aucune note disponible"}
              </div>
            )}

            {!isLoading && availableNotes.map(availableNote => (
              <button
                key={availableNote.id}
                type="button"
                onClick={() => handleLinkNote(availableNote.id, availableNote.title)}
                disabled={createLinkMutation.isPending}
                className="w-full text-left p-3 border-b last:border-b-0 hover:bg-accent transition-colors disabled:opacity-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{availableNote.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {availableNote.content || "Sans contenu"}
                    </p>
                  </div>
                  {availableNote.tags.length > 0 && (
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {availableNote.tags.length}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
