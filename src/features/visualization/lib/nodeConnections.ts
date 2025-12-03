import type {
  CollectionVisualization,
  NodeConnectionsMap,
} from "../types/visualization.type"


export function calculateNodeConnections(
  data: CollectionVisualization
): NodeConnectionsMap {
  const connections: NodeConnectionsMap = {}

  data.nodes.forEach((node) => {
    connections[node.id] = 0
  })

  data.edges.forEach((edge) => {
    connections[edge.sourceId] = (connections[edge.sourceId] || 0) + 1
    connections[edge.targetId] = (connections[edge.targetId] || 0) + 1
  })

  return connections
}

export function getNodeConnectionCount(
  nodeId: string,
  connections: NodeConnectionsMap
): number {
  return connections[nodeId] ?? 0
}
