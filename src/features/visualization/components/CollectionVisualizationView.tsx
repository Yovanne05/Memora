import { useCallback, useMemo } from "react"
import type { MouseEvent } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"
import { useCollectionVisualizationQuery } from "../hook/useCollectionVisualizationQuery"

interface CollectionVisualizationViewProps {
  collectionId?: string
}

type CustomNodeData = {
  title: string
  connections: number
}

// Composant pour un nœud personnalisé
const CustomNode = ({ data }: NodeProps<CustomNodeData>) => {
  const connections = data.connections ?? 0

  return (
    <div className="group relative px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-blue-400 hover:border-blue-600 transition-colors">
      {/* Handle d'entrée (gauche) */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2! h-2! bg-blue-500! opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* Handle de sortie (droite) */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2! h-2! bg-blue-500! opacity-0 group-hover:opacity-100 transition-opacity"
      />

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <div className="text-sm font-semibold text-gray-800">{data.title}</div>
      </div>

      <div className="text-xs text-gray-500 mt-1">
        {connections} connexion{connections > 1 ? "s" : ""}
      </div>
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

// Layout circulaire
function calculateCircleLayout(nodeCount: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  if (nodeCount === 0) return positions

  const radius = Math.max(150, nodeCount * 40)
  const angleStep = (2 * Math.PI) / nodeCount

  for (let i = 0; i < nodeCount; i++) {
    const angle = i * angleStep - Math.PI / 2 // commence en haut
    positions.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    })
  }

  return positions
}

export function CollectionVisualizationView({ collectionId }: CollectionVisualizationViewProps) {
  const { data, isLoading, isError } = useCollectionVisualizationQuery(collectionId)

  //nombre de connexions par nœud
  const nodeConnections = useMemo(() => {
    if (!data) return {} as Record<string, number>

    const connections: Record<string, number> = {}
    data.nodes.forEach((node) => {
      connections[node.id] = 0
    })
    data.edges.forEach((edge) => {
      connections[edge.sourceId] = (connections[edge.sourceId] || 0) + 1
      connections[edge.targetId] = (connections[edge.targetId] || 0) + 1
    })
    return connections
  }, [data])

  // nœuds React Flow
  const nodes: Node<CustomNodeData>[] = useMemo(() => {
    if (!data) return []

    const positions = calculateCircleLayout(data.nodes.length)

    return data.nodes.map((node, index) => ({
      id: node.id,
      type: "custom",
      position: positions[index] || { x: 0, y: 0 },
      data: {
        title: node.title,
        connections: nodeConnections[node.id] ?? 0,
      },
    }))
  }, [data, nodeConnections])

  // arêtes React Flow
  const edges: Edge[] = useMemo(() => {
    if (!data) return []

    return data.edges.map((edge, index) => ({
      id: `e${edge.sourceId}-${edge.targetId}-${index}`,
      source: edge.sourceId,
      target: edge.targetId,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#3b82f6", strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#3b82f6",
      },
    }))
  }, [data])

  const onNodeClick = useCallback(
    (_event: MouseEvent, node: Node<CustomNodeData>) => {
      console.log("Note sélectionnée:", node)
    },
    [],
  )

  //UI

  if (!collectionId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Sélectionnez une collection à gauche pour afficher la visualisation.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Chargement de la visualisation...</p>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-destructive">
        Erreur lors du chargement de la visualisation.
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* En-tête */}
      <div className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Visualisation des Notes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.nodes.length} notes • {data.edges.length} connexions
            </p>
          </div>
        </div>
      </div>

      {/* Graphe */}
      <div className="flex-1 relative min-h-[400px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          className="bg-muted/30"
          nodesDraggable={true}
          nodesConnectable={false}
        >
          <Background gap={16} />
          <Controls className="border rounded-lg shadow-lg" />
          <MiniMap
            className="border rounded-lg shadow-lg"
            nodeColor={(node) => {
              const connections = (node.data as CustomNodeData | undefined)?.connections ?? 0
              if (connections > 3) return "#3b82f6"
              if (connections > 1) return "#60a5fa"
              return "#93c5fd"
            }}
          />
        </ReactFlow>
      </div>

      {/* Légende */}
      <div className="border-t bg-background px-4 py-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-600" />
            <span className="text-muted-foreground">3+ connexions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-400" />
            <span className="text-muted-foreground">2-3 connexions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-200" />
            <span className="text-muted-foreground">0-1 connexion</span>
          </div>
        </div>
      </div>
    </div>
  )
}
