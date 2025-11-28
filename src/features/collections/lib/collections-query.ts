import type { Collection } from "../models/collection.model"

export type CollectionsTab = "mine" | "shared"
export type CollectionsSort = "recent" | "alphabetical"

export interface CollectionsQuery {
  tab: CollectionsTab
  search: string
  sort: CollectionsSort
  currentUserId: string
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
    .slice()
    .sort((a, b) => {
      if (query.sort === "alphabetical") {
        return a.name.localeCompare(b.name)
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
}
