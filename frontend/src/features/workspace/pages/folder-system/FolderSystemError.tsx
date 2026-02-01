import { getContextualErrorMessage } from '@/lib/error-context'

interface FolderSystemErrorProps {
  error: unknown
}

export function FolderSystemError({ error }: Readonly<FolderSystemErrorProps>) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <p className="text-destructive">Erreur lors du chargement</p>
      <p className="text-sm text-muted-foreground">
        {getContextualErrorMessage(error, {
          operation: 'fetch',
          resource: 'note',
          fallback: 'Une erreur est survenue',
        })}
      </p>
    </div>
  )
}
