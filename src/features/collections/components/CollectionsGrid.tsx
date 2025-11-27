import type { Collection } from "../types"
import { CollectionCard } from "./CollectionCard"

interface CollectionsGridProps {
  items: Collection[]
}

export function CollectionsGrid({ items }: CollectionsGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {items.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </section>
  )
}
