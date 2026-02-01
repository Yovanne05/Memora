import type { Collection } from "@/features/collections/models/collection.model"
import { OrphanNotesZone } from "../OrphanNotesZone"
import { VisualizationLegend } from "../VisualizationLegend"

type CollectionVisualizationExtrasProps = {
  collection: Collection
  orphanNodeIds: Set<string>
  onSelectOrphan: (noteId: string) => void
}

export function CollectionVisualizationExtras({
  collection,
  orphanNodeIds,
  onSelectOrphan,
}: Readonly<CollectionVisualizationExtrasProps>) {
  return (
    <>
      <VisualizationLegend />
      <OrphanNotesZone
        collection={collection}
        orphanNodeIds={orphanNodeIds}
        onSelect={onSelectOrphan}
      />
    </>
  )
}
