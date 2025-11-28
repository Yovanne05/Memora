import { useState } from "react"
import type { CollectionFormValues } from "../components/CollectionEditForm"
import { CollectionFormDialog } from "../components/CollectionFormDialog"
import { useCollection, useUpdateCollection } from "../hooks/useCollections"
import { useCollectionDeletion } from "../hooks/useCollectionDeletion"
import { DeleteCollectionDialog } from "../components/DeleteCollectionDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Edit3, Plus, Share2 } from "lucide-react"
import { useRouter, useParams } from "@tanstack/react-router"

function useCollectionFromRoute() {
  const { id } = useParams({ strict: false })
  const { collection, loading, error, reload } = useCollection(id)
  return { collection, loading, error, reload }
}

export function CollectionsDetailsPage() {
  const router = useRouter()
  const { collection, loading, error, reload } = useCollectionFromRoute()
  const [isEditing, setIsEditing] = useState(false)

  const updateHook = useUpdateCollection(() => setIsEditing(false))
  const deletion = useCollectionDeletion({
    onDeleted: () => router.navigate({ to: "/app/collections" }),
  })

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading collection…</p>
  }

  if (error || !collection) {
    return (
      <div className="p-6">
        <p className="mb-3 text-sm text-red-600">
          {error ?? "Collection not found."}
        </p>
        <Button variant="outline" onClick={reload}>
          Retry
        </Button>
      </div>
    )
  }

  const handleEditSubmit = async (values: CollectionFormValues) => {
    await updateHook.update(collection.id, {
      name: values.name,
      description: values.description,
      visibility: values.visibility,
    })
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 text-foreground">
      <div className="space-y-8">
        <button
          type="button"
          onClick={() => router.navigate({ to: "/app/collections" })}
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" />
          Collections
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{collection.name}</h1>
            {collection.description && (
              <p className="max-w-2xl text-sm text-muted-foreground">
                {collection.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditing(true)}>
              <Edit3 className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" type="button">
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </Button>
            <Button size="sm" type="button">
              <Plus className="mr-1.5 h-4 w-4" />
              New Note
            </Button>
            <Button
              variant="destructive"
              size="sm"
              type="button"
              onClick={() => deletion.setTarget(collection)}
              disabled={deletion.loading}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <h2 className="mb-2 text-sm font-semibold">Collaborators</h2>
          <p className="text-xs text-muted-foreground">
            Collaboration UI will be added later. For now, this collection is owned by you.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Notes</h2>
          </div>

          <div className="flex gap-3">
            <Input placeholder="Search notes..." className="max-w-md" disabled />
          </div>

          <p className="text-xs text-muted-foreground">
            Notes list will be implemented later.
          </p>
        </div>
      </div>

      <CollectionFormDialog
        mode="edit"
        open={isEditing}
        loading={updateHook.loading}
        initial={{
          name: collection.name,
          description: collection.description ?? "",
          visibility: collection.visibility,
        }}
        onSubmit={handleEditSubmit}
        onClose={() => setIsEditing(false)}
      />

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

export default CollectionsDetailsPage
