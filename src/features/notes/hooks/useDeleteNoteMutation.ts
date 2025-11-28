import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteNote } from "../api/notes.api"

export function useDeleteNoteMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (noteId: string) => deleteNote(noteId),
        onSuccess: (_, noteId) => {
            queryClient.invalidateQueries({ queryKey: ["notes"] })
            queryClient.removeQueries({ queryKey: ["note", noteId] })
        },
    })
}