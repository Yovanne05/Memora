import type { NodeLevels, NodePosition } from "./types"

export function groupNodesByLevel(levels: NodeLevels): Record<number, string[]> {
  const grouped: Record<number, string[]> = {}

  Object.entries(levels).forEach(([nodeId, level]) => {
    if (!grouped[level]) {
      grouped[level] = []
    }
    grouped[level].push(nodeId)
  })

  return grouped
}

export function calculatePositions(
  nodesByLevel: Record<number, string[]>,
  verticalGap: number,
  horizontalGap: number
): Record<string, NodePosition> {
  const positions: Record<string, NodePosition> = {}

  const sortedLevels = Object.keys(nodesByLevel)
    .map(Number)
    .sort((a, b) => a - b)

  sortedLevels.forEach((level) => {
    const nodeIds = nodesByLevel[level]
    const totalWidth = (nodeIds.length - 1) * horizontalGap
    const startX = -totalWidth / 2

    nodeIds.forEach((nodeId, index) => {
      positions[nodeId] = {
        x: startX + index * horizontalGap,
        y: level * verticalGap,
      }
    })
  })

  return positions
}
