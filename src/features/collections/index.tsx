import React from "react"
import { useCollections } from "./hooks"

export function CollectionsFeature() {
  const { collections, loading, error, reload } = useCollections()

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Collections</h1>
        <p className="text-sm text-slate-600">
          Simple list view using mocks/API and hooks.
        </p>
      </header>

      {loading && (
        <p className="text-sm text-slate-500 mb-2">Loading collections…</p>
      )}

      {error && (
        <p className="mb-3 text-sm text-red-600">
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

      {!loading && collections.length === 0 && !error && (
        <p className="text-sm text-slate-500">
          No collections found. Try adding some in the backend or mocks.
        </p>
      )}

      <ul className="space-y-2">
        {collections.map((collection) => (
          <li
            key={collection.id}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <div className="font-medium text-slate-900">
              {collection.name}
            </div>
            {collection.description && (
              <div className="text-slate-600 text-xs">
                {collection.description}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CollectionsFeature
