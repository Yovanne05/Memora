import { useCallback, useEffect, useState } from "react"
import type { Collection } from "../models/collection.model"
import {
  collectionsService,
  type CollectionsService,
} from "../services/collections.service"
import { resolveErrorMessage } from "@/lib/errors"

export function useCollections(
  service: CollectionsService = collectionsService
) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await service.list()
      setCollections(data)
    } catch (err) {
      console.error(err)
      setError(resolveErrorMessage(err, "Unable to load collections."))
    } finally {
      setLoading(false)
    }
  }, [service])

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
