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

  // Calculer l'angle pour une meilleure détection de direction
  const angle = Math.atan2(dy, dx)
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  // Si la distance verticale est dominante (ratio > 1.5)
  if (absDy > absDx * 1.2) {
    return {
      sourceSide: dy < 0 ? "top" : "bottom",
      targetSide: dy < 0 ? "bottom" : "top",
    }
  }

  // Si la distance horizontale est dominante (ratio > 1.5)
  if (absDx > absDy * 1.2) {
    return {
      sourceSide: dx < 0 ? "left" : "right",
      targetSide: dx < 0 ? "right" : "left",
    }
  }

  // Pour les cas diagonaux, utiliser l'angle
  // Diviser en 8 secteurs (45° chacun)
  const degrees = (angle * 180) / Math.PI

  if (degrees >= -22.5 && degrees < 22.5) {
    // Droite
    return { sourceSide: "right", targetSide: "left" }
  } else if (degrees >= 22.5 && degrees < 67.5) {
    // Bas-droite
    return { sourceSide: "bottom", targetSide: "top" }
  } else if (degrees >= 67.5 && degrees < 112.5) {
    // Bas
    return { sourceSide: "bottom", targetSide: "top" }
  } else if (degrees >= 112.5 && degrees < 157.5) {
    // Bas-gauche
    return { sourceSide: "bottom", targetSide: "top" }
  } else if (degrees >= 157.5 || degrees < -157.5) {
    // Gauche
    return { sourceSide: "left", targetSide: "right" }
  } else if (degrees >= -157.5 && degrees < -112.5) {
    // Haut-gauche
    return { sourceSide: "top", targetSide: "bottom" }
  } else if (degrees >= -112.5 && degrees < -67.5) {
    // Haut
    return { sourceSide: "top", targetSide: "bottom" }
  } else {
    // Haut-droite
    return { sourceSide: "top", targetSide: "bottom" }
  }
}

/**
 * Calcule le décalage d'une arête pour éviter les chevauchements
 * Amélioration : distribution plus naturelle et adaptative
 */
export function calculateEdgeOffset(
  edgeIndex: number,
  totalEdges: number,
  baseOffset: number = 18,
  levelMultiplier: number = 10
): number {
  if (totalEdges <= 1) return 0

  // Pour de nombreuses arêtes, utiliser une distribution en éventail
  if (totalEdges > 6) {
    // Centrer les edges autour de 0
    const halfEdges = (totalEdges - 1) / 2
    const relativePosition = edgeIndex - halfEdges

    // Distribution non-linéaire pour une meilleure répartition
    const scaleFactor = Math.max(0.7, 1 - totalEdges * 0.02)
    return relativePosition * (baseOffset * scaleFactor)
  }

  // Pour peu d'arêtes, utiliser l'ancienne méthode alternée améliorée
  const laneSide = edgeIndex % 2 === 0 ? 1 : -1
  const laneLevel = Math.floor(edgeIndex / 2)

  // Réduire légèrement l'offset pour plus de compacité
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
