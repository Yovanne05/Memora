import type {
  GraphStructure,
  DegreeMap,
  AdjacencyList,
} from "../../types/visualization.type"
import type { GraphNode, GraphEdge } from "@/features/collections/models/collection.model"
import { logger } from "@/lib/logger"

export function validateEdges(
  edges: GraphEdge[],
  nodeIds: Set<string>
): GraphEdge[] {
  return edges.filter((edge) => {
    const isValid = nodeIds.has(edge.source) && nodeIds.has(edge.target)

    if (!isValid) {
      logger.warn(
        `Arete ignorée car elle reference un noeud inconnu: ${edge.source} -> ${edge.target}`
      )
    }

    return isValid
  })
}

export function buildAdjacencyList(
  nodes: GraphNode[],
  edges: GraphEdge[]
): AdjacencyList {
  const adjacency: AdjacencyList = {}

  nodes.forEach((node) => {
    adjacency[node.id] = []
  })

  edges.forEach((edge) => {
    if (adjacency[edge.source] && adjacency[edge.target]) {
      adjacency[edge.source].push(edge.target)
      adjacency[edge.target].push(edge.source)
    }
  })

  return adjacency
}

export function buildGraphStructure(
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphStructure {
  const inDegree: DegreeMap = {}
  const outAdj: AdjacencyList = {}

  nodes.forEach((node) => {
    inDegree[node.id] = 0
    outAdj[node.id] = []
  })

  edges.forEach((edge) => {
    outAdj[edge.source].push(edge.target)
    inDegree[edge.target]++
  })

  return { inDegree, outAdj }
}

export function findOrphanNodes(
  nodes: GraphNode[],
  inDegree: DegreeMap,
  outAdj: AdjacencyList
): Set<string> {
  const orphans = new Set<string>()

  nodes.forEach((node) => {
    const hasIncoming = inDegree[node.id] > 0
    const hasOutgoing = outAdj[node.id].length > 0

    if (!hasIncoming && !hasOutgoing) {
      orphans.add(node.id)
    }
  })

  return orphans
}
