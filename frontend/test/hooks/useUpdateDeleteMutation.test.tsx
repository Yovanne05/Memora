import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { vi, describe, test, expect } from 'vitest'
import {
  useUpdateMutation,
  useDeleteMutation,
} from '@/hooks/useResourceMutation'

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

describe('useUpdateMutation', () => {
  test('should invalidate detail query on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const mutationFn = vi.fn().mockResolvedValue({ id: '1', title: 'Updated' })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(
      () =>
        useUpdateMutation(
          {
            mutationFn,
            listQueryKey: ['items'],
            detailQueryKey: (id) => ['items', id],
          },
          { silent: true }
        ),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.mutateAsync({ id: '1' })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['items', '1'] })
  })
})

describe('useDeleteMutation', () => {
  test('should invalidate list query on delete', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const mutationFn = vi.fn().mockResolvedValue(undefined)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(
      () =>
        useDeleteMutation(
          {
            mutationFn,
            listQueryKey: ['items'],
            successMessage: 'Deleted',
          },
          { silent: true }
        ),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.mutateAsync({ id: '1' })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['items'] })
  })
})
