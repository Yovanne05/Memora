import { Skeleton } from "@/components/ui/skeleton"
import { getContentPreview } from "@/lib/html-utils"

type NoteLinkListItem = {
  id: string
  title: string
  content?: string | null
}

type NoteLinkListProps = {
  items: NoteLinkListItem[]
  isLoading: boolean
  searchQuery: string
  selectedId: string | null
  onSelect: (id: string) => void
}

export function NoteLinkList({
  items,
  isLoading,
  searchQuery,
  selectedId,
  onSelect,
}: Readonly<NoteLinkListProps>) {
  return (
    <div className="flex-1 overflow-y-auto border rounded-lg">
      {isLoading && (
        <div className="p-4 space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          {searchQuery ? "Aucune note trouvée" : "Aucune note disponible"}
        </div>
      )}

      {!isLoading &&
        items.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full text-left p-4 border-b last:border-b-0 hover:bg-accent transition-colors ${
              selectedId === item.id ? "bg-accent" : ""
            }`}
          >
            <h4 className="font-medium text-sm mb-1">{item.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {getContentPreview(item.content || "", 150)}
            </p>
          </button>
        ))}
    </div>
  )
}
