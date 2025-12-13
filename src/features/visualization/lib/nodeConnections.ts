import type { NodeConnectionsMap } from "../types/visualization.type"
import type { GraphNode, GraphEdge } from "@/features/collections/models/collection.model"

/**
 * Calcule le nombre de connexions pour chaque nœud
 *
 * @param nodes - Nœuds de la collection
 * @param edges - Arêtes de la collection
 * @returns Map du nombre de connexions par nœud
 */
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

export function getNodeConnectionCount(
  nodeId: string,
  connections: NodeConnectionsMap
): number {
  return connections[nodeId] ?? 0
}
