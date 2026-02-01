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

export interface NodePosition {
  x: number
  y: number
}

export interface LayoutConfig {
  verticalGap?: number
  horizontalGap?: number
}

export type NodeLevels = Record<string, number>
export type AdjacencyList = Record<string, string[]>
export type DegreeMap = Record<string, number>

export interface GraphStructure {
  inDegree: DegreeMap
  outAdj: AdjacencyList
}

export interface EdgeGroup {
  sourceId: string
  targetId: string
  sourceSide: HandleSide
  targetSide: HandleSide
  edgeIndices: number[]
}

export const DEFAULT_LAYOUT_CONFIG: Required<LayoutConfig> = {
  verticalGap: 150,
  horizontalGap: 220,
}