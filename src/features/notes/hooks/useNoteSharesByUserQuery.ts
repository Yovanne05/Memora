import { useQuery } from "@tanstack/react-query";
import { noteSharesService } from "../services/note-shares.service";
import { noteSharesKeys } from "./note-shares.keys";

export function useNoteSharesByUserQuery(userId?: string) {
  return useQuery({
    queryKey: userId ? noteSharesKeys.listByUser(userId) : noteSharesKeys.all,
    queryFn: () => noteSharesService.listByUser(userId ?? ""),
    enabled: Boolean(userId),
  });
}
