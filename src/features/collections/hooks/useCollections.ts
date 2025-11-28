import { useCallback, useEffect, useState } from "react"
import type {
  Collection,
  CollectionCreatePayload,
  CollectionUpdatePayload,
} from "../models/collection.model"
import {
  fetchCollections,
  fetchCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
} from "../api/collections.api"

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCollections()
      setCollections(data)
    } catch (err) {
      console.error(err)
      setError("Unable to load collections.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    collections,
    setCollections,
    loading,
    error,
    reload,
  }
}

export function useCollection(id?: string) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCollectionById(id)
      setCollection(data)
    } catch (err) {
      console.error(err)
      setError("Unable to load the collection.")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    void reload()
  }, [id, reload])

  return {
    collection,
    setCollection,
    loading,
    error,
    reload,
  }
}

export function useCreateCollection(onSuccess?: (created: Collection) => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(
    async (payload: CollectionCreatePayload) => {
      try {
        setLoading(true)
        setError(null)
        const created = await createCollection(payload)
        onSuccess?.(created)
        return created
      } catch (err) {
        console.error(err)
        setError("Unable to create the collection.")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [onSuccess]
  )

  return {
    create,
    loading,
    error,
  }
}

export function useUpdateCollection(onSuccess?: (updated: Collection) => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(
    async (id: string, payload: CollectionUpdatePayload) => {
      try {
        setLoading(true)
        setError(null)
        const updated = await updateCollection(id, payload)
        onSuccess?.(updated)
        return updated
      } catch (err) {
        console.error(err)
        setError("Unable to update the collection.")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [onSuccess]
  )

  return {
    update,
    loading,
    error,
  }
}

export function useDeleteCollection(onSuccess?: (id: string) => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        setError(null)
        await deleteCollection(id)
        onSuccess?.(id)
      } catch (err) {
        console.error(err)
        setError("Unable to delete the collection.")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [onSuccess]
  )

  return {
    remove,
    loading,
    error,
  }
}
