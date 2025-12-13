import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
} from "d3-force"
import type { LayoutEdge, LayoutNode, NodePosition } from "./types"
import { detectClusters, analyzeClusters } from "./clustering"
import {
  type ForceLayoutConfig,
  type ForceLayoutNode,
  DEFAULT_FORCE_CONFIG,
  calculateForceParameters,
} from "./forceConfig"
import { calculateClusterStrength } from "./clusterForces"
import { runSimulation } from "./simulationPhases"

interface ForceLayoutLink extends SimulationLinkDatum<ForceLayoutNode> {
  source: string
  target: string
}

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

  const forceParams = calculateForceParameters(nodes.length, edges.length)
  const iterations = config.iterations ?? forceParams.iterations
  const initialPositions = config.initialPositions ?? {}
  const nodeToCluster = detectClusters(nodes, edges)
  const clusters = analyzeClusters(edges, nodeToCluster)

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

  const clusterStrength = calculateClusterStrength(clusters.length, nodes.length)

  runSimulation(
    simulation,
    simulationNodes,
    nodeToCluster,
    clusterStrength,
    iterations
  )

  const positions: Record<string, NodePosition> = {}
  simulationNodes.forEach((node) => {
    positions[node.id] = {
      x: node.x ?? 0,
      y: node.y ?? 0,
    }
  })

  return positions
}
