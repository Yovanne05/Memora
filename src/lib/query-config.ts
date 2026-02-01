import { ApiError } from './errors'

export const DEFAULT_STALE_TIME = 5 * 60 * 1000
export const DEFAULT_GC_TIME = 10 * 60 * 1000

export function createQueryRetryConfig() {
  return {
    retry: (failureCount: number, error: unknown) => {
      if (error instanceof ApiError && error.status >= 500) {
        return false
      }
      return failureCount < 2
    },
  }
}

export const defaultQueryConfig = {
  staleTime: DEFAULT_STALE_TIME,
  gcTime: DEFAULT_GC_TIME,
  ...createQueryRetryConfig(),
}
