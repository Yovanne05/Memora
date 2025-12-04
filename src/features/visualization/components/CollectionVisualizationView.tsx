import { useCallback, useEffect, useMemo } from "react"
import type { MouseEvent } from "react"
import ReactFlow, { Background, Controls, MiniMap, type Node } from "reactflow"
import "reactflow/dist/style.css"
import { useCollectionVisualizationQuery } from "../hooks/useCollectionVisualizationQuery"
import { useVisualizationLayout } from "../hooks/useVisualizationLayout"
import { CustomNode, type CustomNodeData } from "./CustomNode"
import { VisualizationHeader } from "./VisualizationHeader"
import { VisualizationLegend } from "./VisualizationLegend"
import { OrphanNotesZone } from "./OrphanNotesZone"
import { getNodeColorByConnections } from "../lib/visualization.constants"
import { getNodeColorForMiniMap } from "../lib/dataTransformers"
import { EmptyState } from "./EmptyState"
import { LoadingState } from "./LoadingState"
import { ErrorState } from "./ErrorState"
import { useNodeSelection } from "../hooks/useNodeSelection"
import { useNoteSidebar } from "../hooks/useNoteSidebar"
import { useRelatedNotes } from "../hooks/useRelatedNotes"
import { NoteSidebar } from "../../notes/components/NoteSidebar"
import { useNoteQuery } from "../../notes/hooks/useNoteQuery"

interface CollectionVisualizationViewProps {
  collectionId?: string
  onBack?: () => void
}

const NODE_TYPES = {
  custom: CustomNode,
} as const

export function CollectionVisualizationView({
  collectionId,
  onBack,
}: CollectionVisualizationViewProps) {
  const { data, isLoading, isError } =
    useCollectionVisualizationQuery(collectionId)

  const { nodes, edges, orphanNodeIds } = useVisualizationLayout(data)
  const { selectedNodeId, styledNodes, styledEdges, selectNode, clearSelection } =
    useNodeSelection(nodes, edges)

  const sidebar = useNoteSidebar()
  const { data: selectedNote } = useNoteQuery(sidebar.activeNoteId ?? "")
  const relatedNotes = useRelatedNotes(sidebar.activeNoteId, data)

  const memoizedNodeTypes = useMemo(() => NODE_TYPES, [])

  const handleNodeClick = useCallback(
    (_event: MouseEvent, node: Node<CustomNodeData>) => {
      if (selectedNodeId !== node.id) {
        selectNode(node.id)
      }
      sidebar.openWithNote(node.id)
    },
    [selectNode, selectedNodeId, sidebar]
  )

  const handlePaneClick = useCallback(() => {
    clearSelection()
    sidebar.close()
  }, [clearSelection, sidebar])

  const handleSidebarClose = useCallback(() => {
    clearSelection()
    sidebar.close()
  }, [clearSelection, sidebar])

  const handleRelatedNoteClick = useCallback(
    (noteId: string) => {
      if (selectedNodeId !== noteId) {
        selectNode(noteId)
      }
      sidebar.openWithNote(noteId)
    },
    [selectNode, selectedNodeId, sidebar]
  )

  const handleOrphanNoteClick = useCallback(
    (noteId: string) => {
      clearSelection()
      sidebar.openWithNote(noteId)
    },
    [clearSelection, sidebar]
  )

  const getMiniMapNodeColor = useCallback(
    (node: Node) => getNodeColorForMiniMap(node, getNodeColorByConnections),
    []
  )

  useEffect(() => {
    if (selectedNodeId) {
      sidebar.openWithNote(selectedNodeId)
      return
    }

    if (!selectedNodeId && sidebar.activeNoteId && !orphanNodeIds.has(sidebar.activeNoteId)) {
      sidebar.close()
    }
  }, [selectedNodeId, sidebar, orphanNodeIds])

  if (!collectionId) {
    return (
      <EmptyState message="Sélectionnez une collection à gauche pour afficher la visualisation." />
    )
  }

  if (isLoading) {
    return <LoadingState message="Chargement de la visualisation..." />
  }

  if (isError || !data) {
    return <ErrorState message="Erreur lors du chargement de la visualisation." />
  }

  const connectedNotesCount = data.nodes.length - orphanNodeIds.size

  return (
    <div className="flex h-full w-full flex-col">
      <VisualizationHeader
        notesCount={connectedNotesCount}
        connectionsCount={data.edges.length}
        onBack={onBack}
      />

      <div className="relative min-h-[400px] flex-1">
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          nodeTypes={memoizedNodeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          className="bg-muted/30"
          nodesDraggable={true}
          nodesConnectable={false}
        >
          <Background gap={16} />
          <Controls className="rounded-lg border shadow-lg" />
          <MiniMap
            className="rounded-lg border shadow-lg"
            nodeColor={getMiniMapNodeColor}
          />
        </ReactFlow>
      </div>

      <VisualizationLegend />

      {data && (
        <OrphanNotesZone
          data={data}
          orphanNodeIds={orphanNodeIds}
          onSelect={handleOrphanNoteClick}
        />
      )}

      <NoteSidebar
        note={selectedNote ?? null}
        open={sidebar.isOpen}
        onClose={handleSidebarClose}
        relatedNotes={relatedNotes}
        onNoteClick={handleRelatedNoteClick}
      />
    </div>
  )
}
