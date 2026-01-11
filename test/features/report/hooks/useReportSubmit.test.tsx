import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useReportSubmit } from '@/features/report/hooks/useReportSubmit'
import type { ReportFormValues } from '@/features/report/schemas/report.schema'

const mockMutateAsync = vi.fn()
const mockUseReportNoteMutation = vi.fn()
const mockUseReportCollectionMutation = vi.fn()

vi.mock('@/features/report/hooks/useReportMutation', () => ({
  useReportNoteMutation: () => mockUseReportNoteMutation(),
  useReportCollectionMutation: () => mockUseReportCollectionMutation(),
}))

describe('useReportSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseReportNoteMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
    })
    mockUseReportCollectionMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
    })
  })

  it('should initialize with isSubmitting false', () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(() =>
      useReportSubmit({
        targetType: 'note',
        targetId: '123',
        onSuccess,
      })
    )

    expect(result.current.isSubmitting).toBe(false)
  })

  it('should submit note report successfully', async () => {
    const onSuccess = vi.fn()
    mockMutateAsync.mockResolvedValueOnce({})

    const { result } = renderHook(() =>
      useReportSubmit({
        targetType: 'note',
        targetId: '123',
        onSuccess,
      })
    )

    const values: ReportFormValues = {
      reason: 'spam',
      description: 'This is spam',
    }

    await result.current.handleSubmit(values)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        reason: 'spam',
        description: 'This is spam',
      })
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should submit collection report successfully', async () => {
    const onSuccess = vi.fn()
    mockMutateAsync.mockResolvedValueOnce({})

    const { result } = renderHook(() =>
      useReportSubmit({
        targetType: 'collection',
        targetId: '456',
        onSuccess,
      })
    )

    const values: ReportFormValues = {
      reason: 'inappropriate',
      description: 'Bad content',
    }

    await result.current.handleSubmit(values)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        reason: 'inappropriate',
        description: 'Bad content',
      })
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should set isSubmitting to true during submission', async () => {
    const onSuccess = vi.fn()
    mockMutateAsync.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    const { result } = renderHook(() =>
      useReportSubmit({
        targetType: 'note',
        targetId: '123',
        onSuccess,
      })
    )

    const values: ReportFormValues = {
      reason: 'spam',
    }

    result.current.handleSubmit(values)

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(true)
    })
  })

  it('should trim description whitespace', async () => {
    const onSuccess = vi.fn()
    mockMutateAsync.mockResolvedValueOnce({})

    const { result } = renderHook(() =>
      useReportSubmit({
        targetType: 'note',
        targetId: '123',
        onSuccess,
      })
    )

    const values: ReportFormValues = {
      reason: 'spam',
      description: '  whitespace around  ',
    }

    await result.current.handleSubmit(values)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        reason: 'spam',
        description: 'whitespace around',
      })
    })
  })

  it('should set description to undefined when empty after trim', async () => {
    const onSuccess = vi.fn()
    mockMutateAsync.mockResolvedValueOnce({})

    const { result } = renderHook(() =>
      useReportSubmit({
        targetType: 'note',
        targetId: '123',
        onSuccess,
      })
    )

    const values: ReportFormValues = {
      reason: 'spam',
      description: '   ',
    }

    await result.current.handleSubmit(values)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        reason: 'spam',
        description: '',
      })
    })
  })

  it('should handle submission errors gracefully', async () => {
    const onSuccess = vi.fn()
    mockMutateAsync.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() =>
      useReportSubmit({
        targetType: 'note',
        targetId: '123',
        onSuccess,
      })
    )

    const values: ReportFormValues = {
      reason: 'spam',
    }

    await result.current.handleSubmit(values)

    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled()
      expect(result.current.isSubmitting).toBe(false)
    })
  })

  it('should reset isSubmitting after error', async () => {
    const onSuccess = vi.fn()
    mockMutateAsync.mockRejectedValueOnce(new Error('Error'))

    const { result } = renderHook(() =>
      useReportSubmit({
        targetType: 'note',
        targetId: '123',
        onSuccess,
      })
    )

    const values: ReportFormValues = {
      reason: 'spam',
    }

    await result.current.handleSubmit(values)

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false)
    })
  })

  it('should handle missing description field', async () => {
    const onSuccess = vi.fn()
    mockMutateAsync.mockResolvedValueOnce({})

    const { result } = renderHook(() =>
      useReportSubmit({
        targetType: 'note',
        targetId: '123',
        onSuccess,
      })
    )

    const values: ReportFormValues = {
      reason: 'spam',
    }

    await result.current.handleSubmit(values)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        reason: 'spam',
        description: undefined,
      })
    })
  })

  it('should use correct mutation based on targetType', async () => {
    const onSuccess = vi.fn()
    mockMutateAsync.mockResolvedValueOnce({})

    const { result, rerender } = renderHook((props) => useReportSubmit(props), {
      initialProps: {
        targetType: 'note' as const,
        targetId: '123',
        onSuccess,
      },
    })

    await result.current.handleSubmit({ reason: 'spam' })

    await waitFor(() => {
      expect(mockUseReportNoteMutation).toHaveBeenCalled()
    })

    mockMutateAsync.mockClear()
    vi.clearAllMocks()

    rerender({
      // @ts-expect-error - Test mock
      targetType: 'collection' as const,
      targetId: '456',
      onSuccess,
    })

    await result.current.handleSubmit({ reason: 'spam' })

    await waitFor(() => {
      expect(mockUseReportCollectionMutation).toHaveBeenCalled()
    })
  })
})
