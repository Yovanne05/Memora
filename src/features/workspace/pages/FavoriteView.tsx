import { FavoritesContent } from "../components/favorites/FavoritesContent"
import { FavoritesEmpty } from "../components/favorites/FavoritesEmpty"
import { FavoritesError } from "../components/favorites/FavoritesError"
import { FavoritesHeader } from "../components/favorites/FavoritesHeader"
import { FavoritesLoading } from "../components/favorites/FavoritesLoading"
import { useFavoritesView } from "../hooks/useFavoritesView"

export default function FavoritesView() {
  const { isLoading, isError, errorMessage, notes, collections, hasContent } =
    useFavoritesView()

  if (isLoading) {
    return <FavoritesLoading />
  }

  if (isError) {
    return <FavoritesError message={errorMessage} />
  }

  return (
    <div className="space-y-6">
      <FavoritesHeader />
      {hasContent ? (
        <FavoritesContent collections={collections} notes={notes} />
      ) : (
        <FavoritesEmpty />
      )}
    </div>
  )
}



