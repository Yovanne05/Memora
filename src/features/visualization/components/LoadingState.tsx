interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = "Chargement..." }: LoadingStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
