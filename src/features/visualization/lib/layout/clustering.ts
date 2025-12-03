import type { LayoutNode, LayoutEdge, AdjacencyList } from "./types"

export interface Cluster {
  id: number
  nodeIds: string[]
  connections: number // Nombre de connexions internes au cluster
}

/**
 * Détecte les clusters/communautés dans le graphe pour mieux grouper les notes connectées
 * Utilise un algorithme de propagation de labels simplifié
 */
export function detectClusters(
  nodes: LayoutNode[],
  edges: LayoutEdge[]
): Map<string, number> {
  if (nodes.length === 0) {
    return new Map()
  }

  // Construire la liste d'adjacence
  const adjacency = buildAdjacencyList(nodes, edges)

  // Initialiser chaque nœud avec son propre cluster
  const nodeToCluster = new Map<string, number>()
  nodes.forEach((node, index) => {
    nodeToCluster.set(node.id, index)
  })

  // Propager les labels pendant plusieurs itérations
  const maxIterations = 10
  let hasChanged = true
  let iteration = 0

  while (hasChanged && iteration < maxIterations) {
    hasChanged = false
    iteration++

    // Parcourir les nœuds dans un ordre aléatoire pour éviter les biais
    const shuffledNodes = [...nodes].sort(() => Math.random() - 0.5)

    for (const node of shuffledNodes) {
      const neighbors = adjacency[node.id] || []
      if (neighbors.length === 0) continue

      // Compter la fréquence de chaque cluster parmi les voisins
      const clusterCounts = new Map<number, number>()
      neighbors.forEach((neighborId) => {
        const cluster = nodeToCluster.get(neighborId)
        if (cluster !== undefined) {
          clusterCounts.set(cluster, (clusterCounts.get(cluster) || 0) + 1)
        }
      })

      // Trouver le cluster le plus fréquent
      let maxCount = 0
      let bestCluster = nodeToCluster.get(node.id)!

      clusterCounts.forEach((count, cluster) => {
        if (count > maxCount) {
          maxCount = count
          bestCluster = cluster
        }
      })

      // Changer le cluster si un meilleur est trouvé
      const currentCluster = nodeToCluster.get(node.id)
      if (currentCluster !== bestCluster) {
        nodeToCluster.set(node.id, bestCluster)
        hasChanged = true
      }
    }
  }

  return nodeToCluster
}

/**
 * Construit une liste d'adjacence bidirectionnelle pour le graphe
 */
function buildAdjacencyList(
  nodes: LayoutNode[],
  edges: LayoutEdge[]
): AdjacencyList {
  const adjacency: AdjacencyList = {}

  // Initialiser tous les nœuds
  nodes.forEach((node) => {
    adjacency[node.id] = []
  })

  // Ajouter les connexions (bidirectionnelles pour le clustering)
  edges.forEach((edge) => {
    if (adjacency[edge.sourceId] && adjacency[edge.targetId]) {
      adjacency[edge.sourceId].push(edge.targetId)
      adjacency[edge.targetId].push(edge.sourceId)
    }
  })

  return adjacency
}

/**
 * Analyse les clusters détectés et retourne des informations sur leur structure
 */
export function analyzeClusters(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  nodeToCluster: Map<string, number>
): Cluster[] {
  const clusterMap = new Map<number, Cluster>()

  // Grouper les nœuds par cluster
  nodeToCluster.forEach((clusterId, nodeId) => {
    if (!clusterMap.has(clusterId)) {
      clusterMap.set(clusterId, {
        id: clusterId,
        nodeIds: [],
        connections: 0,
      })
    }
    clusterMap.get(clusterId)!.nodeIds.push(nodeId)
  })

  // Compter les connexions internes de chaque cluster
  edges.forEach((edge) => {
    const sourceCluster = nodeToCluster.get(edge.sourceId)
    const targetCluster = nodeToCluster.get(edge.targetId)

    if (
      sourceCluster !== undefined &&
      targetCluster !== undefined &&
      sourceCluster === targetCluster
    ) {
      const cluster = clusterMap.get(sourceCluster)
      if (cluster) {
        cluster.connections++
      }
    }
  })

  return Array.from(clusterMap.values())
}

/**
 * Calcule un score de modularité pour évaluer la qualité du clustering
 * Plus le score est élevé, mieux les clusters sont définis
 */
export function calculateModularity(
  edges: LayoutEdge[],
  nodeToCluster: Map<string, number>
): number {
  if (edges.length === 0) return 0

  const m = edges.length

  let internalEdges = 0
  edges.forEach((edge) => {
    const sourceCluster = nodeToCluster.get(edge.sourceId)
    const targetCluster = nodeToCluster.get(edge.targetId)
    if (sourceCluster === targetCluster) {
      internalEdges++
    }
  })

  // Modularité simplifiée
  return internalEdges / m
}
