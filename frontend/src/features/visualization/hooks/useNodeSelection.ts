import { useCallback, useMemo, useState } from "react"
import type { ReactFlowEdge, ReactFlowNode } from "../types/visualization.type"

const CONNECTED_EDGE_OPACITY = 1
const DIMMED_EDGE_OPACITY = 0.15
const DIMMED_NODE_OPACITY = 0.35

interface UseNodeSelectionResult {
  selectedNodeId: string | null
  styledNodes: ReactFlowNode[]
  styledEdges: ReactFlowEdge[]
  selectNode: (nodeId: string) => void
  clearSelection: () => void
}

export function useNodeSelection(
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[]
): UseNodeSelectionResult {
  const [rawSelectedNodeId, setRawSelectedNodeId] = useState<string | null>(null)

  const selectNode = useCallback((nodeId: string) => {
    setRawSelectedNodeId((current) => (current === nodeId ? null : nodeId))
  }, [])

  const clearSelection = useCallback(() => {
    setRawSelectedNodeId(null)
  }, [])

  const selectedNodeId = useMemo(() => {
    if (!rawSelectedNodeId) return null
    const exists = nodes.some((node) => node.id === rawSelectedNodeId)
    return exists ? rawSelectedNodeId : null
  }, [rawSelectedNodeId, nodes])

  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return null

    const connected = new Set<string>()
    edges.forEach((edge) => {
      if (edge.source === selectedNodeId) {
        connected.add(edge.target)
      } else if (edge.target === selectedNodeId) {
        connected.add(edge.source)
      }
    })

    return connected
  }, [edges, selectedNodeId])

  const styledEdges = useMemo(() => {
    if (!selectedNodeId) return edges

    return edges.map((edge) => {
      const isConnected =
        edge.source === selectedNodeId || edge.target === selectedNodeId
      const baseStyle = edge.style ?? {}

      return {
        ...edge,
        style: {
          ...baseStyle,
          opacity: isConnected ? CONNECTED_EDGE_OPACITY : DIMMED_EDGE_OPACITY,
        },
      }
    })
  }, [edges, selectedNodeId])

  const styledNodes = useMemo(() => {
    if (!selectedNodeId) return nodes

    return nodes.map((node) => {
      const baseStyle = node.style ?? {}
      const isRelated =
        node.id === selectedNodeId ||
        (connectedNodeIds?.has(node.id) ?? false)

      return {
        ...node,
        style: {
          ...baseStyle,
          opacity: isRelated ? 1 : DIMMED_NODE_OPACITY,
        },
      }
    })
  }, [nodes, selectedNodeId, connectedNodeIds])

  return {
    selectedNodeId,
    styledNodes,
    styledEdges,
    selectNode,
    clearSelection,
  }
}
