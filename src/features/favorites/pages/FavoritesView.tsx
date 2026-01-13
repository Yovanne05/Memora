import { FavoritesContent } from '../components/FavoritesContent'
import { FavoritesEmpty } from '../components/FavoritesEmpty'
import { FavoritesError } from '../components/FavoritesError'
import { FavoritesHeader } from '../components/FavoritesHeader'
import { FavoritesLoading } from '../components/FavoritesLoading'
import { useFavoritesData } from '../hooks/useFavoritesData'

export default function FavoritesView() {
  const { isLoading, isError, errorMessage, notes, collections, hasContent } =
    useFavoritesData()

  if (isLoading) {
    return <FavoritesLoading />
  }

  if (isError) {
    return <FavoritesError message={errorMessage} />
  }

  return (
    <div className="w-full space-y-6">
      <FavoritesHeader />
      {hasContent ? (
        <FavoritesContent collections={collections} notes={notes} />
      ) : (
        <FavoritesEmpty />
      )}
    </div>
  )
}
