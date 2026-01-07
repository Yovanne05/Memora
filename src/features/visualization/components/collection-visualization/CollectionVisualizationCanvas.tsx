import type { MouseEvent } from "react"
import ReactFlow, { Background, Controls, MiniMap, type Edge, type Node } from "reactflow"
import "reactflow/dist/style.css"

import { CustomNode } from "../CustomNode"
import { getNodeColorByConnections } from "../../lib/visualization.constants"
import { getNodeColorForMiniMap } from "../../lib/dataTransformers"

type CollectionVisualizationCanvasProps = {
  nodes: Node[]
  edges: Edge[]
  onNodeClick: (event: MouseEvent, node: Node) => void
  onPaneClick: () => void
}

const NODE_TYPES = {
  custom: CustomNode,
} as const

export function CollectionVisualizationCanvas({
  nodes,
  edges,
  onNodeClick,
  onPaneClick,
}: Readonly<CollectionVisualizationCanvasProps>) {
  return (
    <div className="relative min-h-[400px] flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
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
          nodeColor={(node) => getNodeColorForMiniMap(node, getNodeColorByConnections)}
        />
      </ReactFlow>
    </div>
  )
}
