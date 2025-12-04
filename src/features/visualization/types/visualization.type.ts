import type { Node, Edge } from "reactflow"
import type { CustomNodeData } from "../components/CustomNode"

export interface VisualizationNode {
  id: string
  title: string
}

export interface VisualizationEdge {
  sourceId: string
  targetId: string
}

export interface CollectionVisualization {
  collectionId: string
  nodes: VisualizationNode[]
  edges: VisualizationEdge[]
}


export type NodeConnectionsMap = Record<string, number>
export type ReactFlowNode = Node<CustomNodeData>
export type ReactFlowEdge = Edge

export interface VisualizationComponentProps {
  collectionId?: string
}

export interface VisualizationLayoutState {
  nodes: ReactFlowNode[]
  edges: ReactFlowEdge[]
  orphanNodeIds: Set<string>
}