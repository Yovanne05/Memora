import type { Node } from 'reactflow'
import type {
  ReactFlowNode,
  ReactFlowEdge,
  NodeConnectionsMap,
  CustomNodeData,
  NodePosition,
} from '../types/visualization.type'
import type {
  GraphNode,
  GraphEdge,
} from '@/features/collections/models/collection.model'
import { REACT_FLOW_STYLES } from './visualization.constants'
import { groupEdgesByConnection, calculateEdgeOffset } from './layoutEngine'
import { logger } from '@/lib/logger'

export function transformNodesToReactFlow(
  nodes: GraphNode[],
  positions: Record<string, NodePosition>,
  connections: NodeConnectionsMap
): ReactFlowNode[] {
  return nodes.map((node) => {
    const position = positions[node.id] ?? { x: 0, y: 0 }

    return {
      id: node.id,
      type: 'custom',
      position,
      data: {
        title: node.data.title,
        connections: connections[node.id] ?? 0,
      },
    }
  })
}

export function filterValidEdges(
  edges: GraphEdge[],
  validNodeIds: Set<string>
): GraphEdge[] {
  return edges.filter((edge) => {
    const isValid =
      validNodeIds.has(edge.source) && validNodeIds.has(edge.target)

    if (!isValid) {
      logger.warn(`[Visualization] Arête ignorée - nœuds manquants:`, edge)
    }

    return isValid
  })
}

export function extractNodePositions(
  nodes: ReactFlowNode[]
): Record<string, { x: number; y: number }> {
  return nodes.reduce<Record<string, { x: number; y: number }>>((acc, node) => {
    acc[node.id] = node.position
    return acc
  }, {})
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

      // ✅ on récupère le label si présent
      const edgeLabel = (edge.label ?? '').trim()

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

        // ✅ ReactFlow label
        label: edgeLabel.length > 0 ? edgeLabel : undefined,
        labelShowBg: edgeLabel.length > 0,
        labelBgPadding: [6, 3],
        labelBgBorderRadius: 6,
        labelBgStyle: { fill: 'white' },
        labelStyle: { fontSize: 12, fontWeight: 600 },
      })
    })
  })

  return reactFlowEdges
}

export function getNodeColorForMiniMap(
  node: Node,
  getColorFn: (connections: number) => string
): string {
  const connections =
    (node.data as CustomNodeData | undefined)?.connections ?? 0
  return getColorFn(connections)
}
