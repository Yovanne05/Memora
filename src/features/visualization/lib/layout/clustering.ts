import type { LayoutNode, LayoutEdge, AdjacencyList } from "./types"

export interface Cluster {
  id: number
  nodeIds: string[]
  connections: number
}

export function detectClusters(
  nodes: LayoutNode[],
  edges: LayoutEdge[]
): Map<string, number> {
  if (nodes.length === 0) {
    return new Map()
  }

  const adjacency = buildAdjacencyList(nodes, edges)

  const nodeToCluster = new Map<string, number>()
  nodes.forEach((node, index) => {
    nodeToCluster.set(node.id, index)
  })

  const maxIterations = 10
  let hasChanged = true
  let iteration = 0

  while (hasChanged && iteration < maxIterations) {
    hasChanged = false
    iteration++

    const shuffledNodes = [...nodes].sort(() => Math.random() - 0.5)

    for (const node of shuffledNodes) {
      const neighbors = adjacency[node.id] || []
      if (neighbors.length === 0) continue

      const clusterCounts = new Map<number, number>()
      neighbors.forEach((neighborId) => {
        const cluster = nodeToCluster.get(neighborId)
        if (cluster !== undefined) {
          clusterCounts.set(cluster, (clusterCounts.get(cluster) || 0) + 1)
        }
      })

      let maxCount = 0
      let bestCluster = nodeToCluster.get(node.id)!

      clusterCounts.forEach((count, cluster) => {
        if (count > maxCount) {
          maxCount = count
          bestCluster = cluster
        }
      })

      const currentCluster = nodeToCluster.get(node.id)
      if (currentCluster !== bestCluster) {
        nodeToCluster.set(node.id, bestCluster)
        hasChanged = true
      }
    }
  }

  return nodeToCluster
}

function buildAdjacencyList(
  nodes: LayoutNode[],
  edges: LayoutEdge[]
): AdjacencyList {
  const adjacency: AdjacencyList = {}

  nodes.forEach((node) => {
    adjacency[node.id] = []
  })

  edges.forEach((edge) => {
    if (adjacency[edge.sourceId] && adjacency[edge.targetId]) {
      adjacency[edge.sourceId].push(edge.targetId)
      adjacency[edge.targetId].push(edge.sourceId)
    }
  })

  return adjacency
}

export function analyzeClusters(
  edges: LayoutEdge[],
  nodeToCluster: Map<string, number>
): Cluster[] {
  const clusterMap = new Map<number, Cluster>()

  nodeToCluster.forEach((clusterId, nodeId) => {
    if (!clusterMap.has(clusterId)) {
      clusterMap.set(clusterId, {
        id: clusterId,
        nodeIds: [],
        connections: 0,
      })
    }
    clusterMap.get(clusterId)!.nodeIds.push(nodeId)
  })

  edges.forEach((edge) => {
    const sourceCluster = nodeToCluster.get(edge.sourceId)
    const targetCluster = nodeToCluster.get(edge.targetId)

    if (
      sourceCluster !== undefined &&
      targetCluster !== undefined &&
      sourceCluster === targetCluster
    ) {
      const cluster = clusterMap.get(sourceCluster)
      if (cluster) {
        cluster.connections++
      }
    }
  })

  return Array.from(clusterMap.values())
}

export function calculateModularity(
  edges: LayoutEdge[],
  nodeToCluster: Map<string, number>
): number {
  if (edges.length === 0) return 0

  const m = edges.length

  let internalEdges = 0
  edges.forEach((edge) => {
    const sourceCluster = nodeToCluster.get(edge.sourceId)
    const targetCluster = nodeToCluster.get(edge.targetId)
    if (sourceCluster === targetCluster) {
      internalEdges++
    }
  })

  return internalEdges / m
}
