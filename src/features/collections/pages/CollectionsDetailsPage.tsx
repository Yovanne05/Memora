import { useParams } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { CollectionFormDialog } from "../components/CollectionFormDialog"
import { DeleteCollectionDialog } from "../components/DeleteCollectionDialog"
import { CollectionDetailsSkeleton } from "../components/CollectionDetailsSkeleton"
import { CollectionDetailsError } from "../components/CollectionDetailsError"
import { CollectionActions } from "../components/CollectionActions"
import { CollectionCollaboratorsSection } from "../components/CollectionCollaboratorsSection"
import { CollectionNotesSection } from "../components/CollectionNotesSection"
import { useCollectionDetails } from "../hooks/useCollectionDetails"

export function CollectionsDetailsPage() {
  const { id } = useParams({ from: "/app/collections/$id/" })
  const details = useCollectionDetails(id)

  if (details.loading) {
    return <CollectionDetailsSkeleton />
  }

  if (details.error || !details.collection) {
    return (
      <CollectionDetailsError
        error={details.error}
        onRetry={details.reload}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 text-foreground">
      <div className="space-y-8">
        <button
          type="button"
          onClick={details.handlers.onBack}
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          aria-label="Retour aux collections"
        >
          <ChevronLeft className="h-3 w-3" aria-hidden="true" />
          Collections
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{details.collection.name}</h1>
            {details.collection.description && (
              <p className="max-w-2xl text-sm text-muted-foreground">
                {details.collection.description}
              </p>
            )}
          </div>

          <CollectionActions
            onEdit={() => details.setIsEditing(true)}
            onDelete={details.handlers.onDelete}
            isDeleting={details.deletion.loading}
          />
        </div>
      </div>

      <CollectionCollaboratorsSection />
      <CollectionNotesSection />

      <CollectionFormDialog
        mode="edit"
        open={details.isEditing}
        isPending={details.updateHook.loading}
        initial={details.initialValues}
        onSubmit={details.handlers.onEdit}
        onClose={() => details.setIsEditing(false)}
      />

      <DeleteCollectionDialog
        open={!!details.deletion.target}
        collection={details.deletion.target}
        loading={details.deletion.loading}
        error={details.deletion.error ?? undefined}
        onCancel={details.deletion.reset}
        onConfirm={details.deletion.confirmDelete}
      />
    </div>
  )
}

export default CollectionsDetailsPage
