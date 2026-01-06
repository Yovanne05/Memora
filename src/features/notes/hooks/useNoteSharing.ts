import { useNoteSharesQuery } from "./useNoteSharesQuery";
import { useCreateNoteShareMutation } from "./useCreateNoteShareMutation";
import { useUpdateNoteShareMutation } from "./useUpdateNoteShareMutation";
import { useDeleteNoteShareMutation } from "./useDeleteNoteShareMutation";
import type { SharePermission } from "../dtos/note-share.dto";

export function useNoteSharing(noteId: string) {
  const { data: shares = [], isLoading } = useNoteSharesQuery(noteId);
  const createMutation = useCreateNoteShareMutation(noteId);
  const updateMutation = useUpdateNoteShareMutation();
  const deleteMutation = useDeleteNoteShareMutation();

  const addShare = async (userId: string, permission: SharePermission) => {
    await createMutation.mutateAsync({ userId, permission });
  };

  const updateShare = async (userId: string, permission: SharePermission) => {
    await updateMutation.mutateAsync({ noteId, userId, payload: { permission } });
  };

  const removeShare = async (userId: string) => {
    await deleteMutation.mutateAsync({ noteId, userId });
  };

  return {
    shares,
    isLoading,
    addShare,
    updateShare,
    removeShare,
  };
}
