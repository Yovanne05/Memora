export interface MutationCallbacks<T = void> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  silent?: boolean
}
