import { useMemo } from "react"
import type { CollectionVisualization } from "../types/visualization.type"
import type { NodePosition } from "../lib/layout/types"
import {
  calculateLayeredLayout,
  calculateForceDirectedLayout,
  refineLayeredPositions,
} from "../lib/layoutEngine"
import {
  shouldApplyForceLayout,
  calculateCanvasDimensions,
} from "../lib/layoutStrategy"

export function useNodePositions(
  data?: CollectionVisualization
): Record<string, NodePosition> {
  return useMemo<Record<string, NodePosition>>(() => {
    if (!data) return {}

    const layeredPositions = calculateLayeredLayout(data.nodes, data.edges)

    const refinedPositions = refineLayeredPositions(
      data.nodes,
      data.edges,
      layeredPositions
    )

    if (shouldApplyForceLayout(data)) {
      const dimensions = calculateCanvasDimensions(data.nodes.length)
      return calculateForceDirectedLayout(data.nodes, data.edges, {
        width: dimensions.width,
        height: dimensions.height,
        initialPositions: refinedPositions,
      })
    }

    return refinedPositions
  }, [data])
}
