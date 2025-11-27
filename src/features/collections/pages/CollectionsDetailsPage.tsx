import type { Collection } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Edit3, Plus, Share2 } from "lucide-react"

interface CollectionDetailsPageProps {
  collection: Collection
  onBack: () => void
  onEdit: (collection: Collection) => void
}

export function CollectionsDetailsPage({
  collection,
  onBack,
  onEdit,
}: CollectionDetailsPageProps) {
  return (
    <div className="space-y-8">
      {/* Breadcrumb + retour */}
      <button
        type="button"
        onClick={onBack}
        className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
      >
        <ChevronLeft className="h-3 w-3" />
        Collections
      </button>

      {/* Header principal */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="max-w-2xl text-sm text-slate-500">
              {collection.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => onEdit(collection)}
          >
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

      {/* Collaborators (placeholder pour l’instant) */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">
          Collaborators
        </h2>
        <p className="text-xs text-slate-500">
          Collaboration UI will be added later. For now, this collection is
          owned by you.
        </p>
      </div>

      {/* Bloc Notes (sans la liste pour l’instant) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Notes ({collection.notesCount})
          </h2>
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="Search notes..."
            className="max-w-md"
            disabled
          />
        </div>

        <p className="text-xs text-slate-400">
          Notes list will be implemented later.
        </p>
      </div>
    </div>
  )
}
