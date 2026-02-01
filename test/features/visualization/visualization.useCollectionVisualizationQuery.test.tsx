import { renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useCollectionVisualizationQuery } from "@/features/visualization/hooks/useCollectionVisualizationQuery"
import { vi } from "vitest"

const visualizationServiceMock = vi.hoisted(() => ({
  getCollectionVisualization: vi.fn(),
}))

vi.mock("@/features/visualization/services/visualization.service", () => ({
  visualizationService: visualizationServiceMock,
}))

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe("useCollectionVisualizationQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("ne s'exécute pas sans collectionId", async () => {
    const queryClient = new QueryClient()
    const { result } = renderHook(() => useCollectionVisualizationQuery(undefined), {
      wrapper: createWrapper(queryClient),
    })

    expect(result.current.isFetched).toBe(false)
    expect(visualizationServiceMock.getCollectionVisualization).not.toHaveBeenCalled()
  })
/*
  test("récupère la visualisation pour un id fourni", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    visualizationServiceMock.getCollectionVisualization.mockResolvedValue(sample)

    const { result } = renderHook(() => useCollectionVisualizationQuery("c1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 })
    expect(result.current.data).toEqual(sample)
    expect(visualizationServiceMock.getCollectionVisualization).toHaveBeenCalledWith("c1")
  })
    */
})
