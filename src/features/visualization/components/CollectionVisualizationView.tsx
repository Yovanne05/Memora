import { useCollectionVisualizationQuery } from "../hook/useCollectionVisualizationQuery"

interface CollectionVisualizationViewProps {
  collectionId?: string
}

export function CollectionVisualizationView({ collectionId }: CollectionVisualizationViewProps) {
  const { data, isLoading, isError } = useCollectionVisualizationQuery(collectionId)

  if (!collectionId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Sélectionnez une collection à gauche pour afficher le Visualizatione.
      </div>
    )
  }

  if (isLoading) {
    return <div>Chargement du Visualizatione...</div>
  }

  if (isError || !data) {
    return <div>Erreur lors du chargement du Visualizatione.</div>
  }

  return (
    <div className="h-full w-full border rounded-lg p-4">
      <h2 className="mb-2 text-sm font-semibold">
        Visualisation des notes ({data.nodes.length} notes, {data.edges.length} liens)
      </h2>

      <div className="text-xs text-muted-foreground space-y-2">
        <div>
          <span className="font-semibold">Notes :</span>
          <ul className="list-disc list-inside">
            {data.nodes.map((n) => (
              <li key={n.id}>{n.title}</li>
            ))}
          </ul>
        </div>
        <div>
          <span className="font-semibold">Liens :</span>
          <ul className="list-disc list-inside">
            {data.edges.map((e, i) => (
              <li key={`${e.sourceId}-${e.targetId}-${i}`}>
                {e.sourceId} → {e.targetId}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
