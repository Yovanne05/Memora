import { useCallback, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { CollectionsHeader } from "../components/CollectionsHeader"
import { CollectionsToolbar } from "../components/CollectionsToolbar"
import { CollectionsGrid } from "../components/CollectionsGrid"
import { CollectionsListSkeleton } from "../components/CollectionsListSkeleton"
import { CollectionsEmptyState } from "../components/CollectionsEmptyState"
import { CollectionsErrorAlert } from "../components/CollectionsErrorAlert"
import { CollectionFormDialog } from "../components/CollectionFormDialog"
import type { CollectionFormValues } from "../components/CollectionEditForm"
import { DeleteCollectionDialog } from "../components/DeleteCollectionDialog"
import { applyCollectionsQuery, type CollectionsSort, type CollectionsTab } from "../lib/collections-query"
import type { Collection } from "../models/collection.model"
import { useCollectionDeletion } from "../hooks/useCollectionDeletion"
import { useCurrentUser } from "@/hooks/useCurrentUser"

import { Button } from "@/components/ui/button"
import { useCollections } from "../hooks/useCollectionsList"
import { useCreateCollection } from "../hooks/useCreateCollection"
import { useUpdateCollection } from "../hooks/useUpdateCollection"

export function CollectionsListPage() {
  const { userId } = useCurrentUser()
  const { collections, setCollections, loading, error, reload } = useCollections()
  const deletion = useCollectionDeletion({
    onDeleted: (id) => setCollections((prev) => prev.filter((c) => c.id !== id)),
  })

  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<CollectionsTab>("mine")
  const [sort, setSort] = useState<CollectionsSort>("recent")

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)

  const { create, loading: creating } = useCreateCollection((created) => {
    setCollections((prev) => [created, ...prev])
    setCreateOpen(false)
  })

  const { update, loading: updating } = useUpdateCollection((updated) => {
    setCollections((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setEditing(null)
  })

  const filtered = useMemo(() => {
    if (!userId) return []
    return applyCollectionsQuery(collections, {
      currentUserId: userId,
      tab,
      search,
      sort,
    })
  }, [collections, search, sort, tab, userId])

  const handleCreateSubmit = useCallback(
    async (values: CollectionFormValues) => {
      try {
        await create({
          ownerId: userId,
          name: values.name,
          description: values.description,
          visibility: values.visibility,
        })
      } catch (err) {
        console.error("Failed to create collection", err)
      }
    },
    [create, userId]
  )

  const handleEditSubmit = useCallback(
    async (values: CollectionFormValues) => {
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
    [editing, update]
  )

  const handleCreateClick = useCallback(() => setCreateOpen(true), [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CollectionsHeader />
        <Button
          onClick={handleCreateClick}
          size="lg"
          className="gap-2"
          aria-label="Créer une nouvelle collection"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouvelle collection
        </Button>
      </div>

      <CollectionsToolbar
        search={search}
        onSearchChange={setSearch}
        tab={tab}
        onTabChange={setTab}
        sort={sort}
        onSortChange={setSort}
      />

      {error && <CollectionsErrorAlert message={error} onRetry={reload} />}

      {loading ? (
        <CollectionsListSkeleton />
      ) : filtered.length ? (
        <CollectionsGrid
          items={filtered}
          onEdit={setEditing}
          onDelete={deletion.setTarget}
        />
      ) : (
        <CollectionsEmptyState />
      )}

      <CollectionFormDialog
        mode="create"
        open={createOpen}
        loading={creating}
        onSubmit={handleCreateSubmit}
        onClose={() => setCreateOpen(false)}
      />

      {editing && (
        <CollectionFormDialog
          mode="edit"
          open={!!editing}
          loading={updating}
          initial={{
            name: editing.name,
            description: editing.description ?? "",
            visibility: editing.visibility,
          }}
          onSubmit={handleEditSubmit}
          onClose={() => setEditing(null)}
        />
      )}

      <DeleteCollectionDialog
        open={!!deletion.target}
        collection={deletion.target}
        loading={deletion.loading}
        error={deletion.error ?? undefined}
        onCancel={deletion.reset}
        onConfirm={deletion.confirmDelete}
      />
    </div>
  )
}

export default CollectionsListPage
