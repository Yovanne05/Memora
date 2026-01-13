type FavoritesErrorProps = {
  message: string
}

export function FavoritesError({ message }: Readonly<FavoritesErrorProps>) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2">
      <p className="text-destructive">Erreur lors du chargement des favoris</p>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
