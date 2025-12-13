import { useMemo } from "react"
import type { NodeConnectionsMap } from "../types/visualization.type"
import type { Collection } from "@/features/collections/models/collection.model"
import { calculateNodeConnections } from "../lib/nodeConnections"

export function useNodeConnections(
  collection?: Collection
): NodeConnectionsMap {
  return useMemo<NodeConnectionsMap>(() => {
    if (!collection) return {}
    return calculateNodeConnections(collection.nodes, collection.edges)
  }, [collection])
}
