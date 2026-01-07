import type { SearchResult } from "../types/search.types"
import type { Collection } from "@/features/collections/models/collection.model"
import type { Note } from "@/features/notes/models/note.model"
import { CollectionResultCard } from "./search-result-card/CollectionResultCard"
import { NoteResultCard } from "./search-result-card/NoteResultCard"

interface SearchResultCardProps {
  readonly result: SearchResult
}

function isCollection(item: Collection | Note): item is Collection {
  return "notes" in item
}

function isNote(item: Collection | Note): item is Note {
  return "content" in item
}

export function SearchResultCard({ result }: Readonly<SearchResultCardProps>) {
  const { type, item } = result

  if (type === "collection" && isCollection(item)) {
    return <CollectionResultCard collection={item} />
  }

  if (type === "note" && isNote(item)) {
    return <NoteResultCard note={item} />
  }

  return null
}
