import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionSharesService } from "../services/collection-shares.service";
import { collectionSharesKeys } from "./collection-shares.keys";
import type { CollectionShareUpdate } from "../models/collection-share.model";

interface UpdateCollectionShareParams {
  collectionId: string;
  userId: string;
  payload: CollectionShareUpdate;
}

export function useUpdateCollectionShareMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, userId, payload }: UpdateCollectionShareParams) =>
      collectionSharesService.update(collectionId, userId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: collectionSharesKeys.list(variables.collectionId),
      });
    },
  });
}
