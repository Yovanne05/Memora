import type { LayoutEdge, NodePosition, EdgeGroup } from "./types"

export function determineConnectionDirection(
  sourcePosition: NodePosition,
  targetPosition: NodePosition
): {
  sourceSide: "top" | "bottom" | "left" | "right"
  targetSide: "top" | "bottom" | "left" | "right"
} {
  const dx = targetPosition.x - sourcePosition.x
  const dy = targetPosition.y - sourcePosition.y

  if (dy !== 0) {
    return {
      sourceSide: dy < 0 ? "top" : "bottom",
      targetSide: dy < 0 ? "bottom" : "top",
    }
  }

  if (dx !== 0) {
    return {
      sourceSide: dx < 0 ? "left" : "right",
      targetSide: dx < 0 ? "right" : "left",
    }
  }

  return {
    sourceSide: "right",
    targetSide: "left",
  }
}

/**
 * Calcule le décalage d'une arête pour éviter les chevauchements
 */
export function calculateEdgeOffset(
  edgeIndex: number,
  totalEdges: number,
  baseOffset: number = 20,
  levelMultiplier: number = 12
): number {
  if (totalEdges <= 1) return 0

  const laneSide = edgeIndex % 2 === 0 ? 1 : -1
  const laneLevel = Math.floor(edgeIndex / 2)
  return laneSide * (baseOffset + laneLevel * levelMultiplier)
}

/**
 * Groupe les arêtes par paire de nœuds et direction pour gérer les connexions multiples
 */
export function groupEdgesByConnection(
  edges: LayoutEdge[],
  positions: Record<string, NodePosition>
): EdgeGroup[] {
  const groupMap = new Map<string, EdgeGroup>()

  edges.forEach((edge, index) => {
    const sourcePos = positions[edge.sourceId]
    const targetPos = positions[edge.targetId]

    if (!sourcePos || !targetPos) {
      console.warn(
        `Impossible de positionner l'arete ${edge.sourceId} -> ${edge.targetId} car une position est manquante`
      )
      return
    }

    const { sourceSide, targetSide } = determineConnectionDirection(
      sourcePos,
      targetPos
    )
    const key = `${edge.sourceId}-${sourceSide}-${edge.targetId}-${targetSide}`

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        sourceSide,
        targetSide,
        edgeIndices: [],
      })
    }

    groupMap.get(key)!.edgeIndices.push(index)
  })

  return Array.from(groupMap.values())
}
