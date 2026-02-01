import type { NodePosition, EdgeGroup } from "../../types/visualization.type"
import type { GraphEdge } from "@/features/collections/models/collection.model"
import { logger } from "@/lib/logger"

type ConnectionSides = {
  sourceSide: "top" | "bottom" | "left" | "right"
  targetSide: "top" | "bottom" | "left" | "right"
}

function getConnectionByAngle(degrees: number): ConnectionSides {
  if (degrees >= -22.5 && degrees < 22.5) {
    return { sourceSide: "right", targetSide: "left" }
  }

  if (degrees >= 22.5 && degrees < 112.5) {
    return { sourceSide: "bottom", targetSide: "top" }
  }

  if (degrees >= 112.5 && degrees < 157.5) {
    return { sourceSide: "bottom", targetSide: "top" }
  }

  if (degrees >= 157.5 || degrees < -157.5) {
    return { sourceSide: "left", targetSide: "right" }
  }

  if (degrees >= -157.5 && degrees < -67.5) {
    return { sourceSide: "top", targetSide: "bottom" }
  }

  return { sourceSide: "top", targetSide: "bottom" }
}

export function determineConnectionDirection(
  sourcePosition: NodePosition,
  targetPosition: NodePosition
): ConnectionSides {
  const dx = targetPosition.x - sourcePosition.x
  const dy = targetPosition.y - sourcePosition.y

  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (absDy > absDx * 1.2) {
    return {
      sourceSide: dy < 0 ? "top" : "bottom",
      targetSide: dy < 0 ? "bottom" : "top",
    }
  }

  if (absDx > absDy * 1.2) {
    return {
      sourceSide: dx < 0 ? "left" : "right",
      targetSide: dx < 0 ? "right" : "left",
    }
  }

  const angle = Math.atan2(dy, dx)
  const degrees = (angle * 180) / Math.PI

  return getConnectionByAngle(degrees)
}

export function calculateEdgeOffset(
  edgeIndex: number,
  totalEdges: number,
  baseOffset: number = 18,
  levelMultiplier: number = 10
): number {
  if (totalEdges <= 1) return 0

  if (totalEdges > 6) {
    const halfEdges = (totalEdges - 1) / 2
    const relativePosition = edgeIndex - halfEdges

    const scaleFactor = Math.max(0.7, 1 - totalEdges * 0.02)
    return relativePosition * (baseOffset * scaleFactor)
  }

  const laneSide = edgeIndex % 2 === 0 ? 1 : -1
  const laneLevel = Math.floor(edgeIndex / 2)

  return laneSide * (baseOffset + laneLevel * levelMultiplier)
}

export function groupEdgesByConnection(
  edges: GraphEdge[],
  positions: Record<string, NodePosition>
): EdgeGroup[] {
  const groupMap = new Map<string, EdgeGroup>()

  edges.forEach((edge, index) => {
    const sourcePos = positions[edge.source]
    const targetPos = positions[edge.target]

    if (!sourcePos || !targetPos) {
      logger.warn(
        `Impossible de positionner l'arete ${edge.source} -> ${edge.target} car une position est manquante`
      )
      return
    }

    const { sourceSide, targetSide } = determineConnectionDirection(
      sourcePos,
      targetPos
    )
    const key = `${edge.source}-${sourceSide}-${edge.target}-${targetSide}`

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        sourceId: edge.source,
        targetId: edge.target,
        sourceSide,
        targetSide,
        edgeIndices: [],
      })
    }

    groupMap.get(key)!.edgeIndices.push(index)
  })

  return Array.from(groupMap.values())
}
