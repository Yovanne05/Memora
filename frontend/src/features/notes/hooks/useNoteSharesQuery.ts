import { useQuery } from "@tanstack/react-query";
import { noteSharesService } from "../services/note-shares.service";
import { noteSharesKeys } from "./note-shares.keys";

export function useNoteSharesQuery(noteId: string) {
  return useQuery({
    queryKey: noteSharesKeys.list(noteId),
    queryFn: () => noteSharesService.list(noteId),
    enabled: !!noteId,
  });
}
