import type {
  Collection,
  CollectionCreatePayload,
  CollectionUpdatePayload,
} from "../models/collection.model";

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchCollections(): Promise<Collection[]> {
  const res = await fetch(`${API_URL}/collections`);

  if (!res.ok) {
    throw new Error("Erreur API");
  }

  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: Collection[] }).items;
  }

  throw new Error("Réponse collections invalide");
}

export async function fetchCollectionById(id: string): Promise<Collection> {
  const res = await fetch(`${API_URL}/collections/${id}`);

  if (res.status === 404) {
    throw new Error("Collection non trouvée");
  }

  if (!res.ok) {
    throw new Error("Erreur API");
  }

  return res.json();
}

export async function createCollection(
  payload: CollectionCreatePayload
): Promise<Collection> {
  const res = await fetch(`${API_URL}/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erreur API");
  }

  return res.json();
}

export async function updateCollection(
  id: string,
  payload: CollectionUpdatePayload
): Promise<Collection> {
  const res = await fetch(`${API_URL}/collections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erreur API");
  }

  return res.json();
}

export async function deleteCollection(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/collections/${id}`, {
    method: "DELETE",
  });

  if (res.status === 404) {
    throw new Error("Collection non trouvée");
  }

  if (!res.ok) {
    throw new Error("Erreur API");
  }
}
