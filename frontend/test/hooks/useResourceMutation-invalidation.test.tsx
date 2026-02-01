import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { useResourceMutation } from '@/hooks/useResourceMutation'

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

describe('useResourceMutation - query invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should invalidate queries on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const mutationFn = vi.fn().mockResolvedValue('OK')
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(
      () =>
        useResourceMutation(
          {
            mutationFn,
            queryKey: ['resource'],
            onSuccessInvalidate: [['list'], ['other']],
          },
          { silent: true }
        ),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.mutateAsync(undefined)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['list'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['other'] })
  })

  test('should call onSuccessUpdate callback', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const mutationFn = vi.fn().mockResolvedValue({ id: '1', name: 'Test' })
    const onSuccessUpdate = vi.fn()

    const { result } = renderHook(
      () =>
        useResourceMutation(
          {
            mutationFn,
            queryKey: ['resource'],
            onSuccessUpdate,
          },
          { silent: true }
        ),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.mutateAsync(undefined)
    })

    expect(onSuccessUpdate).toHaveBeenCalledWith(
      { id: '1', name: 'Test' },
      queryClient
    )
  })

  test('should not show toast when silent is true', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const mutationFn = vi.fn().mockResolvedValue('OK')
    const mockToastSuccess = vi.fn()
    vi.doMock('sonner', () => ({
      toast: { success: mockToastSuccess },
    }))

    const { result } = renderHook(
      () =>
        useResourceMutation(
          {
            mutationFn,
            queryKey: ['resource'],
            successMessage: 'Success!',
          },
          { silent: true }
        ),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.mutateAsync(undefined)
    })

    expect(mockToastSuccess).not.toHaveBeenCalled()
  })
})
