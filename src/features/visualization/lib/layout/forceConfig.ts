import type { SimulationNodeDatum } from "d3-force"
import type { NodePosition } from "../../types/visualization.type"

export interface ForceLayoutConfig {
  width?: number
  height?: number
  iterations?: number
  initialPositions?: Record<string, NodePosition>
}

export interface ForceLayoutNode extends SimulationNodeDatum {
  id: string
  x: number
  y: number
}

export const DEFAULT_FORCE_CONFIG: Required<
  Omit<ForceLayoutConfig, "initialPositions">
> = {
  width: 1000,
  height: 800,
  iterations: 300,
}

export interface ForceParameters {
  iterations: number
  linkDistance: number
  linkStrength: number
  chargeStrength: number
  collideRadius: number
}

export function calculateForceParameters(
  nodeCount: number,
  edgeCount: number
): ForceParameters {
  const iterations = Math.min(800, Math.max(400, nodeCount * 10 + edgeCount * 3))
  const linkDistance = nodeCount > 30 ? 120 + Math.log10(nodeCount) * 20 : 150
  const linkStrength = nodeCount > 30 ? 0.6 : 0.8
  const chargeStrength = -Math.min(500, 300 + nodeCount * 2)
  const collideRadius = nodeCount > 50 ? 90 : 105
  return {
    iterations,
    linkDistance,
    linkStrength,
    chargeStrength,
    collideRadius,
  }
}
