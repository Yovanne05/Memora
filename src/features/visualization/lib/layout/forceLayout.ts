import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force"
import type { LayoutEdge, LayoutNode, NodePosition } from "./types"
import { detectClusters, analyzeClusters } from "./clustering"

interface ForceLayoutConfig {
  width?: number
  height?: number
  iterations?: number
  initialPositions?: Record<string, NodePosition>
}

interface ForceLayoutNode extends SimulationNodeDatum {
  id: string
  x: number
  y: number
}

interface ForceLayoutLink extends SimulationLinkDatum<ForceLayoutNode> {
  source: string
  target: string
}

const DEFAULT_FORCE_CONFIG: Required<
  Omit<ForceLayoutConfig, "initialPositions">
> = {
  width: 1000,
  height: 800,
  iterations: 300,
}

/**
 * Calcule les paramètres adaptatifs du force layout en fonction de la taille du graphe
 */
function calculateForceParameters(nodeCount: number, edgeCount: number) {
  // Nombre d'itérations adaptatif : plus de nœuds = plus d'itérations
  const iterations = Math.min(800, Math.max(400, nodeCount * 10 + edgeCount * 3))

  // Distance entre les nœuds : réduite pour un meilleur groupement
  const linkDistance = nodeCount > 30 ? 120 + Math.log10(nodeCount) * 20 : 150

  // Force de liaison : plus forte pour garder les notes connectées ensemble
  const linkStrength = nodeCount > 30 ? 0.6 : 0.8

  // Force de répulsion : équilibrée pour éviter les chevauchements sans trop disperser
  const chargeStrength = -Math.min(500, 300 + nodeCount * 2)

  // Rayon de collision : légèrement adaptatif
  const collideRadius = nodeCount > 50 ? 90 : 105

  return {
    iterations,
    linkDistance,
    linkStrength,
    chargeStrength,
    collideRadius,
  }
}

/**
 * Force personnalisée pour attirer les nœuds du même cluster
 */
function createClusterForce(
  simulationNodes: ForceLayoutNode[],
  nodeToCluster: Map<string, number>,
  clusterCenters: Map<number, { x: number; y: number }>,
  strength: number
) {
  return function force(alpha: number) {
    simulationNodes.forEach((node) => {
      const clusterId = nodeToCluster.get(node.id)
      if (clusterId === undefined) return

      const center = clusterCenters.get(clusterId)
      if (!center) return

      // Attirer vers le centre du cluster
      const dx = center.x - (node.x ?? 0)
      const dy = center.y - (node.y ?? 0)

      node.vx = (node.vx ?? 0) + dx * strength * alpha
      node.vy = (node.vy ?? 0) + dy * strength * alpha
    })
  }
}

/**
 * Calcule les centres de masse de chaque cluster
 */
function calculateClusterCenters(
  nodes: ForceLayoutNode[],
  nodeToCluster: Map<string, number>
): Map<number, { x: number; y: number }> {
  const clusterSums = new Map<number, { x: number; y: number; count: number }>()

  nodes.forEach((node) => {
    const clusterId = nodeToCluster.get(node.id)
    if (clusterId === undefined) return

    const current = clusterSums.get(clusterId) || { x: 0, y: 0, count: 0 }
    current.x += node.x ?? 0
    current.y += node.y ?? 0
    current.count++
    clusterSums.set(clusterId, current)
  })

  const centers = new Map<number, { x: number; y: number }>()
  clusterSums.forEach((sum, clusterId) => {
    if (sum.count > 0) {
      centers.set(clusterId, {
        x: sum.x / sum.count,
        y: sum.y / sum.count,
      })
    }
  })

  return centers
}

/**
 * Répartit les nœuds avec un layout de type "force-directed" amélioré avec clustering
 * pour mieux grouper les notes connectées et éviter le désordre.
 */
export function calculateForceDirectedLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  config: ForceLayoutConfig = {}
): Record<string, NodePosition> {
  if (!nodes.length) {
    return {}
  }

  const { width, height } = {
    ...DEFAULT_FORCE_CONFIG,
    ...config,
  }

  // Calculer les paramètres adaptatifs selon la taille du graphe
  const forceParams = calculateForceParameters(nodes.length, edges.length)
  const iterations = config.iterations ?? forceParams.iterations

  const initialPositions = config.initialPositions ?? {}

  // Détecter les clusters pour mieux grouper les notes connectées
  const nodeToCluster = detectClusters(nodes, edges)
  const clusters = analyzeClusters(nodes, edges, nodeToCluster)

  const simulationNodes: ForceLayoutNode[] = nodes.map((node, index) => {
    const fallbackAngle = (index / Math.max(nodes.length, 1)) * Math.PI * 2
    const fallbackRadius = Math.min(width, height) / 3

    const initial = initialPositions[node.id]
    return {
      id: node.id,
      x: initial?.x ?? Math.cos(fallbackAngle) * fallbackRadius,
      y: initial?.y ?? Math.sin(fallbackAngle) * fallbackRadius,
    }
  })

  const simulationLinks: ForceLayoutLink[] = edges.map((edge) => ({
    source: edge.sourceId,
    target: edge.targetId,
  }))

  const linkForce = forceLink<ForceLayoutNode, ForceLayoutLink>(
    simulationLinks
  )
    .id((node) => node.id)
    .distance(forceParams.linkDistance)
    .strength(forceParams.linkStrength)

  const simulation = forceSimulation(simulationNodes)
    .force("link", linkForce)
    .force("charge", forceManyBody().strength(forceParams.chargeStrength))
    .force("collide", forceCollide().radius(forceParams.collideRadius).strength(0.9))
    .force("center", forceCenter(0, 0))

  // Exécuter une première phase de simulation
  simulation.stop()
  const firstPhase = Math.floor(iterations * 0.6)
  for (let i = 0; i < firstPhase; i += 1) {
    simulation.tick()
  }

  // Ajouter une force de clustering pour mieux grouper les notes liées
  // Calculer la force de clustering selon le nombre de clusters
  const clusterStrength = clusters.length > 1 && clusters.length < nodes.length
    ? Math.min(0.15, 0.08 + clusters.length * 0.01)
    : 0

  if (clusterStrength > 0) {
    const clusterCenters = calculateClusterCenters(simulationNodes, nodeToCluster)
    const clusterForce = createClusterForce(simulationNodes, nodeToCluster, clusterCenters, clusterStrength)
    simulation.force("cluster", clusterForce)

    // Deuxième phase avec force de clustering
    const secondPhase = iterations - firstPhase
    for (let i = 0; i < secondPhase; i += 1) {
      // Recalculer les centres périodiquement
      if (i % 20 === 0) {
        const updatedCenters = calculateClusterCenters(simulationNodes, nodeToCluster)
        simulation.force(
          "cluster",
          createClusterForce(simulationNodes, nodeToCluster, updatedCenters, clusterStrength)
        )
      }
      simulation.tick()
    }
  } else {
    // Continuer sans clustering si non applicable
    const remaining = iterations - firstPhase
    for (let i = 0; i < remaining; i += 1) {
      simulation.tick()
    }
  }

  const positions: Record<string, NodePosition> = {}
  simulationNodes.forEach((node) => {
    positions[node.id] = {
      x: node.x ?? 0,
      y: node.y ?? 0,
    }
  })

  return positions
}
