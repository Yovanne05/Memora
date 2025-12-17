import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { useCollectionDelete } from "@/features/collections/hooks/useCollectionDelete";
import type { Collection } from "@/features/collections/models/collection.model";
import React from "react";

const mockCollectionsService = vi.hoisted(() => ({
  remove: vi.fn(),
}));

vi.mock("@/features/collections/services/collections.service", () => ({
  collectionsService: mockCollectionsService,
}));

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("useCollectionDelete", () => {
  let queryClient: QueryClient;

  const collection: Collection = {
    id: "col-1",
    ownerId: "owner",
    name: "To Delete",
    description: "Will be deleted",
    visibility: "private",
    tags: [],
    notes: [],
    nodes: [],
    edges: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  test("l'état initial est vide", () => {
    const { result } = renderHook(() => useCollectionDelete(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.target).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("open définit la collection cible", () => {
    const { result } = renderHook(() => useCollectionDelete(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.open(collection);
    });

    expect(result.current.target).toEqual(collection);
  });

  test("confirm supprime la collection", async () => {
    mockCollectionsService.remove.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCollectionDelete(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.open(collection);
    });

    await act(async () => {
      await result.current.confirm();
    });

    expect(mockCollectionsService.remove).toHaveBeenCalledWith("col-1");

    await waitFor(() => {
      expect(result.current.target).toBeNull();
    });
  });

  test("close réinitialise target et error", async () => {
    const { result } = renderHook(() => useCollectionDelete(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.open(collection);
    });

    expect(result.current.target).toEqual(collection);

    act(() => {
      result.current.close();
    });

    expect(result.current.target).toBeNull();
  });

  test("loading est vrai pendant la suppression", async () => {
    mockCollectionsService.remove.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(undefined), 100))
    );

    const { result } = renderHook(() => useCollectionDelete(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.open(collection);
    });

    let confirmPromise: Promise<void>;
    act(() => {
      confirmPromise = result.current.confirm();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await act(async () => {
      await confirmPromise;
    });

    expect(result.current.loading).toBe(false);
  });

  test("error est défini en cas d'échec", async () => {
    const error = new Error("Delete failed");
    mockCollectionsService.remove.mockRejectedValue(error);

    const { result } = renderHook(() => useCollectionDelete(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.open(collection);
    });

    await act(async () => {
      await result.current.confirm().catch(() => {});
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
