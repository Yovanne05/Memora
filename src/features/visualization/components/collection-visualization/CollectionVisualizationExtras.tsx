import type { CollectionVisualization } from "../../types/visualization.type"
import { OrphanNotesZone } from "../OrphanNotesZone"
import { VisualizationLegend } from "../VisualizationLegend"

type CollectionVisualizationExtrasProps = {
  collection: CollectionVisualization
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
