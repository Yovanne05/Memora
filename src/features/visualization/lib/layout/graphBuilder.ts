import type {
  LayoutNode,
  LayoutEdge,
  GraphStructure,
  DegreeMap,
  AdjacencyList,
} from "./types"

export function validateEdges(
  edges: LayoutEdge[],
  nodeIds: Set<string>
): LayoutEdge[] {
  return edges.filter((edge) => {
    const isValid = nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId)

    if (!isValid) {
      console.warn(
        `Arete ignorée car elle reference un noeud inconnu: ${edge.sourceId} -> ${edge.targetId}`
      )
    }

    return isValid
  })
}

export function buildGraphStructure(
  nodes: LayoutNode[],
  edges: LayoutEdge[]
): GraphStructure {
  const inDegree: DegreeMap = {}
  const outAdj: AdjacencyList = {}

  nodes.forEach((node) => {
    inDegree[node.id] = 0
    outAdj[node.id] = []
  })

  edges.forEach((edge) => {
    outAdj[edge.sourceId].push(edge.targetId)
    inDegree[edge.targetId]++
  })

  return { inDegree, outAdj }
}

export function findOrphanNodes(
  nodes: LayoutNode[],
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
