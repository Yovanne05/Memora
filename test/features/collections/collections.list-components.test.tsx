import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import { CollectionCard } from "@/features/collections/components/CollectionCard"
import { CollectionsGrid } from "@/features/collections/components/CollectionsGrid"
import type { Collection } from "@/features/collections/models/collection.model"

const navigate = vi.fn()
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ navigate }),
}))

vi.mock("@/features/collections/hooks/useToggleCollectionFavoriteMutation", () => ({
  useToggleCollectionFavoriteMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

const collection: Collection = {
  id: "col-1",
  ownerId: "owner",
  name: "Title",
  description: "Description",
  visibility: "private",
  notes: [],
  tags: [],
  nodes: [],
  edges: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
}

describe("Collections list components", () => {
  test("CollectionCard calls onCardClick", async () => {
    const onCardClick = vi.fn()

    render(<CollectionCard collection={collection} onCardClick={onCardClick} />)

    await userEvent.click(screen.getByText("Title"))
    expect(onCardClick).toHaveBeenCalledWith(collection)
  })

  test("CollectionCard toggles selection in selection mode", async () => {
    const onToggleSelection = vi.fn()

    render(
      <CollectionCard
        collection={collection}
        selectionMode
        isSelected={false}
        onToggleSelection={onToggleSelection}
      />
    )

    await userEvent.click(screen.getByText("Title"))
    expect(onToggleSelection).toHaveBeenCalledWith("col-1")
  })

  test("CollectionsGrid renders collection cards", () => {
    render(
      <CollectionsGrid
        items={[collection, { ...collection, id: "col-2", name: "Second" }]}
      />
    )

    expect(screen.getByText("Title")).toBeInTheDocument()
    expect(screen.getByText("Second")).toBeInTheDocument()
  })
})
