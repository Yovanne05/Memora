import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import { useUserSearchQuery } from '@/features/users/hooks/useUserSearchQuery'
import type { User } from '@/features/users/models/user.model'
import type { PaginatedUsers } from '@/features/users/types/paginated-user'

const mockUsersService = vi.hoisted(() => ({
  list: vi.fn(),
}))

vi.mock('@/features/users/services/users.service', () => ({
  usersService: mockUsersService,
}))

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('useUserSearchQuery', () => {
  test('fetches users when query length is at least 2', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const user: User = {
      id: 'user-1',
      username: 'tester',
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00.000Z',
      role: 'client',
      lastLogin: null,
    }

    const response: PaginatedUsers = {
      items: [user],
      total: 1,
      limit: 10,
      offset: 0,
    }

    mockUsersService.list.mockResolvedValue(response)

    const { result } = renderHook(() => useUserSearchQuery('jo'), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(mockUsersService.list).toHaveBeenCalledWith({
      search: 'jo',
      limit: 10,
    })
  })
})
