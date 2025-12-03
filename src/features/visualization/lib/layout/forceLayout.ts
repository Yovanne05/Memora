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
  const iterations = Math.min(600, Math.max(300, nodeCount * 8 + edgeCount * 2))

  // Distance entre les nœuds : augmente avec la taille du graphe
  const linkDistance = nodeCount > 30 ? 150 + Math.log10(nodeCount) * 30 : 200

  // Force de liaison : plus faible pour les gros graphes pour plus de flexibilité
  const linkStrength = nodeCount > 30 ? 0.3 : 0.5

  // Force de répulsion : plus forte pour les gros graphes pour éviter les clusters
  const chargeStrength = -Math.min(600, 350 + nodeCount * 3)

  // Rayon de collision : légèrement adaptatif
  const collideRadius = nodeCount > 50 ? 95 : 110

  return {
    iterations,
    linkDistance,
    linkStrength,
    chargeStrength,
    collideRadius,
  }
}

/**
 * Répartit les nœuds avec un layout de type "force-directed"
 * pour éviter que les liens se retrouvent masqués sous les notes.
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
    .force("collide", forceCollide().radius(forceParams.collideRadius).strength(0.8))
    .force("center", forceCenter(0, 0))

  simulation.stop()
  for (let i = 0; i < iterations; i += 1) {
    simulation.tick()
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
