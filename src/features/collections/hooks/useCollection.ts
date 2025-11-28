import { useCallback, useEffect, useState } from "react"
import type { Collection } from "../models/collection.model"
import {
  collectionsService,
  type CollectionsService,
} from "../services/collections.service"
import { resolveErrorMessage } from "@/lib/errors"

export function useCollection(
  id?: string,
  service: CollectionsService = collectionsService
) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await service.get(id)
      setCollection(data)
    } catch (err) {
      console.error(err)
      setError(resolveErrorMessage(err, "Unable to load the collection."))
    } finally {
      setLoading(false)
    }
  }, [id, service])

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
