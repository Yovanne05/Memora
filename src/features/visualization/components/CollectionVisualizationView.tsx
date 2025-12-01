import { useCallback } from "react"
import type { MouseEvent } from "react"
import ReactFlow, { Background, Controls, MiniMap, type Node } from "reactflow"
import "reactflow/dist/style.css"
import { useCollectionVisualizationQuery } from "../hooks/useCollectionVisualizationQuery"
import { useVisualizationLayout } from "../hooks/useVisualizationLayout"
import { CustomNode, type CustomNodeData } from "./CustomNode"
import { VisualizationHeader } from "./VisualizationHeader"
import { VisualizationLegend } from "./VisualizationLegend"
import { getNodeColorByConnections } from "../constants/visualization.constants"
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

  const { nodes, edges } = useVisualizationLayout(data)

  const onNodeClick = useCallback(
    (_event: MouseEvent, node: Node<CustomNodeData>) => {
      console.log("Note sélectionnée:", node)
    },
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

  return (
    <div className="flex h-full w-full flex-col">
      <VisualizationHeader
        notesCount={data.nodes.length}
        connectionsCount={data.edges.length}
      />

      <div className="relative min-h-[400px] flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
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
            nodeColor={getNodeColor}
          />
        </ReactFlow>
      </div>

      <VisualizationLegend />
    </div>
  )
}

function getNodeColor(node: Node): string {
  const connections = (node.data as CustomNodeData | undefined)?.connections ?? 0
  return getNodeColorByConnections(connections)
}
