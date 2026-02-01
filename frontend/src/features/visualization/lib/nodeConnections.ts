import type { NodeConnectionsMap } from "../types/visualization.type"
import type { GraphNode, GraphEdge } from "@/features/collections/models/collection.model"

export function calculateNodeConnections(
  nodes: GraphNode[],
  edges: GraphEdge[]
): NodeConnectionsMap {
  const connections: NodeConnectionsMap = {}

  nodes.forEach((node) => {
    connections[node.id] = 0
  })

  edges.forEach((edge) => {
    connections[edge.source] = (connections[edge.source] || 0) + 1
    connections[edge.target] = (connections[edge.target] || 0) + 1
  })

  return connections
}
