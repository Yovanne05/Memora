import { useMemo } from "react"
import type { Node, Edge } from "reactflow"
import type { CustomNodeData } from "../components/CustomNode"
import type {
  CollectionVisualization,
  NodeConnectionsMap,
} from "../types/visualization.type"
import {
  calculateLayeredLayout,
  calculateEdgeOffset,
  calculateForceDirectedLayout,
  groupEdgesByConnection,
  refineLayeredPositions,
} from "../lib/layoutEngine"
import { REACT_FLOW_STYLES } from "../constants/visualization.constants"

interface UseVisualizationLayoutResult {
  nodes: Node<CustomNodeData>[]
  edges: Edge[]
  nodeConnections: NodeConnectionsMap
}

/**
 * Calcule les positions des nœuds, les connexions et génère les arêtes React Flow
 *
 * @param data - Données de visualisation contenant les nœuds et les arêtes
 * @returns Nœuds et arêtes formatés pour React Flow avec leurs positions
 */
export function useVisualizationLayout(
  data?: CollectionVisualization
): UseVisualizationLayoutResult {
  const nodeConnections = useMemo<NodeConnectionsMap>(() => {
    if (!data) return {}

    const connections: NodeConnectionsMap = {}

    data.nodes.forEach((node) => {
      connections[node.id] = 0
    })

    data.edges.forEach((edge) => {
      connections[edge.sourceId] = (connections[edge.sourceId] || 0) + 1
      connections[edge.targetId] = (connections[edge.targetId] || 0) + 1
    })

    return connections
  }, [data])

  const nodes = useMemo<Node<CustomNodeData>[]>(() => {
    if (!data) return []

    const layeredPositions = calculateLayeredLayout(data.nodes, data.edges)
    const refinedPositions = refineLayeredPositions(
      data.nodes,
      data.edges,
      layeredPositions
    )
    const positions =
      shouldApplyForceLayout(data)
        ? calculateForceDirectedLayout(data.nodes, data.edges, {
            width: Math.max(800, data.nodes.length * 160),
            height: Math.max(600, data.nodes.length * 140),
            initialPositions: refinedPositions,
          })
        : refinedPositions

    return data.nodes.map((node) => {
      const position = positions[node.id] ?? { x: 0, y: 0 }

      return {
        id: node.id,
        type: "custom",
        position,
        data: {
          title: node.title,
          connections: nodeConnections[node.id] ?? 0,
        },
      }
    })
  }, [data, nodeConnections])

  const edges = useMemo<Edge[]>(() => {
    if (!data || nodes.length === 0) return []

    const positions = nodes.reduce<Record<string, { x: number; y: number }>>(
      (acc, node) => {
        acc[node.id] = node.position
        return acc
      },
      {}
    )

    const validNodeIds = new Set(nodes.map((node) => node.id))
    const validEdges = data.edges.filter((edge) => {
      const isValid =
        validNodeIds.has(edge.sourceId) && validNodeIds.has(edge.targetId)

      if (!isValid) {
        console.warn("Arete ignoree", edge)
      }

      return isValid
    })

    const edgeGroups = groupEdgesByConnection(validEdges, positions)
    const reactFlowEdges: Edge[] = []

    edgeGroups.forEach((group) => {
      const totalEdgesInGroup = group.edgeIndices.length

      group.edgeIndices.forEach((originalEdgeIndex, localIndex) => {
        const originalEdge = validEdges[originalEdgeIndex]
        const offset = calculateEdgeOffset(localIndex, totalEdgesInGroup)

        reactFlowEdges.push({
          id:
            totalEdgesInGroup === 1
              ? `e${originalEdge.sourceId}-${originalEdge.targetId}`
              : `e${originalEdge.sourceId}-${originalEdge.targetId}-${localIndex}`,
          source: originalEdge.sourceId,
          target: originalEdge.targetId,
          type: "custom",
          sourceHandle: `${group.sourceSide}-source`,
          targetHandle: `${group.targetSide}-target`,
          style: {
            stroke: REACT_FLOW_STYLES.EDGE_COLOR,
            strokeWidth: REACT_FLOW_STYLES.EDGE_WIDTH
          },
          pathOptions: {
            offset,
            borderRadius: REACT_FLOW_STYLES.EDGE_BORDER_RADIUS,
          },
        })
      })
    })

    return reactFlowEdges
  }, [data, nodes])

  return {
    nodes,
    edges,
    nodeConnections,
  }
}

/**
 * Détermine si le force layout doit être appliqué pour un graphe donné
 * Le nouveau force layout avec clustering est maintenant préféré pour mieux organiser les notes
 */
function shouldApplyForceLayout(data: CollectionVisualization): boolean {
  const totalNodes = data.nodes.length
  const totalEdges = data.edges.length

  // Ne pas utiliser force layout s'il n'y a pas d'arêtes (graphe non connecté)
  if (totalEdges === 0) {
    return false
  }

  // Pour les très petits graphes (≤2 nœuds), layout simple suffit
  if (totalNodes <= 2) {
    return false
  }

  // Pour les petits graphes (3-6 nœuds), utiliser si au moins quelques connexions
  if (totalNodes <= 6) {
    return totalEdges >= 2
  }

  // Pour les graphes moyens à grands (7+ nœuds), toujours utiliser le force layout amélioré
  // car il gère mieux le clustering et l'organisation des notes connectées
  return true
}
