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
  connections: NodeConnectionsMap,
  orphanNodeIds: Set<string>
): ReactFlowNode[] {
  return useMemo<ReactFlowNode[]>(() => {
    if (!data) return []
    // Filtrer les nœuds orphelins pour le graphe
    const filteredData = {
      ...data,
      nodes: data.nodes.filter((node) => !orphanNodeIds.has(node.id)),
    }
    return transformNodesToReactFlow(filteredData, positions, connections)
  }, [data, positions, connections, orphanNodeIds])
}
