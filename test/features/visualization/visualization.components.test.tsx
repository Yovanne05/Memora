import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { VisualizationHeader } from "@/features/visualization/components/VisualizationHeader"
import { VisualizationLegend } from "@/features/visualization/components/VisualizationLegend"
import { LoadingState } from "@/features/visualization/components/VisualizationSkeleton"
import { VisualizationCollectionsList } from "@/features/visualization/components/VisualizationCollectionsList"
import { CustomNode } from "@/features/visualization/components/CustomNode"
import { OrphanNotesZone } from "@/features/visualization/components/OrphanNotesZone"
import { NodeContent } from "@/features/visualization/components/NodeContent"
import { NodeHandle } from "@/features/visualization/components/NodeHandle"
import { NODE_COLORS } from "@/features/visualization/lib/visualization.constants"
import type { Collection } from "@/features/collections/models/collection.model"
import { Position, type NodeProps } from "reactflow"

vi.mock("@/features/collections/components/list/CollectionCard", () => ({
  CollectionCard: ({ collection, onCardClick }: { collection: Collection; onCardClick: (c: Collection) => void }) => (
    <button onClick={() => onCardClick(collection)} aria-label={`card-${collection.id}`}>
      {collection.name}
    </button>
  ),
}))

vi.mock("reactflow", () => ({
  Position: { Top: "top", Right: "right", Bottom: "bottom", Left: "left" },
  Handle: (props: any) => <div data-testid={`handle-${props.id}`} {...props} />,
}))

describe("Visualization components", () => {
  test("VisualizationHeader affiche les compteurs et onBack", async () => {
    const onBack = vi.fn()
    render(<VisualizationHeader notesCount={3} connectionsCount={5} onBack={onBack} />)

    await userEvent.click(screen.getByRole("button", { name: /Retour aux collections/ }))
    expect(onBack).toHaveBeenCalled()
    expect(screen.getByLabelText(/3 notes/)).toBeInTheDocument()
    expect(screen.getByLabelText(/5 connexions/)).toBeInTheDocument()
  })

  test("VisualizationLegend liste les niveaux de legende", () => {
    render(<VisualizationLegend />)
    expect(screen.getAllByText(/connexion/i).length).toBeGreaterThan(0)
  })

  test("LoadingState rend le message", () => {
    render(<LoadingState message="Chargement test" />)
    expect(screen.getByText(/Chargement test/)).toBeInTheDocument()
  })
  test("LoadingState affiche le message par defaut et les placeholders", () => {
    const { container } = render(<LoadingState />)
    expect(screen.getByText("Chargement...")).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(20)
  })

  test("VisualizationCollectionsList affiche vide ou carte selectionnee", async () => {
    const collections: Collection[] = [
      {
        id: "c1",
        ownerId: "o1",
        name: "Col 1",
        description: "",
        visibility: "public",
        tags: [],
        notes: [],
        nodes: [],
        edges: [],
        createdAt: "",
        updatedAt: "",
      },
    ]

    const { rerender } = render(
      <VisualizationCollectionsList collections={[]} selectedId={undefined} onSelect={vi.fn()} />
    )
    expect(screen.getByText(/Aucune collection/)).toBeInTheDocument()

    const onSelect = vi.fn()
    rerender(
      <VisualizationCollectionsList collections={collections} selectedId="c1" onSelect={onSelect} />
    )
    await userEvent.click(screen.getByLabelText("card-c1"))
    expect(onSelect).toHaveBeenCalledWith(collections[0])
  })

  test("CustomNode affiche le contenu et les handles", () => {
    const props = {
      id: "node-1",
      data: { title: "Titre", connections: 2 },
    } as unknown as NodeProps<{ title: string; connections: number }>

    render(<CustomNode {...props} />)
    expect(screen.getByRole("article", { name: /Titre/ })).toBeInTheDocument()
    expect(screen.getAllByLabelText(/connexions/)[0]).toBeInTheDocument()
    expect(screen.getAllByTestId(/handle-/)).toHaveLength(8)
  })

  test("OrphanNotesZone liste les orphelins et declenche onSelect", async () => {
    const collection: Collection = {
      id: "c1",
      ownerId: "owner",
      name: "Test",
      description: "",
      visibility: "public",
      tags: [],
      notes: [],
      createdAt: "",
      updatedAt: "",
      nodes: [
        { id: "n1", data: { label: "N1", note_id: "n1", title: "N1", tags: [] } },
        { id: "n2", data: { label: "N2", note_id: "n2", title: "N2", tags: [] } },
      ],
      edges: [],
    }
    const onSelect = vi.fn()
    render(<OrphanNotesZone collection={collection} orphanNodeIds={new Set(["n2"])} onSelect={onSelect} />)

    await userEvent.click(screen.getByRole("button", { name: /N2/ }))
    expect(onSelect).toHaveBeenCalledWith("n2")
  })

  test("OrphanNotesZone ne rend rien sans orphelins", () => {
    const collection: Collection = {
      id: "c1",
      ownerId: "owner",
      name: "Test",
      description: "",
      visibility: "public",
      tags: [],
      notes: [],
      createdAt: "",
      updatedAt: "",
      nodes: [],
      edges: [],
    }
    const { container } = render(<OrphanNotesZone collection={collection} orphanNodeIds={new Set()} />)
    expect(container.firstChild).toBeNull()
  })

  test("OrphanNotesZone gere la navigation clavier", () => {
    const collection: Collection = {
      id: "c1",
      ownerId: "owner",
      name: "Test",
      description: "",
      visibility: "public",
      tags: [],
      notes: [],
      createdAt: "",
      updatedAt: "",
      nodes: [
        { id: "n1", data: { label: "N1", note_id: "n1", title: "N1", tags: [] } },
        { id: "n2", data: { label: "N2", note_id: "n2", title: "N2", tags: [] } },
      ],
      edges: [],
    }
    const onSelect = vi.fn()
    render(<OrphanNotesZone collection={collection} orphanNodeIds={new Set(["n2"])} onSelect={onSelect} />)

    const orphanButton = screen.getByRole("button", { name: /N2/ })
    fireEvent.keyDown(orphanButton, { key: "Enter" })
    fireEvent.keyDown(orphanButton, { key: " " })
    expect(onSelect).toHaveBeenCalledTimes(2)
  })

  test("NodeContent affiche le titre, la couleur et la pluralisation", () => {
    const { container, rerender } = render(<NodeContent title="Note 1" connections={1} />)

    expect(screen.getByRole("heading", { name: "Note 1" })).toBeInTheDocument()
    expect(screen.getByLabelText("1 connexion")).toHaveTextContent("1 connexion")

    const indicator = container.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(indicator).toHaveStyle({ backgroundColor: NODE_COLORS.DEFAULT })

    rerender(<NodeContent title="Note 1" connections={2} />)
    expect(screen.getByLabelText("2 connexions")).toBeInTheDocument()
  })

  test("NodeHandle expose les deux handles avec id et position", () => {
    render(<NodeHandle position={Position.Left as any} side="left" />)

    const source = screen.getByTestId("handle-left-source")
    const target = screen.getByTestId("handle-left-target")

    expect(source).toHaveAttribute("type", "source")
    expect(target).toHaveAttribute("type", "target")
    expect(source).toHaveAttribute("position", "left")
    expect(target).toHaveAttribute("position", "left")
  })
})
