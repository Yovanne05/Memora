import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { CreateNotePayload } from "../api/notes.api"
import { createNote } from "../api/notes.api"
import type { Note } from "../models/note.model"

export function useCreateNoteMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateNotePayload) => createNote(payload),
        onSuccess: (data: Note) => {
            queryClient.invalidateQueries({ queryKey: ["notes"] })
            queryClient.setQueryData(["note", data.id], data)
        },
    })
}