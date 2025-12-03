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
  iterations: 250,
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

  const { width, height, iterations } = {
    ...DEFAULT_FORCE_CONFIG,
    ...config,
  }

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
    .distance(200)
    .strength(0.5)

  const simulation = forceSimulation(simulationNodes)
    .force("link", linkForce)
    .force("charge", forceManyBody().strength(-450))
    .force("collide", forceCollide().radius(110))
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
