import { useQuery } from "@tanstack/react-query";
import { collectionSharesService } from "../services/collection-shares.service";
import { collectionSharesKeys } from "./collection-shares.keys";

export function useCollectionSharesQuery(collectionId: string) {
  return useQuery({
    queryKey: collectionSharesKeys.list(collectionId),
    queryFn: () => collectionSharesService.list(collectionId),
    enabled: !!collectionId,
  });
}
