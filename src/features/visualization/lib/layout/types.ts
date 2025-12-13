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
  sourceSide: "top" | "bottom" | "left" | "right"
  targetSide: "top" | "bottom" | "left" | "right"
  edgeIndices: number[]
}

export const DEFAULT_LAYOUT_CONFIG: Required<LayoutConfig> = {
  verticalGap: 150,
  horizontalGap: 220,
}
