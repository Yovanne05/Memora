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
import type { Collection } from "../models/collection.model"
import { CollectionEditForm, type CollectionFormValues } from "../components/CollectionEditForm"
import { DeleteCollectionDialog } from "../components/DeleteCollectionDialog"
import { deleteCollection } from "../api/collections.api"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

const CURRENT_USER_ID = "user-1" // TODO: remplacer par auth plus tard

export function CollectionsListPage() {
  const { collections, setCollections, loading, error, reload } = useCollections()

  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"mine" | "shared">("mine")
  const [sort, setSort] = useState<"recent" | "alphabetical">("recent")

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

  const filtered = useMemo(() => {
    let list = [...collections]

    if (tab === "mine") {
      list = list.filter((c) => c.ownerId === CURRENT_USER_ID)
    } else if (tab === "shared") {
      list = list.filter((c) => c.ownerId !== CURRENT_USER_ID)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q)
      )
    }

    if (sort === "alphabetical") {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      list.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    }

    return list
  }, [collections, search, tab, sort])

  const handleCreateSubmit = async (values: CollectionFormValues) => {
    await create({
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

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button
            type="button"
            onClick={reload}
            className="font-medium underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="space-y-3 rounded-lg border bg-card p-4 shadow-sm"
            >
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      ) : filtered.length ? (
        <CollectionsGrid items={filtered} onEdit={setEditing} onDelete={setDeleting} />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border bg-card text-muted-foreground">
          No collections found. Try changing your filters.
        </div>
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
