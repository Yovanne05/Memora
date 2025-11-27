import { useMemo, useState } from "react"
import { useCollections } from "./hooks"
import { CollectionsHeader } from "./components/CollectionsHeader"
import { CollectionsToolbar } from "./components/CollectionsToolbar"
import { CollectionsGrid } from "./components/CollectionsGrid"

export function CollectionsFeature() {
  const { collections, loading, error, reload } = useCollections()

  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"mine" | "shared">("mine")
  const [sort, setSort] = useState<"recent" | "alphabetical">("recent")

  const filtered = useMemo(() => {
    let list = [...collections]

    // TODO: plus tard filtrer réellement "shared"
    if (tab === "mine") {
      list = list // pour l’instant rien
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q)
      )
    }

    if (sort === "alphabetical") {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      // recent = par updatedAt desc
      list.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    }

    return list
  }, [collections, search, tab, sort])

  return (
    <div className="min-h-screen bg-slate-50 px-10 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <CollectionsHeader onCreate={() => { /* TODO: open create dialog */ }} />

        <CollectionsToolbar
          search={search}
          onSearchChange={setSearch}
          tab={tab}
          onTabChange={setTab}
          sort={sort}
          onSortChange={setSort}
        />

        {loading && (
          <p className="text-sm text-slate-500">Loading collections…</p>
        )}

        {error && (
          <p className="text-sm text-red-600">
            {error}{" "}
            <button
              type="button"
              onClick={reload}
              className="underline underline-offset-2"
            >
              Retry
            </button>
          </p>
        )}

        <CollectionsGrid items={filtered} />

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-slate-500">
            No collections found. Try changing your filters.
          </p>
        )}
      </div>
    </div>
  )
}

export default CollectionsFeature
