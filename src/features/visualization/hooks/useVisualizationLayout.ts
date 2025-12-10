import type { NodeConnectionsMap, ReactFlowNode, ReactFlowEdge } from "../types/visualization.type"
import type { Collection } from "@/features/collections/models/collection.model"
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
 * Plusieurs sous-hooks pour:
 * - Calculer les connexions de chaque nœud
 * - Déterminer les positions optimales
 * - Transformer les données en format ReactFlow
 *
 * @param collection - Collection contenant les nœuds et les arêtes
 * @returns Nœuds et arêtes formatés pour React Flow avec leurs positions
 */
export function useVisualizationLayout(
  collection?: Collection
): UseVisualizationLayoutResult {
  const nodeConnections = useNodeConnections(collection)

  const { positions, orphanNodeIds } = useNodePositions(collection)

  const nodes = useReactFlowNodes(collection, positions, nodeConnections, orphanNodeIds)

  const edges = useReactFlowEdges(collection, nodes)

  return {
    nodes,
    edges,
    nodeConnections,
    orphanNodeIds,
  }
}
