import type { Node } from "reactflow"
import type {
  CollectionVisualization,
  VisualizationEdge,
  ReactFlowNode,
  ReactFlowEdge,
  NodeConnectionsMap,
} from "../types/visualization.type"
import type { CustomNodeData } from "../components/CustomNode"
import type { NodePosition } from "./layout/types"
import { REACT_FLOW_STYLES } from "../constants/visualization.constants"
import {
  groupEdgesByConnection,
  calculateEdgeOffset,
} from "./layoutEngine"

/**
 * Transforme les nœuds métier en nœuds ReactFlow avec leurs positions
 *
 * @param data - Données de visualisation
 * @param positions - Positions calculées pour chaque nœud
 * @param connections - Map des connexions de chaque nœud
 * @returns Nœuds formatés pour ReactFlow
 */
export function transformNodesToReactFlow(
  data: CollectionVisualization,
  positions: Record<string, NodePosition>,
  connections: NodeConnectionsMap
): ReactFlowNode[] {
  return data.nodes.map((node) => {
    const position = positions[node.id] ?? { x: 0, y: 0 }

    return {
      id: node.id,
      type: "custom",
      position,
      data: {
        title: node.title,
        connections: connections[node.id] ?? 0,
      },
    }
  })
}

/**
 * Filtre les arêtes invalides
 *
 * @param edges - Arêtes à filtrer
 * @param validNodeIds - Set des IDs de nœuds valides
 * @returns Arêtes valides
 */
export function filterValidEdges(
  edges: VisualizationEdge[],
  validNodeIds: Set<string>
): VisualizationEdge[] {
  return edges.filter((edge) => {
    const isValid =
      validNodeIds.has(edge.sourceId) && validNodeIds.has(edge.targetId)

    if (!isValid) {
      console.warn(
        `[Visualization] Arête ignorée - nœuds manquants:`,
        edge
      )
    }

    return isValid
  })
}

/**
 * Extrait les positions des nœuds ReactFlow
 *
 * @param nodes - Nœuds ReactFlow
 * @returns Map des positions par ID de nœud
 */
export function extractNodePositions(
  nodes: ReactFlowNode[]
): Record<string, { x: number; y: number }> {
  return nodes.reduce<Record<string, { x: number; y: number }>>(
    (acc, node) => {
      acc[node.id] = node.position
      return acc
    },
    {}
  )
}

/**
 * Transforme les arêtes métier en arêtes ReactFlow avec gestion des arêtes parallèles
 *
 * @param validEdges - Arêtes valides à transformer
 * @param nodePositions - Positions des nœuds
 * @returns Arêtes formatées pour ReactFlow
 */
export function transformEdgesToReactFlow(
  validEdges: VisualizationEdge[],
  nodePositions: Record<string, { x: number; y: number }>
): ReactFlowEdge[] {
  const edgeGroups = groupEdgesByConnection(validEdges, nodePositions)
  const reactFlowEdges: ReactFlowEdge[] = []

  edgeGroups.forEach((group) => {
    const totalEdgesInGroup = group.edgeIndices.length

    group.edgeIndices.forEach((originalEdgeIndex, localIndex) => {
      const originalEdge = validEdges[originalEdgeIndex]
      const offset = calculateEdgeOffset(localIndex, totalEdgesInGroup)

      const edgeId =
        totalEdgesInGroup === 1
          ? `e${originalEdge.sourceId}-${originalEdge.targetId}`
          : `e${originalEdge.sourceId}-${originalEdge.targetId}-${localIndex}`

      reactFlowEdges.push({
        id: edgeId,
        source: originalEdge.sourceId,
        target: originalEdge.targetId,
        sourceHandle: `${group.sourceSide}-source`,
        targetHandle: `${group.targetSide}-target`,
        style: {
          stroke: REACT_FLOW_STYLES.EDGE_COLOR,
          strokeWidth: REACT_FLOW_STYLES.EDGE_WIDTH,
        },
        data: {
          pathOptions: {
            offset,
            borderRadius: REACT_FLOW_STYLES.EDGE_BORDER_RADIUS,
          },
        },
      })
    })
  })

  return reactFlowEdges
}

/**
 * Récupère la couleur d'un nœud ReactFlow pour la MiniMap
 *
 * @param node - Nœud ReactFlow
 * @param getColorFn - Fonction de calcul de couleur basée sur les connexions
 * @returns Couleur hexadécimale
 */
export function getNodeColorForMiniMap(
  node: Node,
  getColorFn: (connections: number) => string
): string {
  const connections = (node.data as CustomNodeData | undefined)?.connections ?? 0
  return getColorFn(connections)
}
