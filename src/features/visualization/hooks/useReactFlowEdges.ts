import { useMemo } from "react"
import type {
  CollectionVisualization,
  ReactFlowEdge,
  ReactFlowNode,
} from "../types/visualization.type"
import {
  extractNodePositions,
  filterValidEdges,
  transformEdgesToReactFlow,
} from "../lib/dataTransformers"


export function useReactFlowEdges(
  data: CollectionVisualization | undefined,
  nodes: ReactFlowNode[]
): ReactFlowEdge[] {
  return useMemo<ReactFlowEdge[]>(() => {
    if (!data || nodes.length === 0) return []

    const positions = extractNodePositions(nodes)

    const validNodeIds = new Set(nodes.map((node) => node.id))
    const validEdges = filterValidEdges(data.edges, validNodeIds)

    return transformEdgesToReactFlow(validEdges, positions)
  }, [data, nodes])
}
