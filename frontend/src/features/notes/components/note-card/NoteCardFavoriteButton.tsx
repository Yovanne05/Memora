import { useCallback } from "react"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToggleNoteFavoriteMutation } from "../../hooks/useToggleNoteFavoriteMutation"

type NoteCardFavoriteButtonProps = {
  noteId: string
  favorite: boolean
}

export function NoteCardFavoriteButton({
  noteId,
  favorite,
}: Readonly<NoteCardFavoriteButtonProps>) {
  const toggleFavorite = useToggleNoteFavoriteMutation()

  const handleFavoriteClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      toggleFavorite.mutate({ noteId, next: !favorite })
    },
    [toggleFavorite, noteId, favorite]
  )

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
