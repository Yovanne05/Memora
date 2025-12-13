import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CollectionVisualizationView } from "@/features/visualization/components/CollectionVisualizationView"
import type { CollectionVisualization } from "@/features/visualization/types/visualization.type"
import type { Note } from "@/features/notes/models/note.model"
import type { ReactFlowNode, ReactFlowEdge } from "@/features/visualization/types/visualization.type"

interface OrphanNotesZoneProps {
  orphanNodeIds: Set<string>
  onSelect?: (id: string) => void
}

interface VisualizationHeaderProps {
  notesCount: number
  connectionsCount: number
}

interface NoteSidebarProps {
  open: boolean
  onClose: () => void
  relatedNotes: Note[]
}

interface ReactFlowProps {
  nodes: ReactFlowNode[]
  edges: ReactFlowEdge[]
  onNodeClick?: (event: React.MouseEvent, node: ReactFlowNode) => void
  onPaneClick?: (event: React.MouseEvent) => void
}

const mockUseCollectionVisualizationQuery = vi.hoisted(() => vi.fn())
const mockUseVisualizationLayout = vi.hoisted(() => vi.fn())
const mockUseNodeSelection = vi.hoisted(() => vi.fn())
const mockUseNoteSidebar = vi.hoisted(() => vi.fn())
const mockUseRelatedNotes = vi.hoisted(() => vi.fn())
const mockUseNoteQuery = vi.hoisted(() => vi.fn())

vi.mock("@/features/visualization/hooks/useCollectionVisualizationQuery", () => ({
  useCollectionVisualizationQuery: (...args: unknown[]) => mockUseCollectionVisualizationQuery(...args),
}))

vi.mock("@/features/visualization/hooks/useVisualizationLayout", () => ({
  useVisualizationLayout: (...args: unknown[]) => mockUseVisualizationLayout(...args),
}))

vi.mock("@/features/visualization/hooks/useNodeSelection", () => ({
  useNodeSelection: (...args: unknown[]) => mockUseNodeSelection(...args),
}))

vi.mock("@/features/visualization/hooks/useNoteSidebar", () => ({
  useNoteSidebar: () => mockUseNoteSidebar(),
}))

vi.mock("@/features/visualization/hooks/useRelatedNotes", () => ({
  useRelatedNotes: (...args: unknown[]) => mockUseRelatedNotes(...args),
}))

vi.mock("@/features/notes/hooks/useNoteQuery", () => ({
  useNoteQuery: (...args: unknown[]) => mockUseNoteQuery(...args),
}))

vi.mock("@/components/ui/empty-state", () => ({
  EmptyState: ({ message }: { message: string }) => <div data-testid="empty-state">{message}</div>,
}))

vi.mock("@/components/ui/error-state", () => ({
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
}))

vi.mock("@/features/visualization/components/VisualizationSkeleton", () => ({
  LoadingState: ({ message }: { message: string }) => <div data-testid="loading-state">{message}</div>,
}))

vi.mock("@/features/visualization/components/OrphanNotesZone", () => ({
  OrphanNotesZone: ({ orphanNodeIds, onSelect }: any) => (
    <button data-testid="orphan-zone" onClick={() => onSelect?.("orphan-click")}>
      {`Orphelins: ${orphanNodeIds.size}`}
    </button>
  ),
}))

vi.mock("@/features/visualization/components/VisualizationLegend", () => ({
  VisualizationLegend: () => <div data-testid="legend" />,
}))

vi.mock("@/features/visualization/components/VisualizationHeader", () => ({
  VisualizationHeader: ({ notesCount, connectionsCount }: any) => (
    <div data-testid="header">{`${notesCount}-${connectionsCount}`}</div>
  ),
}))

vi.mock("@/features/notes/components/NoteSidebar", () => ({
  NoteSidebar: ({ open, onClose, relatedNotes }: any) => (
    <div data-testid="note-sidebar">
      {open ? "open" : "closed"}
      <button onClick={onClose}>close</button>
      <span>{relatedNotes.length}</span>
    </div>
  ),
}))

vi.mock("reactflow", () => ({
  __esModule: true,
  default: ({ nodes, edges, onNodeClick, onPaneClick }: any) => (
    <div data-testid="reactflow" onClick={() => onPaneClick?.({} as any)}>
      <div data-testid="nodes-count">{nodes.length}</div>
      <div data-testid="edges-count">{edges.length}</div>
      {nodes.map((node: any) => (
        <button key={node.id} onClick={(e) => onNodeClick?.(e, node)}>
          {node.id}
        </button>
      ))}
    </div>
  ),
  Background: () => null,
  Controls: () => null,
  MiniMap: () => null,
  Position: { Top: "top", Right: "right", Bottom: "bottom", Left: "left" },
}))

const sampleData: CollectionVisualization = {
  collectionId: "c1",
  nodes: [
    { id: "n1", title: "N1" },
    { id: "orphan", title: "Orphan" },
  ],
  edges: [{ sourceId: "n1", targetId: "orphan" }],
}

describe("CollectionVisualizationView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseNoteSidebar.mockReturnValue({
      isOpen: false,
      activeNoteId: null,
      openWithNote: vi.fn(),
      close: vi.fn(),
    })
    mockUseRelatedNotes.mockReturnValue([])
    mockUseNoteQuery.mockReturnValue({ data: null })
    mockUseVisualizationLayout.mockReturnValue({
      nodes: [],
      edges: [],
      orphanNodeIds: new Set(),
    })
    mockUseNodeSelection.mockReturnValue({
      selectedNodeId: null,
      styledNodes: [],
      styledEdges: [],
      selectNode: vi.fn(),
      clearSelection: vi.fn(),
    })
  })

  test("affiche l'état vide sans collectionId", () => {
    mockUseCollectionVisualizationQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false })
    const { getByTestId } = render(<CollectionVisualizationView collectionId={undefined} />)
    expect(getByTestId("empty-state")).toBeInTheDocument()
  })

  test("affiche le chargement puis l'erreur", () => {
    mockUseCollectionVisualizationQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    const { rerender } = render(<CollectionVisualizationView collectionId="c1" />)
    expect(screen.getByTestId("loading-state")).toBeInTheDocument()

    mockUseCollectionVisualizationQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    rerender(<CollectionVisualizationView collectionId="c1" />)
    expect(screen.getByTestId("error-state")).toBeInTheDocument()
  })

  test("affiche la visualisation avec nodes/edges et interactions", async () => {
    const selectNode = vi.fn()
    const clearSelection = vi.fn()
    const sidebar = {
      isOpen: false,
      activeNoteId: null,
      openWithNote: vi.fn(),
      close: vi.fn(),
    }

    mockUseNoteSidebar.mockReturnValue(sidebar)
    mockUseCollectionVisualizationQuery.mockReturnValue({ data: sampleData, isLoading: false, isError: false })
    mockUseVisualizationLayout.mockReturnValue({
      nodes: [{ id: "n1" }],
      edges: [{ id: "e1", source: "n1", target: "orphan" }],
      orphanNodeIds: new Set(["orphan"]),
    })
    mockUseNodeSelection.mockReturnValue({
      selectedNodeId: null,
      styledNodes: [{ id: "n1", data: { title: "N1", connections: 1 } }],
      styledEdges: [{ id: "e1", source: "n1", target: "orphan" }],
      selectNode,
      clearSelection,
    })

    render(<CollectionVisualizationView collectionId="c1" onBack={vi.fn()} />)

    expect(screen.getByTestId("header")).toHaveTextContent("1-1")
    expect(screen.getByTestId("legend")).toBeInTheDocument()
    expect(screen.getByTestId("orphan-zone")).toHaveTextContent("1")
    expect(screen.getByTestId("note-sidebar")).toHaveTextContent("closed")

    await userEvent.click(screen.getByText("n1"))
    expect(selectNode).toHaveBeenCalledWith("n1")
    expect(sidebar.openWithNote).toHaveBeenCalledWith("n1")

    await userEvent.click(screen.getByTestId("reactflow"))
    expect(clearSelection).toHaveBeenCalled()
    expect(sidebar.close).toHaveBeenCalled()
  })
})
