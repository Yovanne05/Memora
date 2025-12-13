import { applyCollectionsQuery, type CollectionsQuery } from "@/features/collections/lib/collections-query"
import type { Collection } from "@/features/collections/models/collection.model"

const makeCollection = (overrides: Partial<Collection>): Collection => ({
  id: "id-" + Math.random().toString(16).slice(2),
  ownerId: "owner-1",
  name: "Base",
  description: "Base description",
  visibility: "private",
  notes: [],
  tags: [],
  nodes: [],
  edges: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
  ...overrides,
})

const baseQuery: CollectionsQuery = {
  tab: "mine",
  search: "",
  sort: "recent",
  currentUserId: "owner-1",
}

describe("applyCollectionsQuery", () => {
  const collections: Collection[] = [
    makeCollection({
      id: "mine-private",
      ownerId: "owner-1",
      name: "Zeta",
      description: "Premiere",
      visibility: "private",
      notes: [{ id: "n1", collectionId: "mine-private", ownerId: "owner-1", title: "A", content: "", visibility: "private", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-03T00:00:00.000Z" }],
      updatedAt: "2024-01-03T00:00:00.000Z",
    }),
    makeCollection({
      id: "shared-public",
      ownerId: "other",
      name: "Alpha",
      description: "Seconde",
      visibility: "public",
      notes: [
        { id: "n2", collectionId: "shared-public", ownerId: "other", title: "B", content: "", visibility: "public", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
        { id: "n3", collectionId: "shared-public", ownerId: "other", title: "C", content: "", visibility: "public", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-02T00:00:00.000Z" },
      ],
      updatedAt: "2024-01-04T00:00:00.000Z",
    }),
    makeCollection({
      id: "mine-public",
      ownerId: "owner-1",
      name: "Beta",
      description: "Contient recherche",
      visibility: "public",
      notes: [],
      updatedAt: "2023-12-01T00:00:00.000Z",
    }),
  ]

  test("filtre par onglet mine/shared", () => {
    const mine = applyCollectionsQuery(collections, baseQuery)
    expect(mine.every((c) => c.ownerId === "owner-1")).toBe(true)

    const shared = applyCollectionsQuery(collections, { ...baseQuery, tab: "shared" })
    expect(shared.every((c) => c.ownerId !== "owner-1")).toBe(true)
  })

  test("filtre par recherche et visibilite", () => {
    const result = applyCollectionsQuery(collections, {
      ...baseQuery,
      search: "recherche",
      visibilityFilter: "public",
    })

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("mine-public")
  })

  test("filtre par nombre de notes", () => {
    const result = applyCollectionsQuery(collections, {
      ...baseQuery,
      tab: "shared",
      minNotes: 2,
    })

    expect(result.map((c) => c.id)).toEqual(["shared-public"])

    const limited = applyCollectionsQuery(collections, {
      ...baseQuery,
      maxNotes: 1,
    })
    expect(limited.some((c) => c.id === "shared-public")).toBe(false)
  })

  test("trie par ordre alphabetique, nombre de notes et recence", () => {
    const alphabetical = applyCollectionsQuery(collections, {
      ...baseQuery,
      tab: "shared",
      sort: "alphabetical",
    })
    expect(alphabetical.map((c) => c.name)).toEqual(["Alpha"])

    const notesCount = applyCollectionsQuery(collections, {
      ...baseQuery,
      sort: "notes-count",
      tab: "mine",
    })
    expect(notesCount[0].id).toBe("mine-private")

    const recent = applyCollectionsQuery(collections, {
      ...baseQuery,
      tab: "mine",
      sort: "recent",
    })
    expect(recent[0].id).toBe("mine-private")
  })
})
