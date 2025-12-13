import type { Node, Edge } from "reactflow"
export interface CustomNodeData {
  title: string
  connections: number
}

export type HandleSide = "top" | "right" | "bottom" | "left"
export type HandleType = "source" | "target"
export type NodeConnectionsMap = Record<string, number>
export type ReactFlowNode = Node<CustomNodeData>
export type ReactFlowEdge = Edge