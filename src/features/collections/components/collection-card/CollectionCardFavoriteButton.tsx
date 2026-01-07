import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToggleCollectionFavoriteMutation } from "../../hooks/useToggleCollectionFavoriteMutation"

type CollectionCardFavoriteButtonProps = {
  collectionId: string
  favorite: boolean
}

export function CollectionCardFavoriteButton({
  collectionId,
  favorite,
}: Readonly<CollectionCardFavoriteButtonProps>) {
  const toggleFavorite = useToggleCollectionFavoriteMutation()

  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    toggleFavorite.mutate({ collectionId, next: !favorite })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
      onClick={handleFavoriteClick}
      aria-pressed={favorite}
      aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      disabled={toggleFavorite.isPending}
    >
      <Star
        className={`h-4 w-4 transition ${
          favorite ? "fill-current text-primary" : "text-muted-foreground"
        }`}
        aria-hidden="true"
      />
    </Button>
  )
}
