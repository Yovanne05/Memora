import { useCallback, useMemo, useState } from 'react'
import type { ReactFlowEdge, ReactFlowNode } from '../types/visualization.type'

const CONNECTED_EDGE_OPACITY = 1
const DIMMED_EDGE_OPACITY = 0.15
const DIMMED_NODE_OPACITY = 0.35

interface UseEdgeLabelFilterResult {
  selectedLabel: string | null
  availableLabels: string[]
  styledNodes: ReactFlowNode[]
  styledEdges: ReactFlowEdge[]
  selectLabel: (label: string | null) => void
  clearFilter: () => void
}

export function useEdgeLabelFilter(
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[]
): UseEdgeLabelFilterResult {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)

  const availableLabels = useMemo(() => {
    const labels = new Set<string>()
    edges.forEach((edge) => {
      const label = edge.data?.label
      if (label && typeof label === 'string' && label.length > 0) {
        labels.add(label)
      }
    })
    return Array.from(labels).sort()
  }, [edges])

  const selectLabel = useCallback((label: string | null) => {
    setSelectedLabel(label)
  }, [])

  const clearFilter = useCallback(() => {
    setSelectedLabel(null)
  }, [])

  const connectedNodeIds = useMemo(() => {
    if (!selectedLabel) return null

    const connected = new Set<string>()
    edges.forEach((edge) => {
      if (edge.data?.label === selectedLabel) {
        connected.add(edge.source)
        connected.add(edge.target)
      }
    })

    return connected
  }, [edges, selectedLabel])

  const styledEdges = useMemo(() => {
    if (!selectedLabel) return edges

    return edges.map((edge) => {
      const isSelected = edge.data?.label === selectedLabel
      const baseStyle = edge.style ?? {}

      return {
        ...edge,
        style: {
          ...baseStyle,
          opacity: isSelected ? CONNECTED_EDGE_OPACITY : DIMMED_EDGE_OPACITY,
        },
      }
    })
  }, [edges, selectedLabel])

  const styledNodes = useMemo(() => {
    if (!selectedLabel) return nodes

    return nodes.map((node) => {
      const baseStyle = node.style ?? {}
      const isRelated = connectedNodeIds?.has(node.id) ?? false

      return {
        ...node,
        style: {
          ...baseStyle,
          opacity: isRelated ? 1 : DIMMED_NODE_OPACITY,
        },
      }
    })
  }, [nodes, selectedLabel, connectedNodeIds])

  return {
    selectedLabel,
    availableLabels,
    styledNodes,
    styledEdges,
    selectLabel,
    clearFilter,
  }
}
