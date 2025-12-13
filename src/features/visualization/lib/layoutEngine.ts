import type {
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
export type { NodePosition, LayoutConfig } from "./layout/types"
export type { EdgeGroup } from "./layout/types"
export {
  determineConnectionDirection,
  calculateEdgeOffset,
  groupEdgesByConnection,
} from "./layout/edgeManager"
export { calculateForceDirectedLayout } from "./layout/forceLayout"
export { refineLayeredPositions } from "./layout/positionRefiner"
import type { GraphEdge, GraphNode } from "@/features/collections/models/collection.model"

export function calculateLayeredLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  config: LayoutConfig = {}
): { positions: Record<string, NodePosition>; orphanNodes: Set<string> } {
  const { verticalGap, horizontalGap } = { ...DEFAULT_LAYOUT_CONFIG, ...config }

  if (!nodes.length) return { positions: {}, orphanNodes: new Set() }

  const nodeIds = new Set(nodes.map((node) => node.id))
  const validEdges = validateEdges(edges, nodeIds)

  const { inDegree, outAdj } = buildGraphStructure(nodes, validEdges)

  const orphanNodes = findOrphanNodes(nodes, inDegree, outAdj)

  const connectedNodes = nodes.filter((node) => !orphanNodes.has(node.id))

  const levels: NodeLevels = {}
  const queue = initializeQueue(connectedNodes, inDegree, new Set(), levels)
  propagateLevels(queue, outAdj, levels)
  assignRemainingLevels(connectedNodes, levels, new Set())

  const nodesByLevel = groupNodesByLevel(levels)
  const positions = calculatePositions(nodesByLevel, verticalGap, horizontalGap)

  return { positions, orphanNodes }
}
