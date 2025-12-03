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

/**
 * Calcule un espacement adaptatif basé sur la densité du graphe
 */
function calculateAdaptiveSpacing(
  nodesByLevel: Record<number, string[]>,
  baseVerticalGap: number,
  baseHorizontalGap: number
): { verticalGap: number; horizontalGap: number } {
  const totalNodes = Object.values(nodesByLevel).reduce(
    (sum, nodes) => sum + nodes.length,
    0
  )
  const levelCount = Object.keys(nodesByLevel).length
  const maxNodesInLevel = Math.max(
    ...Object.values(nodesByLevel).map((nodes) => nodes.length)
  )

  // Pour les petits graphes, utiliser l'espacement de base
  if (totalNodes <= 10) {
    return { verticalGap: baseVerticalGap, horizontalGap: baseHorizontalGap }
  }

  // Réduire l'espacement pour les graphes denses
  let verticalMultiplier = 1
  let horizontalMultiplier = 1

  // Ajuster en fonction du nombre de niveaux
  if (levelCount > 10) {
    verticalMultiplier = Math.max(0.6, 1 - (levelCount - 10) * 0.02)
  }

  // Ajuster en fonction de la densité horizontale
  if (maxNodesInLevel > 8) {
    horizontalMultiplier = Math.max(0.65, 1 - (maxNodesInLevel - 8) * 0.025)
  }

  // Pour les très gros graphes, réduire encore plus
  if (totalNodes > 50) {
    const scaleFactor = Math.max(0.5, 1 - Math.log10(totalNodes / 50) * 0.15)
    verticalMultiplier *= scaleFactor
    horizontalMultiplier *= scaleFactor
  }

  return {
    verticalGap: Math.max(100, baseVerticalGap * verticalMultiplier),
    horizontalGap: Math.max(140, baseHorizontalGap * horizontalMultiplier),
  }
}

/**
 * Distribue les nœuds orphelins en grille compacte au lieu d'une seule ligne
 */
function distributeOrphanNodesInGrid(
  nodeIds: string[],
  baseY: number,
  horizontalGap: number,
  verticalGap: number
): Record<string, NodePosition> {
  const positions: Record<string, NodePosition> = {}

  if (nodeIds.length === 0) return positions

  // Pour peu de nœuds (≤8), garder la disposition linéaire
  if (nodeIds.length <= 8) {
    const totalWidth = (nodeIds.length - 1) * horizontalGap
    const startX = -totalWidth / 2

    nodeIds.forEach((nodeId, index) => {
      positions[nodeId] = {
        x: startX + index * horizontalGap,
        y: baseY,
      }
    })
    return positions
  }

  // Pour beaucoup de nœuds, créer une grille compacte
  const nodesPerRow = Math.ceil(Math.sqrt(nodeIds.length * 1.5))
  const totalRows = Math.ceil(nodeIds.length / nodesPerRow)

  nodeIds.forEach((nodeId, index) => {
    const row = Math.floor(index / nodesPerRow)
    const col = index % nodesPerRow
    const nodesInThisRow = Math.min(
      nodesPerRow,
      nodeIds.length - row * nodesPerRow
    )

    // Centrer chaque ligne
    const rowWidth = (nodesInThisRow - 1) * horizontalGap
    const startX = -rowWidth / 2

    positions[nodeId] = {
      x: startX + col * horizontalGap,
      y: baseY + row * (verticalGap * 0.7), // Réduire l'espacement vertical dans la grille
    }
  })

  return positions
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

  // Calculer l'espacement adaptatif
  const adaptiveSpacing = calculateAdaptiveSpacing(
    nodesByLevel,
    verticalGap,
    horizontalGap
  )
  const finalVerticalGap = adaptiveSpacing.verticalGap
  const finalHorizontalGap = adaptiveSpacing.horizontalGap

  // Identifier le dernier niveau (potentiellement des orphelins)
  const lastLevel = sortedLevels[sortedLevels.length - 1]
  const lastLevelNodes = nodesByLevel[lastLevel] || []

  sortedLevels.forEach((level) => {
    const nodeIds = nodesByLevel[level]

    // Traitement spécial pour le dernier niveau s'il contient beaucoup de nœuds orphelins
    if (
      level === lastLevel &&
      lastLevelNodes.length > 8 &&
      sortedLevels.length > 1
    ) {
      const orphanPositions = distributeOrphanNodesInGrid(
        nodeIds,
        level * finalVerticalGap,
        finalHorizontalGap,
        finalVerticalGap
      )
      Object.assign(positions, orphanPositions)
    } else {
      // Distribution normale en ligne
      const totalWidth = (nodeIds.length - 1) * finalHorizontalGap
      const startX = -totalWidth / 2

      nodeIds.forEach((nodeId, index) => {
        positions[nodeId] = {
          x: startX + index * finalHorizontalGap,
          y: level * finalVerticalGap,
        }
      })
    }
  })

  return positions
}
