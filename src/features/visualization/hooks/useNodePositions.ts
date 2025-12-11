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
import { toLayoutNodes, toLayoutEdges } from "../lib/dataTransformers"

export function useNodePositions(
  collection?: Collection
): { positions: Record<string, NodePosition>; orphanNodeIds: Set<string> } {
  return useMemo(() => {
    if (!collection)
      return { positions: {}, orphanNodeIds: new Set<string>() }

    const layoutNodes = toLayoutNodes(collection.nodes)
    const layoutEdges = toLayoutEdges(collection.edges)

    const { positions: layeredPositions, orphanNodes } = calculateLayeredLayout(
      layoutNodes,
      layoutEdges
    )

    const connectedLayoutNodes = layoutNodes.filter((node) => !orphanNodes.has(node.id))

    const refinedPositions = refineLayeredPositions(
      connectedLayoutNodes,
      layoutEdges,
      layeredPositions
    )

    if (shouldApplyForceLayout({ nodes: layoutNodes, edges: layoutEdges })) {
      const dimensions = calculateCanvasDimensions(
        layoutNodes.length - orphanNodes.size
      )
      const forcePositions = calculateForceDirectedLayout(
        connectedLayoutNodes,
        layoutEdges,
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
