import { useCallback, useState } from "react"
import { resolveErrorMessage } from "@/lib/errors"

export function useAsyncMutation<Args extends unknown[], Result>(
  action: (...args: Args) => Promise<Result>,
  errorMessage: string,
  onSuccess?: (result: Result, args: Args) => void
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: Args) => {
      try {
        setLoading(true)
        setError(null)
        const result = await action(...args)
        onSuccess?.(result, args)
        return result
      } catch (err) {
        console.error(err)
        setError(resolveErrorMessage(err, errorMessage))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [action, errorMessage, onSuccess]
  )

  const resetError = useCallback(() => setError(null), [])

  return { execute, loading, error, resetError }
}
