import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noteSharesService } from "../services/note-shares.service";
import { noteSharesKeys } from "./note-shares.keys";

interface DeleteNoteShareParams {
  noteId: string;
  userId: string;
}

export function useDeleteNoteShareMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, userId }: DeleteNoteShareParams) =>
      noteSharesService.remove(noteId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: noteSharesKeys.list(variables.noteId),
      });
    },
  });
}
