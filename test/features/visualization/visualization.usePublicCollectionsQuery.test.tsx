import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { usePublicCollectionsQuery } from "@/features/visualization/hooks/usePublicCollectionsQuery"
import type { Collection } from "@/features/collections/models/collection.model"
import { vi } from "vitest"
import type { ReactNode } from "react"

const visualizationServiceMock = vi.hoisted(() => ({
  listPublicCollections: vi.fn(),
}))

vi.mock("@/features/visualization/services/visualization.service", () => ({
  visualizationService: visualizationServiceMock,
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const sample: Collection[] = [
  {
    id: "c1",
    ownerId: "o1",
    name: "Publique",
    description: "desc",
    visibility: "public",
    tags: [],
    nodes: [],
    edges: [],
    notes: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
]

describe("usePublicCollectionsQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("récupère les collections publiques", async () => {
    visualizationServiceMock.listPublicCollections.mockResolvedValueOnce(sample)

    const { result } = renderHook(() => usePublicCollectionsQuery(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.data).toEqual(sample)
    })

    expect(visualizationServiceMock.listPublicCollections).toHaveBeenCalledTimes(1)
  })
})
