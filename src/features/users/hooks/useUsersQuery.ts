import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/features/users/services/users.service'
import type { User, UserCreate, UserUpdate } from '@/features/users/models/user.model'
import type { UsersFilters } from '@/features/users/types/user-query'
import type { PaginatedUsers } from '@/features/users/types/paginated-user'

export const USERS_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USERS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: UsersFilters = {}) => [
    ...USERS_QUERY_KEYS.lists(),
    filters,
  ] as const,
  details: () => [...USERS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USERS_QUERY_KEYS.details(), id] as const,
}

export function useUsersListQuery(params?: UsersFilters) {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.list(params),
    queryFn: () => usersService.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  })
}

export function useUserQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.detail(id),
    queryFn: () => usersService.get(id),
    enabled: options?.enabled !== false && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

interface MutationCallbacks<TData = void> {
  onSuccess?: (data: TData) => void
  onError?: (error: Error) => void
}

export function useCreateUserMutation(callbacks?: MutationCallbacks<User>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserCreate) => usersService.create(data),
    onSuccess: (newUser) => {
      queryClient.setQueryData(
        USERS_QUERY_KEYS.list(),
        (old: PaginatedUsers | undefined) => {
          if (!old) return { items: [newUser], total: 1, limit: 10, offset: 0 }
          return {
            ...old,
            items: [newUser, ...old.items],
            total: old.total + 1,
          }
        }
      )

      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.lists(),
      })

      callbacks?.onSuccess?.(newUser)
    },
    onError: (error: Error) => {
      console.error('Failed to create user:', error)
      callbacks?.onError?.(error)
    },
  })
}

export function useUpdateUserMutation(callbacks?: MutationCallbacks<User>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdate }) =>
      usersService.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        USERS_QUERY_KEYS.list(),
        (old: PaginatedUsers | undefined) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.map((u) => (u.id === updated.id ? updated : u)),
          }
        }
      )

      queryClient.setQueryData(
        USERS_QUERY_KEYS.detail(updated.id),
        updated
      )

      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.detail(updated.id),
      })

      callbacks?.onSuccess?.(updated)
    },
    onError: (error: Error) => {
      console.error('Failed to update user:', error)
      callbacks?.onError?.(error)
    },
  })
}

export function useDeleteUserMutation(callbacks?: MutationCallbacks<void>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        USERS_QUERY_KEYS.list(),
        (old: PaginatedUsers | undefined) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.filter((u) => u.id !== id),
            total: old.total - 1,
          }
        }
      )

      queryClient.removeQueries({
        queryKey: USERS_QUERY_KEYS.detail(id),
      })

      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.lists(),
      })

      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      console.error('Failed to delete user:', error)
      callbacks?.onError?.(error)
    },
  })
}
