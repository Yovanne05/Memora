interface CollectionsEmptyStateProps {
  message?: string
}

export function CollectionsEmptyState({
  message = "Aucune collection trouvée. Essayez de modifier vos filtres.",
}: CollectionsEmptyStateProps) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg border bg-card text-muted-foreground">
      {message}
    </div>
  )
}
