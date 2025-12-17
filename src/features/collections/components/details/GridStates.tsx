import { useId } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { FileX } from "lucide-react"

export function GridLoadingState() {
  const gridId = useId();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={`${gridId}-skeleton-${i}`} className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  )
}

export function GridEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <FileX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">Aucune note</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Cette collection ne contient aucune note pour le moment. Ajoutez-en une pour commencer.
      </p>
    </div>
  )
}
