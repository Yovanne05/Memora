import { useCollectionVisualizationQuery } from '../hooks/useCollectionVisualizationQuery'
import { useVisualizationLayout } from '../hooks/useVisualizationLayout'
import { VisualizationHeader } from './VisualizationHeader'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { NoteSidebar } from '../../notes/components/NoteSidebar'
import { LoadingState } from './VisualizationSkeleton'
import { CollectionVisualizationCanvas } from './collection-visualization/CollectionVisualizationCanvas'
import { CollectionVisualizationExtras } from './collection-visualization/CollectionVisualizationExtras'
import { useCollectionVisualizationInteractions } from '../hooks/useCollectionVisualizationInteractions'

interface CollectionVisualizationViewProps {
  readonly collectionId?: string
  readonly onBack?: () => void
}

export function CollectionVisualizationView({
  collectionId,
  onBack,
}: Readonly<CollectionVisualizationViewProps>) {
  const {
    data: collection,
    isLoading,
    isError,
  } = useCollectionVisualizationQuery(collectionId)

  const { nodes, edges, orphanNodeIds } = useVisualizationLayout(collection)
  const {
    styledNodes,
    styledEdges,
    selectedNote,
    relatedNotes,
    sidebar,
    handlers,
  } = useCollectionVisualizationInteractions({
    nodes,
    edges,
    orphanNodeIds,
    collection,
  })

  if (!collectionId) {
    return (
      <EmptyState message="Sélectionnez une collection à gauche pour afficher la visualisation." />
    )
  }

  if (isLoading) {
    return <LoadingState message="Chargement de la visualisation..." />
  }

  if (isError || !collection) {
    return (
      <ErrorState message="Erreur lors du chargement de la visualisation." />
    )
  }

  const connectedNotesCount = collection.nodes.length - orphanNodeIds.size

  return (
    <div className="flex h-full w-full flex-col">
      <VisualizationHeader
        notesCount={connectedNotesCount}
        connectionsCount={collection.edges.length}
        onBack={onBack}
      />
      <CollectionVisualizationCanvas
        nodes={styledNodes}
        edges={styledEdges}
        onNodeClick={handlers.handleNodeClick}
        onPaneClick={handlers.handlePaneClick}
      />
      <CollectionVisualizationExtras
        collection={collection}
        orphanNodeIds={orphanNodeIds}
        onSelectOrphan={handlers.handleOrphanNoteClick}
      />
      <NoteSidebar
        note={selectedNote}
        open={sidebar.isOpen}
        onClose={handlers.handleSidebarClose}
        relatedNotes={relatedNotes}
        onNoteClick={handlers.handleRelatedNoteClick}
      />
    </div>
  )
}
