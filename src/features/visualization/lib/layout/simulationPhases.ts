import type { Simulation } from "d3-force"
import type { ForceLayoutNode } from "./forceConfig"
import {
  calculateClusterCenters,
  createClusterForce,
} from "./clusterForces"

export function runFirstPhase(
  simulation: Simulation<ForceLayoutNode, undefined>,
  iterations: number
): void {
  simulation.stop()
  const firstPhase = Math.floor(iterations * 0.6)
  for (let i = 0; i < firstPhase; i += 1) {
    simulation.tick()
  }
}

export function runClusteringPhase(
  simulation: Simulation<ForceLayoutNode, undefined>,
  simulationNodes: ForceLayoutNode[],
  nodeToCluster: Map<string, number>,
  clusterStrength: number,
  totalIterations: number,
  firstPhaseIterations: number
): void {
  const clusterCenters = calculateClusterCenters(simulationNodes, nodeToCluster)
  const clusterForce = createClusterForce(
    simulationNodes,
    nodeToCluster,
    clusterCenters,
    clusterStrength
  )
  simulation.force("cluster", clusterForce)

  const secondPhase = totalIterations - firstPhaseIterations
  for (let i = 0; i < secondPhase; i += 1) {
    if (i % 20 === 0) {
      const updatedCenters = calculateClusterCenters(
        simulationNodes,
        nodeToCluster
      )
      simulation.force(
        "cluster",
        createClusterForce(
          simulationNodes,
          nodeToCluster,
          updatedCenters,
          clusterStrength
        )
      )
    }
    simulation.tick()
  }
}

export function runRemainingPhase(
  simulation: Simulation<ForceLayoutNode, undefined>,
  totalIterations: number,
  firstPhaseIterations: number
): void {
  const remaining = totalIterations - firstPhaseIterations
  for (let i = 0; i < remaining; i += 1) {
    simulation.tick()
  }
}
