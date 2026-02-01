import { useQuery } from "@tanstack/react-query";
import { usersService } from "../services/users.service";

export function useUserSearchQuery(searchQuery: string) {
  return useQuery({
    queryKey: ["users", "search", searchQuery],
    queryFn: () =>
      usersService.list({
        search: searchQuery,
        limit: 10,
      }),
    enabled: searchQuery.length >= 2,
    staleTime: 30000,
  });
}
