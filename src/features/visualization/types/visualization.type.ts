import type { Node, Edge } from "reactflow"
import type { CustomNodeData } from "../components/CustomNode"

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