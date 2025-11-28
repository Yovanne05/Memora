interface CollectionsEmptyStateProps {
  message?: string
}

export function CollectionsEmptyState({
  message = "No collections found. Try changing your filters.",
}: CollectionsEmptyStateProps) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg border bg-card text-muted-foreground">
      {message}
    </div>
  )
}
