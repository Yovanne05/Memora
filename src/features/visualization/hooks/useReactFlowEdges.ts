import { useMemo } from "react"
import type { ReactFlowEdge, ReactFlowNode } from "../types/visualization.type"
import type { Collection } from "@/features/collections/models/collection.model"
import {
  extractNodePositions,
  filterValidEdges,
  transformEdgesToReactFlow,
} from "../lib/dataTransformers"

export function useReactFlowEdges(
  collection: Collection | undefined,
  nodes: ReactFlowNode[]
): ReactFlowEdge[] {
  return useMemo<ReactFlowEdge[]>(() => {
    if (!collection || nodes.length === 0) return []

    const positions = extractNodePositions(nodes)

    const validNodeIds = new Set(nodes.map((node) => node.id))
    const validEdges = filterValidEdges(collection.edges, validNodeIds)

    return transformEdgesToReactFlow(validEdges, positions)
  }, [collection, nodes])
}
