import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

import {
  useCollections,
  useCreateCollection,
  useUpdateCollection,
} from "../hooks/useCollections"
import { CollectionsHeader } from "../components/CollectionsHeader"
import { CollectionsToolbar } from "../components/CollectionsToolbar"
import { CollectionsGrid } from "../components/CollectionsGrid"
import { CollectionsListSkeleton } from "../components/CollectionsListSkeleton"
import { CollectionsEmptyState } from "../components/CollectionsEmptyState"
import { CollectionsErrorAlert } from "../components/CollectionsErrorAlert"
import { CollectionEditForm, type CollectionFormValues } from "../components/CollectionEditForm"
import { DeleteCollectionDialog } from "../components/DeleteCollectionDialog"
import { applyCollectionsQuery, type CollectionsSort, type CollectionsTab } from "../lib/collections-query"
import { deleteCollection } from "../api/collections.api"
import type { Collection } from "../models/collection.model"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const CURRENT_USER_ID = "8bfb888a-d099-4faf-9517-ecc7128c918c" // TODO: remplacer par auth plus tard

export function CollectionsListPage() {
  const { collections, setCollections, loading, error, reload } = useCollections()

  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<CollectionsTab>("mine")
  const [sort, setSort] = useState<CollectionsSort>("recent")

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [deleting, setDeleting] = useState<Collection | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { create, loading: creating } = useCreateCollection((created) => {
    setCollections((prev) => [created, ...prev])
    setCreateOpen(false)
  })

  const { update, loading: updating } = useUpdateCollection((updated) => {
    setCollections((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setEditing(null)
  })

  const filtered = useMemo(
    () =>
      applyCollectionsQuery(collections, {
        currentUserId: CURRENT_USER_ID,
        tab,
        search,
        sort,
      }),
    [collections, search, sort, tab]
  )

  const handleCreateSubmit = async (values: CollectionFormValues) => {
    await create({
      ownerId: CURRENT_USER_ID,
      name: values.name,
      description: values.description,
      visibility: values.visibility,
    })
  }

  const handleEditSubmit = async (values: CollectionFormValues) => {
    if (!editing) return
    await update(editing.id, {
      name: values.name,
      description: values.description,
      visibility: values.visibility,
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleting) return

    try {
      setDeletingLoading(true)
      setDeleteError(null)
      await deleteCollection(deleting.id)
      setCollections((prev) => prev.filter((c) => c.id !== deleting.id))
      setDeleting(null)
    } catch (err) {
      console.error(err)
      setDeleteError("Unable to delete this collection. Please try again.")
    } finally {
      setDeletingLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CollectionsHeader />
        <Button onClick={() => setCreateOpen(true)} size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          New collection
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
        <CollectionsGrid items={filtered} onEdit={setEditing} onDelete={setDeleting} />
      ) : (
        <CollectionsEmptyState />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New collection</DialogTitle>
            <DialogDescription>
              Create a new space to group related notes.
            </DialogDescription>
          </DialogHeader>

          <CollectionEditForm
            mode="create"
            loading={creating}
            onSubmit={handleCreateSubmit}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit collection</DialogTitle>
            <DialogDescription>
              Update the name, description or visibility of this collection.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <CollectionEditForm
              mode="edit"
              initial={{
                name: editing.name,
                description: editing.description ?? "",
                visibility: editing.visibility,
              }}
              loading={updating}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteCollectionDialog
        open={!!deleting}
        collection={deleting}
        loading={deletingLoading}
        error={deleteError ?? undefined}
        onCancel={() => {
          setDeleting(null)
          setDeleteError(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default CollectionsListPage
