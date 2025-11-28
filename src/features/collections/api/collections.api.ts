import type {
  Collection,
  CollectionCreatePayload,
  CollectionUpdatePayload,
} from "../models/collection.model"
import { dtoToCollection } from "../mappers/collection.mapper"
import type { CollectionDto, CollectionsListDto } from "../dtos/collection.dto"

const API_URL = import.meta.env.VITE_API_URL

export async function fetchCollections(): Promise<Collection[]> {
  const res = await fetch(`${API_URL}/collections`)

  if (!res.ok) {
    throw new Error("Erreur API")
  }

  const data = (await res.json()) as CollectionsListDto
  const items = Array.isArray(data) ? data : data?.items
  if (!items) {
    throw new Error("Invalid collections response")
  }
  return items.map(dtoToCollection)
}

export async function fetchCollectionById(id: string): Promise<Collection> {
  const res = await fetch(`${API_URL}/collections/${id}`)

  if (res.status === 404) {
    throw new Error("Collection not found")
  }

  if (!res.ok) {
    throw new Error("Erreur API")
  }

  const data = (await res.json()) as CollectionDto
  return dtoToCollection(data)
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

  const data = (await res.json()) as CollectionDto
  return dtoToCollection(data)
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

  const data = (await res.json()) as CollectionDto
  return dtoToCollection(data)
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
