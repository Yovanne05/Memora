import type { Node } from "reactflow"
import type {
  ReactFlowNode,
  ReactFlowEdge,
  NodeConnectionsMap,
  CustomNodeData,
  NodePosition,
} from "../types/visualization.type"
import type { GraphNode, GraphEdge } from "@/features/collections/models/collection.model"
import { REACT_FLOW_STYLES } from "./visualization.constants"
import {
  groupEdgesByConnection,
  calculateEdgeOffset,
} from "./layoutEngine"

export function transformNodesToReactFlow(
  nodes: GraphNode[],
  positions: Record<string, NodePosition>,
  connections: NodeConnectionsMap
): ReactFlowNode[] {
  return nodes.map((node) => {
    const position = positions[node.id] ?? { x: 0, y: 0 }

    return {
      id: node.id,
      type: "custom",
      position,
      data: {
        title: node.data.title,
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
  edges: GraphEdge[],
  validNodeIds: Set<string>
): GraphEdge[] {
  return edges.filter((edge) => {
    const isValid =
      validNodeIds.has(edge.source) && validNodeIds.has(edge.target)

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

export function transformEdgesToReactFlow(
  validEdges: GraphEdge[],
  nodePositions: Record<string, { x: number; y: number }>
): ReactFlowEdge[] {
  const edgeGroups = groupEdgesByConnection(validEdges, nodePositions)
  const reactFlowEdges: ReactFlowEdge[] = []

  edgeGroups.forEach((group) => {
    const totalEdgesInGroup = group.edgeIndices.length

    group.edgeIndices.forEach((originalEdgeIndex, localIndex) => {
      const edge = validEdges[originalEdgeIndex]
      const offset = calculateEdgeOffset(localIndex, totalEdgesInGroup)

      const edgeId =
        totalEdgesInGroup === 1
          ? `e${edge.source}-${edge.target}`
          : `e${edge.source}-${edge.target}-${localIndex}`

      reactFlowEdges.push({
        id: edgeId,
        source: edge.source,
        target: edge.target,
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
