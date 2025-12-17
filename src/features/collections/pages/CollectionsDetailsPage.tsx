import { useParams } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { CollectionFormDialog } from "../components/dialogs/CollectionFormDialog"
import { DeleteCollectionDialog } from "../components/dialogs/DeleteCollectionDialog"
import { CollectionDetailsSkeleton } from "../components/details/CollectionDetailsSkeleton"
import { CollectionDetailsError } from "../components/details/CollectionDetailsError"
import { CollectionActions } from "../components/details/CollectionActions"
import { CollectionCollaboratorsSection } from "../components/details/CollectionCollaboratorsSection"
import { CollectionNotesSection } from "../components/details/CollectionNotesSection"
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
    <div className="w-full space-y-8 text-foreground">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-linear-to-br from-card via-card to-muted/30 px-6 py-8 shadow-sm md:px-8 md:py-10">
        <button
          type="button"
          onClick={details.handlers.onBack}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Retour aux collections"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux collections
        </button>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {details.collection.name}
              </h1>
            </div>
            {details.collection.description && (
              <p className="max-w-3xl text-base text-muted-foreground leading-relaxed">
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

      <div className="space-y-6">
        <CollectionCollaboratorsSection />
        <CollectionNotesSection />
      </div>

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
