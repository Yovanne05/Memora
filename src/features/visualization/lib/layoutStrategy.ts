import type { CollectionVisualization } from "../types/visualization.type"

const LAYOUT_THRESHOLDS = {
  VERY_SMALL_GRAPH: 2,
  SMALL_GRAPH: 6,
  MIN_EDGES_FOR_FORCE: 2,
} as const

/**
 * Détermine si le force layout doit être appliqué pour un graphe donné
 *
 * @param data - Données de visualisation
 * @returns true si le force layout doit être utilisé
 */
export function shouldApplyForceLayout(data: CollectionVisualization): boolean {
  const totalNodes = data.nodes.length
  const totalEdges = data.edges.length

  // Ne pas utiliser force layout s'il n'y a pas d'arêtes (graphe non connecté)
  if (totalEdges === 0) {
    return false
  }

  // Pour les très petits graphes (≤2 nœuds), layout simple suffit
  if (totalNodes <= LAYOUT_THRESHOLDS.VERY_SMALL_GRAPH) {
    return false
  }

  // Pour les petits graphes (3-6 nœuds), utiliser si au moins quelques connexions
  if (totalNodes <= LAYOUT_THRESHOLDS.SMALL_GRAPH) {
    return totalEdges >= LAYOUT_THRESHOLDS.MIN_EDGES_FOR_FORCE
  }

  return true
}

export function calculateCanvasDimensions(nodeCount: number): {
  width: number
  height: number
} {
  const BASE_WIDTH = 800
  const BASE_HEIGHT = 600
  const WIDTH_PER_NODE = 160
  const HEIGHT_PER_NODE = 140

  return {
    width: Math.max(BASE_WIDTH, nodeCount * WIDTH_PER_NODE),
    height: Math.max(BASE_HEIGHT, nodeCount * HEIGHT_PER_NODE),
  }
}
