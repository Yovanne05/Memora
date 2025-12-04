import type { Node, Edge } from "reactflow"
import type { CustomNodeData } from "../components/CustomNode"

/**
 * Représente un nœud de visualisation (note)
 */
export interface VisualizationNode {
  id: string
  title: string
}

/**
 * Représente une arête de visualisation (connexion entre deux notes)
 */
export interface VisualizationEdge {
  sourceId: string
  targetId: string
}

/**
 * Données complètes de visualisation d'une collection
 */
export interface CollectionVisualization {
  collectionId: string
  nodes: VisualizationNode[]
  edges: VisualizationEdge[]
}

/**
 * Map associant chaque ID de nœud à son nombre de connexions
 */
export type NodeConnectionsMap = Record<string, number>

/**
 * Nœud ReactFlow avec données personnalisées
 */
export type ReactFlowNode = Node<CustomNodeData>

/**
 * Arête ReactFlow
 */
export type ReactFlowEdge = Edge

/**
 * Props communes pour les composants de visualisation
 */
export interface VisualizationComponentProps {
  collectionId?: string
}

/**
 * État du layout de visualisation
 */
export interface VisualizationLayoutState {
  nodes: ReactFlowNode[]
  edges: ReactFlowEdge[]
  orphanNodeIds: Set<string>
}