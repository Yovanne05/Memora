import { useMemo } from "react"
import type { NodeConnectionsMap, ReactFlowNode, ReactFlowEdge } from "../types/visualization.type"
import type { Collection } from "@/features/collections/models/collection.model"
import { useNodePositions } from "./useNodePositions"
import { calculateNodeConnections } from "../lib/nodeConnections"
import {
  transformNodesToReactFlow,
  extractNodePositions,
  filterValidEdges,
  transformEdgesToReactFlow,
} from "../lib/dataTransformers"

interface UseVisualizationLayoutResult {
  nodes: ReactFlowNode[]
  edges: ReactFlowEdge[]
  nodeConnections: NodeConnectionsMap
  orphanNodeIds: Set<string>
}

export function useVisualizationLayout(
  collection?: Collection
): UseVisualizationLayoutResult {
  const nodeConnections = useMemo<NodeConnectionsMap>(() => {
    if (!collection) return {}
    return calculateNodeConnections(collection.nodes, collection.edges)
  }, [collection])

  const { positions, orphanNodeIds } = useNodePositions(collection)

  const nodes = useMemo<ReactFlowNode[]>(() => {
    if (!collection) return []
    const filteredNodes = collection.nodes.filter((node) => !orphanNodeIds.has(node.id))
    return transformNodesToReactFlow(filteredNodes, positions, nodeConnections)
  }, [collection, positions, nodeConnections, orphanNodeIds])

  const edges = useMemo<ReactFlowEdge[]>(() => {
    if (!collection || nodes.length === 0) return []

    const nodePositions = extractNodePositions(nodes)
    const validNodeIds = new Set(nodes.map((node) => node.id))
    const validEdges = filterValidEdges(collection.edges, validNodeIds)

    return transformEdgesToReactFlow(validEdges, nodePositions)
  }, [collection, nodes])

  return {
    nodes,
    edges,
    nodeConnections,
    orphanNodeIds,
  }
}
