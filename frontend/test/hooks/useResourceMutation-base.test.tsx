import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { useResourceMutation } from '@/hooks/useResourceMutation'

const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: mockToast,
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

describe('useResourceMutation - base functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should set cache data and call onSuccess', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const mutationFn = vi.fn().mockResolvedValue('OK')
    const onSuccess = vi.fn()

    const { result } = renderHook(
      () =>
        useResourceMutation<string, { value: string }>(
          { mutationFn, queryKey: ['resource'], successMessage: 'done' },
          { onSuccess, silent: true }
        ),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.mutateAsync({ value: 'payload' })
    })

    expect(mutationFn).toHaveBeenCalled()
    expect(mutationFn.mock.calls[0][0]).toEqual({ value: 'payload' })
    expect(queryClient.getQueryData(['resource'])).toBe('OK')
    expect(onSuccess).toHaveBeenCalledWith('OK')
  })

  test('should call onError when mutation fails', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const error = new Error('boom')
    const mutationFn = vi.fn().mockRejectedValue(error)
    const onError = vi.fn()

    const { result } = renderHook(
      () =>
        useResourceMutation<string, void>(
          {
            mutationFn,
            queryKey: ['resource'],
            errorContext: {
              operation: 'create',
              resource: 'note',
              fallback: 'failed',
            },
          },
          { onError, silent: true }
        ),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      try {
        await result.current.mutateAsync(undefined as void)
      } catch {
        // Expected error, caught intentionally
      }
    })

    expect(onError).toHaveBeenCalledWith(error)
    expect(queryClient.getQueryData(['resource'])).toBeUndefined()
  })
})
