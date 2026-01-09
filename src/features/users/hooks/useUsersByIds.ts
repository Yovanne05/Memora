import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'

import { usersService } from '../services/users.service'
import type { User } from '../models/user.model'

export function useUsersByIds(userIds: string[]) {
  const uniqueIds = useMemo(
    () => Array.from(new Set(userIds.filter(Boolean))),
    [userIds]
  )

  const queries = useQueries({
    queries: uniqueIds.map((userId) => ({
      queryKey: ['users', 'by-id', userId],
      queryFn: () => usersService.get(userId),
      retry: 1,
      staleTime: 5 * 60 * 1000,
    })),
  })

  const users = queries
    .map((query) => query.data)
    .filter((user): user is User => user !== undefined)

  const usersById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users]
  )

  return {
    usersById,
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
  }
}
