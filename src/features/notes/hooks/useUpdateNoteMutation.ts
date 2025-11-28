import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { UpdateNotePayload } from "../api/notes.api"
import { updateNote } from "../api/notes.api"
import type { Note } from "../models/note.model"

export function useUpdateNoteMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ noteId, payload }: { noteId: string; payload: UpdateNotePayload }) =>
            updateNote(noteId, payload),
        onSuccess: (data: Note) => {
            queryClient.setQueryData(["note", data.id], data)
            queryClient.invalidateQueries({ queryKey: ["notes"] })
        },
    })
}