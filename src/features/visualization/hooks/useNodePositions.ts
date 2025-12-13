import { useMemo } from "react"
import type { Collection } from "@/features/collections/models/collection.model"
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
  collection?: Collection
): { positions: Record<string, NodePosition>; orphanNodeIds: Set<string> } {
  return useMemo(() => {
    if (!collection)
      return { positions: {}, orphanNodeIds: new Set<string>() }

    const { positions: layeredPositions, orphanNodes } = calculateLayeredLayout(
      collection.nodes,
      collection.edges
    )

    const connectedNodes = collection.nodes.filter((node) => !orphanNodes.has(node.id))

    const refinedPositions = refineLayeredPositions(
      connectedNodes,
      collection.edges,
      layeredPositions
    )

    if (shouldApplyForceLayout({ nodes: collection.nodes, edges: collection.edges })) {
      const dimensions = calculateCanvasDimensions(
        collection.nodes.length - orphanNodes.size
      )
      const forcePositions = calculateForceDirectedLayout(
        connectedNodes,
        collection.edges,
        {
          width: dimensions.width,
          height: dimensions.height,
          initialPositions: refinedPositions,
        }
      )
      return { positions: forcePositions, orphanNodeIds: orphanNodes }
    }

    return { positions: refinedPositions, orphanNodeIds: orphanNodes }
  }, [collection])
}
