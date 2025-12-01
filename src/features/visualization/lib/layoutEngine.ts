import type {
  LayoutNode,
  LayoutEdge,
  NodePosition,
  LayoutConfig,
  NodeLevels,
} from "./layout/types"
import { DEFAULT_LAYOUT_CONFIG } from "./layout/types"
import { validateEdges, buildGraphStructure, findOrphanNodes } from "./layout/graphBuilder"
import {
  initializeQueue,
  propagateLevels,
  assignRemainingLevels,
} from "./layout/levelCalculator"
import { groupNodesByLevel, calculatePositions } from "./layout/positionCalculator"
export type { LayoutNode, LayoutEdge, NodePosition, LayoutConfig } from "./layout/types"
export type { EdgeGroup } from "./layout/types"
export {
  determineConnectionDirection,
  calculateEdgeOffset,
  groupEdgesByConnection,
} from "./layout/edgeManager"

/**
 * Calcule les positions des nœuds
 * 
 * @param nodes - Liste des nœuds à positionner
 * @param edges - Liste des connexions entre nœuds
 * @param config - Configuration des espacements
 * @returns Map des positions pour chaque nœud
 */
export function calculateLayeredLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  config: LayoutConfig = {}
): Record<string, NodePosition> {
  const { verticalGap, horizontalGap } = { ...DEFAULT_LAYOUT_CONFIG, ...config }

  if (!nodes.length) return {}

  const nodeIds = new Set(nodes.map((node) => node.id))
  const validEdges = validateEdges(edges, nodeIds)

  const { inDegree, outAdj } = buildGraphStructure(nodes, validEdges)

  const orphanNodes = findOrphanNodes(nodes, inDegree, outAdj)

  const levels: NodeLevels = {}
  const queue = initializeQueue(nodes, inDegree, orphanNodes, levels)
  propagateLevels(queue, outAdj, levels)
  assignRemainingLevels(nodes, levels, orphanNodes)

  const nodesByLevel = groupNodesByLevel(levels)
  return calculatePositions(nodesByLevel, verticalGap, horizontalGap)
}
