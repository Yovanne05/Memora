import type { Simulation } from "d3-force"
import type { ForceLayoutNode } from "./forceConfig"
import {
  calculateClusterCenters,
  createClusterForce,
} from "./clusterForces"

export function runSimulation(
  simulation: Simulation<ForceLayoutNode, undefined>,
  simulationNodes: ForceLayoutNode[],
  nodeToCluster: Map<string, number>,
  clusterStrength: number,
  iterations: number
): void {
  simulation.stop()

  const firstPhaseIterations = Math.floor(iterations * 0.6)
  for (let i = 0; i < firstPhaseIterations; i += 1) {
    simulation.tick()
  }

  if (clusterStrength <= 0) {
    const remaining = iterations - firstPhaseIterations
    for (let i = 0; i < remaining; i += 1) {
      simulation.tick()
    }
    return
  }

  const clusterCenters = calculateClusterCenters(simulationNodes, nodeToCluster)
  const clusterForce = createClusterForce(
    simulationNodes,
    nodeToCluster,
    clusterCenters,
    clusterStrength
  )
  simulation.force("cluster", clusterForce)

  const secondPhase = iterations - firstPhaseIterations
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
