import { useMemo, useState } from "react"
import { 
  useCollections, 
  useCreateCollection, 
  useUpdateCollection 
} from "./hooks"
import { CollectionsHeader } from "./components/CollectionsHeader"
import { CollectionsToolbar } from "./components/CollectionsToolbar"
import { CollectionsGrid } from "./components/CollectionsGrid"

import type { Collection } from "./types"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  CollectionEditForm,
  type CollectionFormValues,
} from "./components/CollectionEditForm"

export function CollectionsFeature() {
  const { collections, setCollections, loading, error, reload } = useCollections()

  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"mine" | "shared">("mine")
  const [sort, setSort] = useState<"recent" | "alphabetical">("recent")

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)

  const { create, loading: creating } = useCreateCollection((created) => {
    setCollections((prev) => [created, ...prev])
    setCreateOpen(false)
  })

  const { update, loading: updating } = useUpdateCollection((updated) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    )
    setEditing(null)
  })

  const filtered = useMemo(() => {
    let list = [...collections]

    // TODO: plus tard filtrer réellement "shared"
    if (tab === "mine") {
      list = list
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
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
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

  return (
    <div className="min-h-screen bg-slate-50 px-10 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <CollectionsHeader onCreate={() => setCreateOpen(true)} />

        <CollectionsToolbar
          search={search}
          onSearchChange={setSearch}
          tab={tab}
          onTabChange={setTab}
          sort={sort}
          onSortChange={setSort}
        />

        {loading && (
          <p className="text-sm text-slate-500">Loading collections…</p>
        )}

        {error && (
          <p className="text-sm text-red-600">
            {error}{" "}
            <button
              type="button"
              onClick={reload}
              className="underline underline-offset-2"
            >
              Retry
            </button>
          </p>
        )}

        <CollectionsGrid
          items={filtered}
          onEdit={setEditing}
        />

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-slate-500">
            No collections found. Try changing your filters.
          </p>
        )}
      </div>

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

    </div>
  )
}

export default CollectionsFeature
