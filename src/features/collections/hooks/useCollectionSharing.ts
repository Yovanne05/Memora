import { useCollectionSharesQuery } from "./useCollectionSharesQuery";
import { useCreateCollectionShareMutation } from "./useCreateCollectionShareMutation";
import { useUpdateCollectionShareMutation } from "./useUpdateCollectionShareMutation";
import { useDeleteCollectionShareMutation } from "./useDeleteCollectionShareMutation";
import type { SharePermission } from "../dtos/collection-share.dto";

export function useCollectionSharing(collectionId: string) {
  const { data: shares = [], isLoading } = useCollectionSharesQuery(collectionId);
  const createMutation = useCreateCollectionShareMutation(collectionId);
  const updateMutation = useUpdateCollectionShareMutation();
  const deleteMutation = useDeleteCollectionShareMutation();

  const addShare = async (userId: string, permission: SharePermission) => {
    await createMutation.mutateAsync({ userId, permission });
  };

  const updateShare = async (userId: string, permission: SharePermission) => {
    await updateMutation.mutateAsync({
      collectionId,
      userId,
      payload: { permission },
    });
  };

  const removeShare = async (userId: string) => {
    await deleteMutation.mutateAsync({ collectionId, userId });
  };

  return {
    shares,
    isLoading,
    addShare,
    updateShare,
    removeShare,
  };
}
