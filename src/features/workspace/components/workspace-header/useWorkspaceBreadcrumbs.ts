import { useMemo } from "react"

import { useCollectionQuery } from "@/features/collections/hooks/useCollectionQuery"
import { useNoteQuery } from "@/features/notes/hooks/useNoteQuery"

type BreadcrumbItem = {
  label: string
  href?: string
}

type UseWorkspaceBreadcrumbsArgs = {
  selectedCollectionId: string | null
  selectedNoteId: string | null
}

export function useWorkspaceBreadcrumbs({
  selectedCollectionId,
  selectedNoteId,
}: UseWorkspaceBreadcrumbsArgs) {
  const collectionQuery = useCollectionQuery(selectedCollectionId || "")
  const noteQuery = useNoteQuery(selectedNoteId || "")

  return useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [{ label: "Workspace", href: "/app/workspace" }]

    if (selectedCollectionId && collectionQuery.data) {
      items.push({
        label: collectionQuery.data.name,
        href: `/app/workspace/collections/${selectedCollectionId}`,
      })
    }

    if (selectedNoteId && noteQuery.data) {
      items.push({
        label: noteQuery.data.title || "Sans titre",
      })
    }

    return items
  }, [selectedCollectionId, selectedNoteId, collectionQuery.data, noteQuery.data])
}
