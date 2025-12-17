import { Button } from "@/components/ui/button"
import { useRouter } from "@tanstack/react-router"

interface CollectionDetailsErrorProps {
  error?: string | null
  onRetry: () => void
}

export function CollectionDetailsError({
  error,
  onRetry,
}: CollectionDetailsErrorProps) {
  const router = useRouter()

  const handleBack = () => {
    router.navigate({ to: "/app/collections" })
  }

  return (
    <div className="p-6">
      <p className="mb-3 text-sm text-red-600">
        {error ?? "Collection introuvable."}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onRetry}>
          Réessayer
        </Button>
        <Button variant="ghost" onClick={handleBack}>
          Retour aux collections
        </Button>
      </div>
    </div>
  )
}
