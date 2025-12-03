import type { LayoutNode, LayoutEdge, NodePosition } from "./types"
import { DEFAULT_LAYOUT_CONFIG } from "./types"

interface RefineLayoutConfig {
  horizontalGap?: number
  verticalGap?: number
}

const LEVEL_PRECISION = 4

export function refineLayeredPositions(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  positions: Record<string, NodePosition>,
  config: RefineLayoutConfig = {}
): Record<string, NodePosition> {
  if (!nodes.length) {
    return positions
  }

  const refined = { ...positions }
  const { horizontalGap, verticalGap } = {
    ...DEFAULT_LAYOUT_CONFIG,
    ...config,
  }

  const levelValues = Array.from(
    new Set(Object.values(positions).map((pos) => normalizeLevel(pos.y)))
  ).sort((a, b) => a - b)

  if (!levelValues.length) {
    return refined
  }

  const levelIndexByValue = new Map<number, number>()
  levelValues.forEach((value, index) => levelIndexByValue.set(value, index))

  const levels: string[][] = levelValues.map(() => [])

  Object.entries(positions).forEach(([nodeId, pos]) => {
    const normalizedLevel = normalizeLevel(pos.y)
    const levelIndex = levelIndexByValue.get(normalizedLevel) ?? 0
    levels[levelIndex].push(nodeId)
  })

  const incomingNeighbors = buildNeighborMap(edges, "targetId", "sourceId")
  const outgoingNeighbors = buildNeighborMap(edges, "sourceId", "targetId")

  levels.forEach((_nodes, levelIndex) => {
    assignPositionsForLevel(
      levelIndex,
      levels,
      levelValues,
      refined,
      horizontalGap,
      verticalGap
    )
  })

  for (let level = 1; level < levels.length; level += 1) {
    reorderLevel(level, levels, refined, incomingNeighbors)
    assignPositionsForLevel(
      level,
      levels,
      levelValues,
      refined,
      horizontalGap,
      verticalGap
    )
  }

  for (let level = levels.length - 2; level >= 0; level -= 1) {
    reorderLevel(level, levels, refined, outgoingNeighbors)
    assignPositionsForLevel(
      level,
      levels,
      levelValues,
      refined,
      horizontalGap,
      verticalGap
    )
  }

  return refined
}

function buildNeighborMap(
  edges: LayoutEdge[],
  groupBy: "sourceId" | "targetId",
  neighbor: "sourceId" | "targetId"
): Map<string, string[]> {
  const map = new Map<string, string[]>()

  edges.forEach((edge) => {
    const key = edge[groupBy]
    const neighborId = edge[neighbor]
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key)!.push(neighborId)
  })

  return map
}

function reorderLevel(
  levelIndex: number,
  levels: string[][],
  positions: Record<string, NodePosition>,
  neighborMap: Map<string, string[]>
): void {
  const nodes = levels[levelIndex]
  if (nodes.length <= 1) {
    return
  }

  const decorated = nodes.map((nodeId, index) => ({
    nodeId,
    barycenter: computeBarycenter(nodeId, positions, neighborMap),
    originalIndex: index,
  }))

  decorated.sort((a, b) => {
    if (a.barycenter === null && b.barycenter === null) {
      return a.originalIndex - b.originalIndex
    }
    if (a.barycenter === null) return 1
    if (b.barycenter === null) return -1
    if (a.barycenter === b.barycenter) {
      return a.originalIndex - b.originalIndex
    }
    return a.barycenter - b.barycenter
  })

  levels[levelIndex] = decorated.map((entry) => entry.nodeId)
}

function computeBarycenter(
  nodeId: string,
  positions: Record<string, NodePosition>,
  neighborMap: Map<string, string[]>
): number | null {
  const neighbors = neighborMap.get(nodeId)
  if (!neighbors || neighbors.length === 0) {
    return null
  }

  const coords = neighbors
    .map((neighborId) => positions[neighborId]?.x)
    .filter((value): value is number => typeof value === "number")

  if (!coords.length) {
    return null
  }

  return coords.reduce((sum, value) => sum + value, 0) / coords.length
}

function assignPositionsForLevel(
  levelIndex: number,
  levels: string[][],
  levelValues: number[],
  positions: Record<string, NodePosition>,
  horizontalGap: number,
  verticalGap: number
): void {
  const nodes = levels[levelIndex]
  const levelY = levelValues[levelIndex] ?? levelIndex * verticalGap

  if (!nodes.length) {
    return
  }

  if (nodes.length === 1) {
    positions[nodes[0]] = {
      x: 0,
      y: levelY,
    }
    return
  }

  const totalWidth = (nodes.length - 1) * horizontalGap
  const startX = -totalWidth / 2

  nodes.forEach((nodeId, index) => {
    positions[nodeId] = {
      x: startX + index * horizontalGap,
      y: levelY,
    }
  })
}

function normalizeLevel(value: number): number {
  return Number(value.toFixed(LEVEL_PRECISION))
}
