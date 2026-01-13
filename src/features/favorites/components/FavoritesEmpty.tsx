export function FavoritesEmpty() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2">
      <p className="text-lg font-medium">Aucun favori</p>
      <p className="text-sm text-muted-foreground">
        Ajoutez des collections et des notes en favoris pour les retrouver ici.
      </p>
    </div>
  )
}
