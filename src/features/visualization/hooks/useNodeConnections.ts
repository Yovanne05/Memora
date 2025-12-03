import { useMemo } from "react"
import type {
  CollectionVisualization,
  NodeConnectionsMap,
} from "../types/visualization.type"
import { calculateNodeConnections } from "../lib/nodeConnections"

export function useNodeConnections(
  data?: CollectionVisualization
): NodeConnectionsMap {
  return useMemo<NodeConnectionsMap>(() => {
    if (!data) return {}
    return calculateNodeConnections(data)
  }, [data])
}
