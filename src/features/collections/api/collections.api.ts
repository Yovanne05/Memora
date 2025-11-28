import type {
  Collection,
  CollectionCreatePayload,
  CollectionUpdatePayload,
} from "../models/collection.model"

const API_URL = import.meta.env.VITE_API_URL

function mapCollection(raw: any): Collection {
  return {
    id: raw.id,
    ownerId: raw.owner_id ?? raw.ownerId,
    name: raw.name,
    description: raw.description ?? null,
    visibility: raw.visibility ?? "private",
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,
    notesCount: raw.notes_count ?? raw.notesCount ?? 0,
    collaboratorsCount: raw.collaborators_count ?? raw.collaboratorsCount ?? 0,
  }
}

function mapCollectionList(payload: any): Collection[] {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : null

  if (!items) {
    throw new Error("Invalid collections response")
  }

  return items.map(mapCollection)
}

export async function fetchCollections(): Promise<Collection[]> {
  const res = await fetch(`${API_URL}/collections`)

  if (!res.ok) {
    throw new Error("Erreur API")
  }

  const data = await res.json()
  return mapCollectionList(data)
}

export async function fetchCollectionById(id: string): Promise<Collection> {
  const res = await fetch(`${API_URL}/collections/${id}`)

  if (res.status === 404) {
    throw new Error("Collection not found")
  }

  if (!res.ok) {
    throw new Error("Erreur API")
  }

  const data = await res.json()
  return mapCollection(data)
}

export async function createCollection(
  payload: CollectionCreatePayload
): Promise<Collection> {
  const body = {
    name: payload.name,
    description: payload.description,
    visibility: payload.visibility,
    owner_id: payload.ownerId,
  }

  const res = await fetch(`${API_URL}/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error("Erreur API")
  }

  const data = await res.json()
  return mapCollection(data)
}

export async function updateCollection(
  id: string,
  payload: CollectionUpdatePayload
): Promise<Collection> {
  const res = await fetch(`${API_URL}/collections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error("Erreur API")
  }

  const data = await res.json()
  return mapCollection(data)
}

export async function deleteCollection(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/collections/${id}`, {
    method: "DELETE",
  })

  if (res.status === 404) {
    throw new Error("Collection not found")
  }

  if (!res.ok) {
    throw new Error("Erreur API")
  }
}
