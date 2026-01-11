import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { vi, describe, test, expect } from 'vitest'
import { useCreateMutation } from '@/hooks/useResourceMutation'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('useCreateMutation', () => {
  test('should update both list and detail queries', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const mutationFn = vi.fn().mockResolvedValue({ id: '1', title: 'New' })

    const { result } = renderHook(
      () =>
        useCreateMutation(
          {
            mutationFn,
            listQueryKey: ['items'],
            // @ts-expect-error - Test mock
            detailQueryKey: (data) => ['items', data.id],
          },
          { silent: true }
        ),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.mutateAsync(undefined)
    })

    expect(queryClient.getQueryData(['items', '1'])).toEqual({
      id: '1',
      title: 'New',
    })
  })

  test('should call optimistic update function', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    queryClient.setQueryData(['items'], [{ id: '0' }])

    const mutationFn = vi.fn().mockResolvedValue({ id: '1', title: 'New' })
    const optimisticUpdate = vi.fn((old: unknown[], newItem: unknown) => [
      ...(old || []),
      newItem,
    ])

    const { result } = renderHook(
      () =>
        useCreateMutation(
          {
            mutationFn,
            listQueryKey: ['items'],
            detailQueryKey: (data) => ['items', data.id],
            optimisticUpdate,
          },
          { silent: true }
        ),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.mutateAsync(undefined)
    })

    expect(optimisticUpdate).toHaveBeenCalledWith([{ id: '0' }], {
      id: '1',
      title: 'New',
    })
    expect(queryClient.getQueryData(['items', '1'])).toEqual({
      id: '1',
      title: 'New',
    })
  })
})
