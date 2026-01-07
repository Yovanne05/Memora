import { FavoritesContent } from "./favorites-view/FavoritesContent"
import { FavoritesEmpty } from "./favorites-view/FavoritesEmpty"
import { FavoritesError } from "./favorites-view/FavoritesError"
import { FavoritesHeader } from "./favorites-view/FavoritesHeader"
import { FavoritesLoading } from "./favorites-view/FavoritesLoading"
import { useFavoritesView } from "./favorites-view/useFavoritesView"

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
