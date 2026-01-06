import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionSharesService } from "../services/collection-shares.service";
import { collectionSharesKeys } from "./collection-shares.keys";

interface DeleteCollectionShareParams {
  collectionId: string;
  userId: string;
}

export function useDeleteCollectionShareMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, userId }: DeleteCollectionShareParams) =>
      collectionSharesService.remove(collectionId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: collectionSharesKeys.list(variables.collectionId),
      });
    },
  });
}
