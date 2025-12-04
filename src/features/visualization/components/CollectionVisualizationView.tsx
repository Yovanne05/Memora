import { useCallback, useMemo, useState } from "react"
import type { MouseEvent } from "react"
import ReactFlow, { Background, Controls, MiniMap, type Node } from "reactflow"
import "reactflow/dist/style.css"
import { useCollectionVisualizationQuery } from "../hooks/useCollectionVisualizationQuery"
import { useVisualizationLayout } from "../hooks/useVisualizationLayout"
import { CustomNode, type CustomNodeData } from "./CustomNode"
import { VisualizationHeader } from "./VisualizationHeader"
import { VisualizationLegend } from "./VisualizationLegend"
import { OrphanNotesZone } from "./OrphanNotesZone"
import { getNodeColorByConnections } from "../constants/visualization.constants"
import { getNodeColorForMiniMap } from "../lib/dataTransformers"
import { EmptyState } from "./EmptyState"
import { LoadingState } from "./LoadingState"
import { ErrorState } from "./ErrorState"
import { useNodeSelection } from "../hooks/useNodeSelection"
import { NoteDetailsModal } from "../../notes/components/NoteDetailsModal"
import { useNoteQuery } from "../../notes/hooks/useNoteQuery"

interface CollectionVisualizationViewProps {
  collectionId?: string
}

const nodeTypes = {
  custom: CustomNode,
}

export function CollectionVisualizationView({
  collectionId,
}: CollectionVisualizationViewProps) {
  const { data, isLoading, isError } =
    useCollectionVisualizationQuery(collectionId)

  const { nodes, edges, orphanNodeIds } = useVisualizationLayout(data)
  const { selectedNodeId, styledNodes, styledEdges, selectNode, clearSelection } = useNodeSelection(
    nodes,
    edges
  )

  const [modalOpen, setModalOpen] = useState(false)
  const { data: selectedNote } = useNoteQuery(selectedNodeId ?? "")

  const memoizedNodeTypes = useMemo(() => nodeTypes, [])

  const onNodeClick = useCallback(
    (_event: MouseEvent, node: Node<CustomNodeData>) => {
      // Si le nœud est déjà sélectionné, ouvrir le modal (deuxième clic)
      if (selectedNodeId === node.id) {
        setModalOpen(true)
        console.log("[Visualization] Ouverture du modal pour:", node)
      } else {
        // Premier clic : sélectionner et mettre en surbrillance
        selectNode(node.id)
        console.log("[Visualization] Note sélectionnée:", node)
      }
    },
    [selectNode, selectedNodeId]
  )

  const onPaneClick = useCallback(() => {
    clearSelection()
    setModalOpen(false)
  }, [clearSelection])

  const handleModalClose = useCallback((open: boolean) => {
    setModalOpen(open)
    if (!open) {
      clearSelection()
    }
  }, [clearSelection])

  const getMiniMapNodeColor = useCallback(
    (node: Node) => getNodeColorForMiniMap(node, getNodeColorByConnections),
    []
  )

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
      />

      <div className="relative min-h-[400px] flex-1">
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          nodeTypes={memoizedNodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
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

      {data && <OrphanNotesZone data={data} orphanNodeIds={orphanNodeIds} />}

      <NoteDetailsModal
        note={selectedNote ?? null}
        open={modalOpen}
        onOpenChange={handleModalClose}
      />
    </div>
  )
}
