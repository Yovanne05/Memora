export interface VisualizationNode {
  id: string;
  title: string;
}

export interface VisualizationEdge {
  sourceId: string;
  targetId: string;
}

export interface CollectionVisualization {
  collectionId: string;
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
}

/**
 * Statistiques d'un nœud dans le graphe de visualisation
 */
export interface NodeStats {
  id: string;
  connections: number;
}

/**
 * Calcul des connexions pour chaque nœud
 */
export type NodeConnectionsMap = Record<string, number>;

/**
 * Props pour les états de chargement de la visualisation
 */
export interface VisualizationState {
  isLoading: boolean;
  isError: boolean;
  data?: CollectionVisualization;
}