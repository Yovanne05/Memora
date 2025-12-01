import type {
  LayoutNode,
  NodeLevels,
  DegreeMap,
  AdjacencyList,
} from "./types"

export function initializeQueue(
  nodes: LayoutNode[],
  inDegree: DegreeMap,
  orphanNodes: Set<string>,
  levels: NodeLevels
): string[] {
  const queue: string[] = []

  nodes.forEach((node) => {
    if (orphanNodes.has(node.id)) return

    if (inDegree[node.id] === 0) {
      levels[node.id] = 0
      queue.push(node.id)
    }
  })

  if (queue.length === 0) {
    const fallback = nodes.find((node) => !orphanNodes.has(node.id))
    if (fallback) {
      levels[fallback.id] = 0
      queue.push(fallback.id)
    }
  }

  return queue
}

export function propagateLevels(
  queue: string[],
  outAdj: AdjacencyList,
  levels: NodeLevels
): void {
  while (queue.length > 0) {
    const nodeId = queue.shift() as string
    const currentLevel = levels[nodeId]

    for (const nextId of outAdj[nodeId] || []) {
      if (levels[nextId] === undefined) {
        levels[nextId] = currentLevel + 1
        queue.push(nextId)
      }
    }
  }
}

export function assignRemainingLevels(
  nodes: LayoutNode[],
  levels: NodeLevels,
  orphanNodes: Set<string>
): void {
  const unreachedNodes: string[] = []

  nodes.forEach((node) => {
    if (levels[node.id] === undefined && !orphanNodes.has(node.id)) {
      unreachedNodes.push(node.id)
    }
  })

  const existingLevels = Object.values(levels)
  let maxLevel = existingLevels.length ? Math.max(...existingLevels) : -1

  // Assigner les nœuds non-atteints
  if (unreachedNodes.length > 0) {
    const unreachedLevel = maxLevel >= 0 ? maxLevel + 1 : 0
    unreachedNodes.forEach((nodeId) => {
      levels[nodeId] = unreachedLevel
    })
    maxLevel = unreachedLevel
  }

  // Assigner les nœuds orphelins
  if (orphanNodes.size > 0) {
    const hasStructuredNodes = maxLevel >= 0 || unreachedNodes.length > 0
    const orphanLevel = hasStructuredNodes ? maxLevel + 1 : 0

    orphanNodes.forEach((nodeId) => {
      levels[nodeId] = orphanLevel
    })
  }
}
