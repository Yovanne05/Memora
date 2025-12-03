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
): { positions: Record<string, NodePosition>; orphanNodeIds: Set<string> } {
  return useMemo(() => {
    if (!data)
      return { positions: {}, orphanNodeIds: new Set<string>() }

    const { positions: layeredPositions, orphanNodes } = calculateLayeredLayout(
      data.nodes,
      data.edges
    )

    const refinedPositions = refineLayeredPositions(
      data.nodes.filter((node) => !orphanNodes.has(node.id)),
      data.edges,
      layeredPositions
    )

    if (shouldApplyForceLayout(data)) {
      const dimensions = calculateCanvasDimensions(
        data.nodes.length - orphanNodes.size
      )
      const forcePositions = calculateForceDirectedLayout(
        data.nodes.filter((node) => !orphanNodes.has(node.id)),
        data.edges,
        {
          width: dimensions.width,
          height: dimensions.height,
          initialPositions: refinedPositions,
        }
      )
      return { positions: forcePositions, orphanNodeIds: orphanNodes }
    }

    return { positions: refinedPositions, orphanNodeIds: orphanNodes }
  }, [data])
}
