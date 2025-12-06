import { Skeleton } from "@/components/ui/skeleton"

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = "Chargement..." }: LoadingStateProps) {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="relative flex-1 rounded-lg border bg-muted/30 p-8">
        <div className="flex h-full items-center justify-center">
          <div className="relative h-64 w-full max-w-2xl">
            <Skeleton className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full" />

            <Skeleton className="absolute left-1/4 top-1/4 h-12 w-12 rounded-full" />
            <Skeleton className="absolute right-1/4 top-1/4 h-12 w-12 rounded-full" />
            <Skeleton className="absolute left-1/4 bottom-1/4 h-12 w-12 rounded-full" />
            <Skeleton className="absolute right-1/4 bottom-1/4 h-12 w-12 rounded-full" />

            <Skeleton className="absolute left-1/3 top-1/2 h-10 w-10 rounded-full" />
            <Skeleton className="absolute right-1/3 top-1/2 h-10 w-10 rounded-full" />
          </div>
        </div>

        <div className="absolute bottom-4 right-4 space-y-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>

        <Skeleton className="absolute bottom-4 left-4 h-24 w-32 rounded-lg" />
      </div>

      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      <p className="text-center text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
