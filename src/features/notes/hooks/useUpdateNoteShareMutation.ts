import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noteSharesService } from "../services/note-shares.service";
import { noteSharesKeys } from "./note-shares.keys";
import type { NoteShareUpdate } from "../models/note-share.model";

interface UpdateNoteShareParams {
  noteId: string;
  userId: string;
  payload: NoteShareUpdate;
}

export function useUpdateNoteShareMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, userId, payload }: UpdateNoteShareParams) =>
      noteSharesService.update(noteId, userId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: noteSharesKeys.list(variables.noteId),
      });
    },
  });
}
