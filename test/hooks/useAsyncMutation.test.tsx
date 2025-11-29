import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { useAsyncMutation } from '@/hooks/useAsyncMutation'

type TestComponentProps = {
  action: () => Promise<string>
  errorMessage: string
  onSuccess?: (result: string, args: unknown[]) => void
}

function TestComponent({ action, errorMessage, onSuccess }: TestComponentProps) {
  const { execute, loading, error, resetError } = useAsyncMutation(
    action,
    errorMessage,
    onSuccess
  )

  return (
    <div>
      <button onClick={() => execute().catch(() => {})}>run</button>
      <button onClick={resetError}>reset</button>
      <div>loading:{loading ? 'yes' : 'no'}</div>
      <div>error:{error ?? 'none'}</div>
    </div>
  )
}

describe('useAsyncMutation', () => {
  test('handles success and onSuccess callback', async () => {
    const action = vi.fn().mockResolvedValue('OK')
    const onSuccess = vi.fn()

    render(
      <TestComponent action={action} errorMessage="Erreur" onSuccess={onSuccess} />
    )

    userEvent.click(screen.getByText('run'))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('OK', expect.any(Array))
    })

    expect(screen.getByText('loading:no')).toBeTruthy()
    expect(screen.getByText('error:none')).toBeTruthy()
  })

  test('handles error and sets error message', async () => {
    const action = vi.fn().mockRejectedValue(new Error('boom'))

    render(<TestComponent action={action} errorMessage="Erreur" />)

    userEvent.click(screen.getByText('run'))

    await waitFor(() => {
      expect(screen.getByText(/error:boom/)).toBeTruthy()
    })

    expect(screen.getByText('loading:no')).toBeTruthy()
  })
})
