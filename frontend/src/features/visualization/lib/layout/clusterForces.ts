import type { ForceLayoutNode } from "./forceConfig"

export function calculateClusterCenters(
  nodes: ForceLayoutNode[],
  nodeToCluster: Map<string, number>
): Map<number, { x: number; y: number }> {
  const clusterSums = new Map<number, { x: number; y: number; count: number }>()

  nodes.forEach((node) => {
    const clusterId = nodeToCluster.get(node.id)
    if (clusterId === undefined) return

    const current = clusterSums.get(clusterId) || { x: 0, y: 0, count: 0 }
    current.x += node.x ?? 0
    current.y += node.y ?? 0
    current.count++
    clusterSums.set(clusterId, current)
  })

  const centers = new Map<number, { x: number; y: number }>()
  clusterSums.forEach((sum, clusterId) => {
    if (sum.count > 0) {
      centers.set(clusterId, {
        x: sum.x / sum.count,
        y: sum.y / sum.count,
      })
    }
  })

  return centers
}

export function createClusterForce(
  simulationNodes: ForceLayoutNode[],
  nodeToCluster: Map<string, number>,
  clusterCenters: Map<number, { x: number; y: number }>,
  strength: number
) {
  return function force(alpha: number) {
    simulationNodes.forEach((node) => {
      const clusterId = nodeToCluster.get(node.id)
      if (clusterId === undefined) return

      const center = clusterCenters.get(clusterId)
      if (!center) return

      const dx = center.x - (node.x ?? 0)
      const dy = center.y - (node.y ?? 0)

      node.vx = (node.vx ?? 0) + dx * strength * alpha
      node.vy = (node.vy ?? 0) + dy * strength * alpha
    })
  }
}

export function calculateClusterStrength(
  clusterCount: number,
  nodeCount: number
): number {
  if (clusterCount > 1 && clusterCount < nodeCount) {
    return Math.min(0.15, 0.08 + clusterCount * 0.01)
  }
  return 0
}
