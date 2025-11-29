import { useMemo, useState } from "react"
import type { CollectionFormValues } from "../components/CollectionEditForm"
import type { Collection } from "../models/collection.model"
import type { CollectionsSort, CollectionsTab } from "../lib/collections-query"
import { applyCollectionsQuery } from "../lib/collections-query"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useCollections } from "./useCollectionsList"
import { useCreateCollection } from "./useCreateCollection"
import { useUpdateCollection } from "./useUpdateCollection"
import { useCollectionDeletion } from "./useCollectionDeletion"

export function useCollectionsManager() {
  const { userId } = useCurrentUser()
  const { collections, setCollections, loading, error, reload } = useCollections()

  // UI State
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<CollectionsTab>("mine")
  const [sort, setSort] = useState<CollectionsSort>("recent")
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)

  // Operations
  const { create, loading: creating } = useCreateCollection((created) => {
    setCollections((prev) => [created, ...prev])
    setCreateOpen(false)
  })

  const { update, loading: updating } = useUpdateCollection((updated) => {
    setCollections((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setEditing(null)
  })

  const deletion = useCollectionDeletion({
    onDeleted: (id) => setCollections((prev) => prev.filter((c) => c.id !== id)),
  })

  // Computed
  const filtered = useMemo(() => {
    if (!userId) return []
    return applyCollectionsQuery(collections, {
      currentUserId: userId,
      tab,
      search,
      sort,
    })
  }, [collections, search, sort, tab, userId])

  // Handlers
  const handlers = useMemo(
    () => ({
      create: async (values: CollectionFormValues) => {
        try {
          await create({
            ownerId: userId!,
            name: values.name,
            description: values.description,
            visibility: values.visibility,
          })
        } catch (err) {
          console.error("Failed to create collection", err)
        }
      },
      edit: async (values: CollectionFormValues) => {
        if (!editing) return
        try {
          await update(editing.id, {
            name: values.name,
            description: values.description,
            visibility: values.visibility,
          })
        } catch (err) {
          console.error("Failed to update collection", err)
        }
      },
      openCreate: () => setCreateOpen(true),
      closeCreate: () => setCreateOpen(false),
      startEdit: (collection: Collection) => setEditing(collection),
      cancelEdit: () => setEditing(null),
    }),
    [create, update, editing, userId]
  )

  return {
    // Data
    collections: filtered,
    loading,
    error,
    userId,

    // UI State
    search,
    setSearch,
    tab,
    setTab,
    sort,
    setSort,

    // Modals
    createOpen,
    editing,
    deletion,

    // Operations
    creating,
    updating,

    // Actions
    handlers,
    reload,
  }
}
