import { useQuery } from "@tanstack/react-query";
import { collectionSharesService } from "../services/collection-shares.service";
import { collectionSharesKeys } from "./collection-shares.keys";

export function useCollectionSharesByUserQuery(userId?: string) {
  return useQuery({
    queryKey: userId
      ? collectionSharesKeys.listByUser(userId)
      : collectionSharesKeys.all,
    queryFn: () => collectionSharesService.listByUser(userId ?? ""),
    enabled: Boolean(userId),
  });
}
