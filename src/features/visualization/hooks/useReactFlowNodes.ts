import { useMemo } from "react"
import type { ReactFlowNode, NodeConnectionsMap } from "../types/visualization.type"
import type { Collection } from "@/features/collections/models/collection.model"
import type { NodePosition } from "../lib/layout/types"
import { transformNodesToReactFlow } from "../lib/dataTransformers"

export function useReactFlowNodes(
  collection: Collection | undefined,
  positions: Record<string, NodePosition>,
  connections: NodeConnectionsMap,
  orphanNodeIds: Set<string>
): ReactFlowNode[] {
  return useMemo<ReactFlowNode[]>(() => {
    if (!collection) return []
    const filteredNodes = collection.nodes.filter((node) => !orphanNodeIds.has(node.id))
    return transformNodesToReactFlow(filteredNodes, positions, connections)
  }, [collection, positions, connections, orphanNodeIds])
}
