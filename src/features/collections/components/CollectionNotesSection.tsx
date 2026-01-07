import { CollectionNotesGridWithLinks } from "./CollectionNotesGridWithLinks"
import { CollectionNotesHeader } from "./CollectionNotesHeader"
import { useCollectionNotesSection } from "./collection-notes/useCollectionNotesSection"

export function CollectionNotesSection() {
  const {
    availableNotes,
    selected,
    isLoading,
    isUpdating,
    onSelectNote,
    search,
    setSearch,
    sort,
    setSort,
    notes,
    onRemoveFromCollection,
  } = useCollectionNotesSection()

  return (
    <div className="space-y-6 rounded-2xl border border-border/50 bg-card/30 p-6 shadow-sm backdrop-blur-sm md:p-8">
      <CollectionNotesHeader
        availableNotes={availableNotes}
        selected={selected}
        isAdding={isUpdating}
        onSelectNote={onSelectNote}
        searchValue={search}
        onSearchChange={setSearch}
        sortValue={sort}
        onSortChange={setSort}
      />

      <CollectionNotesGridWithLinks
        notes={notes}
        isLoading={isLoading}
        isUpdating={isUpdating}
        onRemoveFromCollection={onRemoveFromCollection}
      />
    </div>
  )
}
