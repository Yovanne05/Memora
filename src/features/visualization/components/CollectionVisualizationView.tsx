import { useCallback, useMemo } from "react"
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

  const memoizedNodeTypes = useMemo(() => nodeTypes, [])

  const onNodeClick = useCallback(
    (_event: MouseEvent, node: Node<CustomNodeData>) => {
      console.log("[Visualization] Note sélectionnée:", node)
    },
    []
  )

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
          nodes={nodes}
          edges={edges}
          nodeTypes={memoizedNodeTypes}
          onNodeClick={onNodeClick}
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
    </div>
  )
}
