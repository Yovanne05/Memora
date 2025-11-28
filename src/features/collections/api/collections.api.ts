import type {
  Collection,
  CollectionCreatePayload,
  CollectionUpdatePayload,
} from "../models/collection.model"
import { MOCK_COLLECTIONS } from "../__mocks__/collections.mock"

const BASE_URL =
  import.meta.env.VITE_API_URL?.toString().replace(/\/$/, "") ??
  "http://localhost:5000"

function generateMockId() {
  return `mock-${Math.random().toString(36).slice(2, 11)}`
}

function cloneMockCollections() {
  return [...MOCK_COLLECTIONS]
}

// API Functions
export async function fetchCollections(): Promise<Collection[]> {
  try {
    const res = await fetch(`${BASE_URL}/collections`, {
      credentials: "include",
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const data = (await res.json()) as Collection[]
    return data
  } catch (error) {
    console.warn("[collections] fetchCollections failed, using mocks:", error)
    return cloneMockCollections()
  }
}

export async function fetchCollectionById(
  id: string
): Promise<Collection | null> {
  try {
    const res = await fetch(`${BASE_URL}/collections/${id}`, {
      credentials: "include",
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const data = (await res.json()) as Collection
    return data
  } catch (error) {
    console.warn("[collections] fetchCollectionById failed, using mocks:", error)
    return cloneMockCollections().find((c) => c.id === id) ?? null
  }
}

export async function createCollection(
  payload: CollectionCreatePayload
): Promise<Collection> {
  try {
    const res = await fetch(`${BASE_URL}/collections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const data = (await res.json()) as Collection
    return data
  } catch (error) {
    console.warn("[collections] createCollection failed, using mock:", error)

    const now = new Date().toISOString()
    const mock: Collection = {
      id: generateMockId(),
      ownerId: "user-1", // On force un owner fixe dans les mocks
      name: payload.name,
      description: payload.description ?? "",
      visibility: payload.visibility ?? "private",
      createdAt: now,
      updatedAt: now,
      notesCount: 0,
      collaboratorsCount: 0,
    }

    MOCK_COLLECTIONS.push(mock)
    return mock
  }
}

export async function updateCollection(
  id: string,
  payload: CollectionUpdatePayload
): Promise<Collection> {
  try {
    const res = await fetch(`${BASE_URL}/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const data = (await res.json()) as Collection
    return data
  } catch (error) {
    console.warn("[collections] updateCollection failed, using mock:", error)

    const idx = MOCK_COLLECTIONS.findIndex((c) => c.id === id)
    if (idx === -1) {
      throw new Error("Collection not found in mocks")
    }

    const now = new Date().toISOString()
    const updated: Collection = {
      ...MOCK_COLLECTIONS[idx],
      ...payload,
      updatedAt: now,
    }

    MOCK_COLLECTIONS[idx] = updated
    return updated
  }
}

export async function deleteCollection(id: string): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/collections/${id}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
  } catch (error) {
    console.warn("[collections] deleteCollection failed, using mock:", error)

    const idx = MOCK_COLLECTIONS.findIndex((c) => c.id === id)
    if (idx !== -1) {
      MOCK_COLLECTIONS.splice(idx, 1)
    }
  }
}
