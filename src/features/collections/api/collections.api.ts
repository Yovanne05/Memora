import type {
  Collection,
  CollectionCreatePayload,
  CollectionUpdatePayload,
} from "../models/collection.model";

const BASE_URL =
  import.meta.env.VITE_API_URL?.toString().replace(/\/$/, "") ??
  "http://localhost:5000";

export async function fetchCollections(): Promise<Collection[]> {
  const res = await fetch(`${BASE_URL}/collections`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = (await res.json()) as Collection[];
  return data;
}

export async function fetchCollectionById(id: string): Promise<Collection> {
  const res = await fetch(`${BASE_URL}/collections/${id}`, {
    credentials: "include",
  });

  if (res.status === 404) {
    throw new Error("Collection not found");
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = (await res.json()) as Collection;
  return data;
}

export async function createCollection(
  payload: CollectionCreatePayload
): Promise<Collection> {
  const res = await fetch(`${BASE_URL}/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = (await res.json()) as Collection;
  return data;
}

export async function updateCollection(
  id: string,
  payload: CollectionUpdatePayload
): Promise<Collection> {
  const res = await fetch(`${BASE_URL}/collections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = (await res.json()) as Collection;
  return data;
}

export async function deleteCollection(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/collections/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
}
