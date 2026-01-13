import { Folder } from 'lucide-react'
import type { Collection } from '@/features/collections/models/collection.model'
import { CollectionCard } from '../../components/CollectionCard'

interface CollectionsSectionProps {
  collections: Collection[]
}

export function CollectionsSection({
  collections,
}: Readonly<CollectionsSectionProps>) {
  if (collections.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Folder className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Collections</h2>
        <span className="text-sm text-muted-foreground">
          ({collections.length})
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  )
}
