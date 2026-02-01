import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '../services/users.service'
import type { UserUpdate } from '../models/user.model'

export function useUpdateUserMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UserUpdate) => usersService.update(userId, payload),
    onSuccess: (updatedUser) => {
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['users', userId] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })

      // Optimistically update the cache
      queryClient.setQueryData(['users', userId], updatedUser)
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersService.remove(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.removeQueries({ queryKey: ['users', userId] })
    },
  })
}
