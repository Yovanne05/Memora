import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noteSharesService } from "../services/note-shares.service";
import { noteSharesKeys } from "./note-shares.keys";
import type { NoteShareCreate } from "../models/note-share.model";

export function useCreateNoteShareMutation(noteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NoteShareCreate) =>
      noteSharesService.create(noteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: noteSharesKeys.list(noteId),
      });
    },
  });
}
