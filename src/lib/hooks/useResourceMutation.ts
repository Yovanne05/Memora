import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query"
import { toast } from "sonner"
import type { MutationCallbacks } from "@/lib/mutation-callbacks"

export interface ResourceMutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  queryKey: unknown[]
  successMessage?: string
  errorMessage?: string
  onSuccessInvalidate?: unknown[][]
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
      // Toast de succès
      if (!callbacks?.silent && successMessage) {
        toast.success(successMessage)
      }

      // Mise à jour du cache si fournie
      if (onSuccessUpdate) {
        onSuccessUpdate(data, queryClient)
      }

      // Mettre à jour le cache pour l'élément spécifique
      queryClient.setQueryData(queryKey, data)

      // Invalider les queries liées
      if (onSuccessInvalidate) {
        onSuccessInvalidate.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }

      // Callback custom
      callbacks?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      // Toast d'erreur
      if (!callbacks?.silent) {
        const message = error instanceof Error ? error.message : errorMessage || "Une erreur est survenue"
        toast.error(message)
      }

      console.error("Mutation error:", error)

      // Callback custom
      callbacks?.onError?.(error)
    },
  })
}

/**
 * Helper pour créer une mutation de création
 */
export function useCreateMutation<TData, TVariables>(
  config: Omit<ResourceMutationConfig<TData, TVariables>, 'queryKey'> & {
    listQueryKey: unknown[]
    detailQueryKey: (data: TData) => unknown[]
    optimisticUpdate?: (old: any, newItem: TData) => any
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
        // Mettre à jour le cache de détail
        queryClient.setQueryData(detailQueryKey(data), data)

        // Mise à jour optimiste de la liste si fournie
        if (optimisticUpdate) {
          queryClient.setQueryData(listQueryKey, (old: any) => optimisticUpdate(old, data))
        }
      },
    },
    callbacks
  )
}

/**
 * Helper pour créer une mutation de mise à jour
 */
export function useUpdateMutation<TData, TVariables extends { id: string }>(
  config: Omit<ResourceMutationConfig<TData, TVariables>, 'queryKey'> & {
    listQueryKey: unknown[]
    detailQueryKey: (id: string) => unknown[]
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
          queryKey: detailQueryKey((data as any).id),
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
  config: Omit<ResourceMutationConfig<void, TVariables>, 'queryKey'> & {
    listQueryKey: unknown[]
    detailQueryKey: (id: string) => unknown[]
  },
  callbacks?: MutationCallbacks<void>
) {
  const { listQueryKey, detailQueryKey, ...restConfig } = config

  return useResourceMutation<void, TVariables>(
    {
      ...restConfig,
      queryKey: listQueryKey,
      onSuccessInvalidate: [listQueryKey],
      onSuccessUpdate: (_data, queryClient) => {
        // Le détail sera invalidé via les callbacks si nécessaire
      },
    },
    callbacks
  )
}
