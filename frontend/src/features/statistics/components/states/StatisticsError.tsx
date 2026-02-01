import { Button } from "@/components/ui/button"

type Props = {
  message?: string
  onRetry: () => void
}

export function StatisticsError({ message, onRetry }: Readonly<Props>) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <p className="text-destructive">Erreur lors du chargement</p>
      <p className="text-sm text-muted-foreground">
        {message ?? "Une erreur est survenue"}
      </p>
      <Button variant="outline" onClick={onRetry}>
        Réessayer
      </Button>
    </div>
  )
}
