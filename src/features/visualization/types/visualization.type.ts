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