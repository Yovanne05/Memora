import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { MutationCallbacks } from "@/lib/mutation-callbacks"
import { logger } from "@/lib/logger"

export interface ResourceMutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  queryKey: readonly unknown[]
  successMessage?: string
  errorMessage?: string
  onSuccessInvalidate?: readonly (readonly unknown[])[]
  onSuccessUpdate?: (data: TData, queryClient: ReturnType<typeof useQueryClient>) => void
}

/**
 * Hook factory générique pour les mutations CRUD
 * Élimine la duplication entre useCreateNoteMutation, useCreateCollectionMutation, etc.
 */
export function useResourceMutation<TData = unknown, TVariables = unknown>(
  config: ResourceMutationConfig<TData, TVariables>,
  callbacks?: MutationCallbacks<TData>
) {
  const queryClient = useQueryClient()

  const {
    mutationFn,
    queryKey,
    successMessage,
    errorMessage,
    onSuccessInvalidate,
    onSuccessUpdate,
  } = config

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (data) => {
      if (!callbacks?.silent && successMessage) {
        toast.success(successMessage)
      }

      if (onSuccessUpdate) {
        onSuccessUpdate(data, queryClient)
      }

      queryClient.setQueryData(queryKey, data)

      if (onSuccessInvalidate) {
        onSuccessInvalidate.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }

      callbacks?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = error instanceof Error ? error.message : errorMessage || "Une erreur est survenue"
        toast.error(message)
      }

      logger.error("Mutation error:", error)

      callbacks?.onError?.(error)
    },
  })
}


export function useCreateMutation<TData, TVariables, TListData = unknown>(
  config: Omit<ResourceMutationConfig<TData, TVariables>, 'queryKey' | 'onSuccessUpdate' | 'onSuccessInvalidate'> & {
    listQueryKey: readonly unknown[]
    detailQueryKey: (data: TData) => readonly unknown[]
    optimisticUpdate?: (old: TListData | undefined, newItem: TData) => TListData
  },
  callbacks?: MutationCallbacks<TData>
) {
  const { listQueryKey, detailQueryKey, optimisticUpdate, ...restConfig } = config

  return useResourceMutation<TData, TVariables>(
    {
      ...restConfig,
      queryKey: listQueryKey,
      onSuccessInvalidate: [listQueryKey],
      onSuccessUpdate: (data, queryClient) => {
        queryClient.setQueryData(detailQueryKey(data), data)

        if (optimisticUpdate) {
          queryClient.setQueryData(listQueryKey, (old: TListData | undefined) => optimisticUpdate(old, data))
        }
      },
    },
    callbacks
  )
}

/**
 * Helper pour créer une mutation de mise à jour
 */
export function useUpdateMutation<TData extends { id: string }, TVariables extends { id: string }>(
  config: Omit<ResourceMutationConfig<TData, TVariables>, 'queryKey' | 'onSuccessUpdate' | 'onSuccessInvalidate'> & {
    listQueryKey: readonly unknown[]
    detailQueryKey: (id: string) => readonly unknown[]
  },
  callbacks?: MutationCallbacks<TData>
) {
  const { listQueryKey, detailQueryKey, ...restConfig } = config

  return useResourceMutation<TData, TVariables>(
    {
      ...restConfig,
      queryKey: listQueryKey,
      onSuccessInvalidate: [listQueryKey],
      onSuccessUpdate: (data, queryClient) => {
        // Invalider aussi le détail spécifique
        queryClient.invalidateQueries({
          queryKey: detailQueryKey(data.id),
        })
      },
    },
    callbacks
  )
}

/**
 * Helper pour créer une mutation de suppression
 */
export function useDeleteMutation<TVariables extends { id: string }>(
  config: Omit<ResourceMutationConfig<void, TVariables>, 'queryKey' | 'onSuccessUpdate' | 'onSuccessInvalidate'> & {
    listQueryKey: readonly unknown[]
  },
  callbacks?: MutationCallbacks<void>
) {
  const { listQueryKey, ...restConfig } = config

  return useResourceMutation<void, TVariables>(
    {
      ...restConfig,
      queryKey: listQueryKey,
      onSuccessInvalidate: [listQueryKey],
    },
    callbacks
  )
}
