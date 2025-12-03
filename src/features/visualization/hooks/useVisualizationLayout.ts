import type {
  CollectionVisualization,
  NodeConnectionsMap,
  ReactFlowNode,
  ReactFlowEdge,
} from "../types/visualization.type"
import { useNodeConnections } from "./useNodeConnections"
import { useNodePositions } from "./useNodePositions"
import { useReactFlowNodes } from "./useReactFlowNodes"
import { useReactFlowEdges } from "./useReactFlowEdges"

interface UseVisualizationLayoutResult {
  nodes: ReactFlowNode[]
  edges: ReactFlowEdge[]
  nodeConnections: NodeConnectionsMap
  orphanNodeIds: Set<string>
}

/**
 * Hook principal pour calculer le layout complet de la visualisation
 *
 * Ce hook orchestre plusieurs sous-hooks pour:
 * - Calculer les connexions de chaque nœud
 * - Déterminer les positions optimales
 * - Transformer les données en format ReactFlow
 *
 * @param data - Données de visualisation contenant les nœuds et les arêtes
 * @returns Nœuds et arêtes formatés pour React Flow avec leurs positions
 */
export function useVisualizationLayout(
  data?: CollectionVisualization
): UseVisualizationLayoutResult {
  const nodeConnections = useNodeConnections(data)

  const { positions, orphanNodeIds } = useNodePositions(data)

  const nodes = useReactFlowNodes(data, positions, nodeConnections, orphanNodeIds)

  const edges = useReactFlowEdges(data, nodes)

  return {
    nodes,
    edges,
    nodeConnections,
    orphanNodeIds,
  }
}
