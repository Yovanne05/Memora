import { useMemo } from "react"
import { useQueries } from "@tanstack/react-query"
import type { Note } from "../models/note.model"
import type { NoteLink } from "../models/note-link.model"
import { notesService } from "../services/notes.service"

export type LinkedNoteView = Note & { linkLabel: string }

export function useLinkedNotesQuery(links: NoteLink[] | undefined) {
  const linkedNoteIds = useMemo(
    () => links?.map((link) => link.linkedNoteId) ?? [],
    [links]
  )

  const labelByNoteId = useMemo(() => {
    const map = new Map<string, string>()
    for (const link of links ?? []) {
      map.set(link.linkedNoteId, link.label)
    }
    return map
  }, [links])

  const queries = useQueries({
    queries: linkedNoteIds.map((noteId) => ({
      queryKey: ["note", noteId],
      queryFn: () => notesService.get(noteId),
      retry: 1,
      staleTime: 5 * 60 * 1000,
    })),
  })

  const notes = useMemo(() => {
    const loadedNotes = queries
      .map((queryResult) => queryResult.data)
      .filter((note): note is Note => note !== undefined)

    return loadedNotes.map((note) => ({
      ...note,
      linkLabel: labelByNoteId.get(note.id) ?? "",
    }))
  }, [queries, labelByNoteId])

  return {
    notes,
    isLoading: queries.some((queryResult) => queryResult.isLoading),
    isError: queries.some((queryResult) => queryResult.isError),
  }
}
