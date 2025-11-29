interface CollectionsErrorAlertProps {
  message: string
  onRetry?: () => void
}

export function CollectionsErrorAlert({ message, onRetry }: CollectionsErrorAlertProps) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}{" "}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="font-medium underline underline-offset-2"
        >
          Réessayer
        </button>
      )}
    </div>
  )
}
