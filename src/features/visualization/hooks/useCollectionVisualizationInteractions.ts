import { useCallback, useEffect } from "react"
import type { MouseEvent } from "react"
import type { Edge, Node } from "reactflow"

import type { CollectionVisualization, CustomNodeData } from "../types/visualization.type"
import { useNodeSelection } from "./useNodeSelection"
import { useNoteSidebar } from "./useNoteSidebar"
import { useRelatedNotes } from "./useRelatedNotes"
import { useNoteQuery } from "@/features/notes/hooks/useNoteQuery"

type UseCollectionVisualizationInteractionsArgs = {
  nodes: Node<CustomNodeData>[]
  edges: Edge[]
  orphanNodeIds: Set<string>
  collection?: CollectionVisualization
}

export function useCollectionVisualizationInteractions({
  nodes,
  edges,
  orphanNodeIds,
  collection,
}: UseCollectionVisualizationInteractionsArgs) {
  const { selectedNodeId, styledNodes, styledEdges, selectNode, clearSelection } =
    useNodeSelection(nodes, edges)
  const sidebar = useNoteSidebar()
  const { data: selectedNote } = useNoteQuery(sidebar.activeNoteId ?? "")
  const relatedNotes = useRelatedNotes(sidebar.activeNoteId, collection)

  const handleNodeClick = useCallback(
    (_event: MouseEvent, node: Node<CustomNodeData>) => {
      if (selectedNodeId !== node.id) {
        selectNode(node.id)
      }
      sidebar.openWithNote(node.id)
    },
    [selectNode, selectedNodeId, sidebar]
  )

  const handlePaneClick = useCallback(() => {
    clearSelection()
    sidebar.close()
  }, [clearSelection, sidebar])

  const handleSidebarClose = useCallback(() => {
    clearSelection()
    sidebar.close()
  }, [clearSelection, sidebar])

  const handleRelatedNoteClick = useCallback(
    (noteId: string) => {
      if (selectedNodeId !== noteId) {
        selectNode(noteId)
      }
      sidebar.openWithNote(noteId)
    },
    [selectNode, selectedNodeId, sidebar]
  )

  const handleOrphanNoteClick = useCallback(
    (noteId: string) => {
      clearSelection()
      sidebar.openWithNote(noteId)
    },
    [clearSelection, sidebar]
  )

  useEffect(() => {
    if (selectedNodeId) {
      sidebar.openWithNote(selectedNodeId)
      return
    }

    if (!selectedNodeId && sidebar.activeNoteId && !orphanNodeIds.has(sidebar.activeNoteId)) {
      sidebar.close()
    }
  }, [selectedNodeId, sidebar, orphanNodeIds])

  return {
    styledNodes,
    styledEdges,
    selectedNote: selectedNote ?? null,
    relatedNotes,
    sidebar,
    handlers: {
      handleNodeClick,
      handlePaneClick,
      handleSidebarClose,
      handleRelatedNoteClick,
      handleOrphanNoteClick,
    },
  }
}

