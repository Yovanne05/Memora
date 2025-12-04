import { useQuery } from "@tanstack/react-query"
import { usersService } from "../services/users.service"

export function useUserDetails(userId: string | undefined) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => {
      if (!userId) throw new Error("User ID is required")
      return usersService.get(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}
