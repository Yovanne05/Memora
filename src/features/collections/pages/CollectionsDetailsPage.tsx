import { useState } from "react"
import { useCollections, useUpdateCollection } from "../hooks"
import type { Collection } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Edit3, Plus, Share2 } from "lucide-react"
import {
  CollectionEditForm,
  type CollectionFormValues,
} from "../components/CollectionEditForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "@tanstack/react-router"

interface CollectionDetailsPageProps {
  collection: Collection
}

export function CollectionsDetailsPage({ collection }: CollectionDetailsPageProps) {
  const router = useRouter()
  const { setCollections } = useCollections()

  const [currentCollection, setCurrentCollection] = useState<Collection>(collection)
  const [isEditing, setIsEditing] = useState(false)

  const { update, loading: updating } = useUpdateCollection((updated) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    )
    setCurrentCollection(updated)
    setIsEditing(false)
  })

  const handleEditSubmit = async (values: CollectionFormValues) => {
    await update(currentCollection.id, {
      name: values.name,
      description: values.description,
      visibility: values.visibility,
    })
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-8">
        <button
          type="button"
          onClick={() => router.navigate({ to: "/app/collections" })}
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="h-3 w-3" />
          Collections
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              {currentCollection.name}
            </h1>
            {currentCollection.description && (
              <p className="max-w-2xl text-sm text-slate-500">
                {currentCollection.description}
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
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            Collaborators
          </h2>
          <p className="text-xs text-slate-500">
            Collaboration UI will be added later. For now, this collection is owned by you.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Notes ({currentCollection.notesCount})
            </h2>
          </div>

          <div className="flex gap-3">
            <Input placeholder="Search notes..." className="max-w-md" disabled />
          </div>

          <p className="text-xs text-slate-400">
            Notes list will be implemented later.
          </p>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit collection</DialogTitle>
            <DialogDescription>
              Update the name, description or visibility of this collection.
            </DialogDescription>
          </DialogHeader>

          <CollectionEditForm
            mode="edit"
            initial={{
              name: currentCollection.name,
              description: currentCollection.description ?? "",
              visibility: currentCollection.visibility,
            }}
            loading={updating}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
