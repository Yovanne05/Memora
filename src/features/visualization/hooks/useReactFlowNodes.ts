import { useMemo } from "react"
import type {
  CollectionVisualization,
  ReactFlowNode,
  NodeConnectionsMap,
} from "../types/visualization.type"
import type { NodePosition } from "../lib/layout/types"
import { transformNodesToReactFlow } from "../lib/dataTransformers"

export function useReactFlowNodes(
  data: CollectionVisualization | undefined,
  positions: Record<string, NodePosition>,
  connections: NodeConnectionsMap
): ReactFlowNode[] {
  return useMemo<ReactFlowNode[]>(() => {
    if (!data) return []
    return transformNodesToReactFlow(data, positions, connections)
  }, [data, positions, connections])
}
