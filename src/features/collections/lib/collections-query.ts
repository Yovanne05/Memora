import type { Collection, CollectionVisibility } from "../models/collection.model"

export type CollectionsTab = "mine" | "shared" | "favorites"
export type CollectionsSort = "recent" | "alphabetical" | "notes-count"

export interface CollectionsQuery {
  tab: CollectionsTab
  search: string
  sort: CollectionsSort
  currentUserId: string
  visibilityFilter?: CollectionVisibility
  minNotes?: number
  maxNotes?: number
}

export function applyCollectionsQuery(
  collections: Collection[],
  query: CollectionsQuery
): Collection[] {
  const search = query.search.trim().toLowerCase()

  return collections
    .filter((collection) => {
      if (query.tab === "mine") return collection.ownerId === query.currentUserId
      if (query.tab === "shared") return collection.ownerId !== query.currentUserId
      return true
    })
    .filter((collection) => {
      if (!search) return true
      return (
        collection.name.toLowerCase().includes(search) ||
        (collection.description ?? "").toLowerCase().includes(search)
      )
    })
    .filter((collection) => {
      if (query.visibilityFilter) {
        return collection.visibility === query.visibilityFilter
      }
      return true
    })
    .filter((collection) => {
      const notesCount = collection.notes.length
      if (query.minNotes !== undefined && notesCount < query.minNotes) return false
      if (query.maxNotes !== undefined && notesCount > query.maxNotes) return false
      return true
    })
    .slice()
    .sort((a, b) => {
      if (query.sort === "alphabetical") {
        return a.name.localeCompare(b.name)
      }
      if (query.sort === "notes-count") {
        return b.notes.length - a.notes.length
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
}
