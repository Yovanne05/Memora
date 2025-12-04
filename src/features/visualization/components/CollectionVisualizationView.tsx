import { useCallback, useEffect, useMemo, useState } from "react"
import type { MouseEvent } from "react"
import ReactFlow, { Background, Controls, MiniMap, type Node } from "reactflow"
import "reactflow/dist/style.css"
import { useCollectionVisualizationQuery } from "../hooks/useCollectionVisualizationQuery"
import { useVisualizationLayout } from "../hooks/useVisualizationLayout"
import { CustomNode, type CustomNodeData } from "./CustomNode"
import { VisualizationHeader } from "./VisualizationHeader"
import { VisualizationLegend } from "./VisualizationLegend"
import { OrphanNotesZone } from "./OrphanNotesZone"
import { getNodeColorByConnections } from "../constants/visualization.constants"
import { getNodeColorForMiniMap } from "../lib/dataTransformers"
import { EmptyState } from "./EmptyState"
import { LoadingState } from "./LoadingState"
import { ErrorState } from "./ErrorState"
import { useNodeSelection } from "../hooks/useNodeSelection"
import { NoteSidebar } from "../../notes/components/NoteSidebar"
import { useNoteQuery } from "../../notes/hooks/useNoteQuery"
import type { Note } from "../../notes/models/note.model"

interface CollectionVisualizationViewProps {
  collectionId?: string
  onBack?: () => void
}

const nodeTypes = {
  custom: CustomNode,
}

export function CollectionVisualizationView({
  collectionId,
  onBack,
}: CollectionVisualizationViewProps) {
  const { data, isLoading, isError } =
    useCollectionVisualizationQuery(collectionId)

  const { nodes, edges, orphanNodeIds } = useVisualizationLayout(data)
  const { selectedNodeId, styledNodes, styledEdges, selectNode, clearSelection } = useNodeSelection(
    nodes,
    edges
  )

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const { data: selectedNote } = useNoteQuery(activeNodeId ?? "")

  // Get related notes (notes connected to the selected note via edges)
  const relatedNotes = useMemo(() => {
    if (!activeNodeId || !data) return []

    const connectedNodeIds = new Set<string>()
    data.edges.forEach((edge) => {
      if (edge.sourceId === activeNodeId) {
        connectedNodeIds.add(edge.targetId)
      } else if (edge.targetId === activeNodeId) {
        connectedNodeIds.add(edge.sourceId)
      }
    })

    // Return the connected nodes with their basic info
    return data.nodes
      .filter((node) => connectedNodeIds.has(node.id))
      .map((node) => ({
        id: node.id,
        title: node.title,
        content: "",
        visibility: "private" as const,
        ownerId: "",
        collectionId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Note))
  }, [activeNodeId, data])

  const memoizedNodeTypes = useMemo(() => nodeTypes, [])

  const onNodeClick = useCallback(
    (_event: MouseEvent, node: Node<CustomNodeData>) => {
      if (selectedNodeId !== node.id) {
        selectNode(node.id)
      }
      setActiveNodeId(node.id)
      setSidebarOpen(true)
    },
    [selectNode, selectedNodeId]
  )

  const onPaneClick = useCallback(() => {
    clearSelection()
    setSidebarOpen(false)
    setActiveNodeId(null)
  }, [clearSelection])

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false)
    clearSelection()
    setActiveNodeId(null)
  }, [clearSelection])

  const handleRelatedNoteClick = useCallback(
    (noteId: string) => {
      if (selectedNodeId !== noteId) {
        selectNode(noteId)
      }
      setActiveNodeId(noteId)
      setSidebarOpen(true)
    },
    [selectNode, selectedNodeId]
  )

  const handleOrphanNoteClick = useCallback(
    (noteId: string) => {
      clearSelection()
      setActiveNodeId(noteId)
      setSidebarOpen(true)
    },
    [clearSelection]
  )

  const getMiniMapNodeColor = useCallback(
    (node: Node) => getNodeColorForMiniMap(node, getNodeColorByConnections),
    []
  )

  useEffect(() => {
    if (selectedNodeId) {
      setActiveNodeId(selectedNodeId)
      return
    }

    if (!selectedNodeId && activeNodeId && !orphanNodeIds.has(activeNodeId)) {
      setActiveNodeId(null)
    }
  }, [selectedNodeId, activeNodeId, orphanNodeIds])

  if (!collectionId) {
    return (
      <EmptyState message="Sélectionnez une collection à gauche pour afficher la visualisation." />
    )
  }

  if (isLoading) {
    return <LoadingState message="Chargement de la visualisation..." />
  }

  if (isError || !data) {
    return <ErrorState message="Erreur lors du chargement de la visualisation." />
  }

  const connectedNotesCount = data.nodes.length - orphanNodeIds.size

  return (
    <div className="flex h-full w-full flex-col">
      <VisualizationHeader
        notesCount={connectedNotesCount}
        connectionsCount={data.edges.length}
        onBack={onBack}
      />

      <div className="relative min-h-[400px] flex-1">
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          nodeTypes={memoizedNodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          className="bg-muted/30"
          nodesDraggable={true}
          nodesConnectable={false}
        >
          <Background gap={16} />
          <Controls className="rounded-lg border shadow-lg" />
          <MiniMap
            className="rounded-lg border shadow-lg"
            nodeColor={getMiniMapNodeColor}
          />
        </ReactFlow>
      </div>

      <VisualizationLegend />

      {data && (
        <OrphanNotesZone
          data={data}
          orphanNodeIds={orphanNodeIds}
          onSelect={handleOrphanNoteClick}
        />
      )}

      <NoteSidebar
        note={selectedNote ?? null}
        open={sidebarOpen}
        onClose={handleSidebarClose}
        relatedNotes={relatedNotes}
        onNoteClick={handleRelatedNoteClick}
      />
    </div>
  )
}
