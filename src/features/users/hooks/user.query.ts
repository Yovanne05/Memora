import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { usersService } from '../services/users.service'
import type { UsersFilters } from '../types/user-query'
import { USERS_QUERY_KEYS } from '../constants/user.keys'

export function useUsersQuery(params: UsersFilters) {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.list(params),
    queryFn: () => usersService.list(params),
    placeholderData: keepPreviousData,
  })
}
