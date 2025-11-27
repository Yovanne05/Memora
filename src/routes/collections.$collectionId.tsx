import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { fetchCollectionById } from "../features/collections/api"
import { CollectionsDetailsPage } from "../features/collections/pages/CollectionsDetailsPage"

export const Route = createFileRoute("/collections/$collectionId")({
  component: CollectionDetailRoute,
})

function CollectionDetailRoute() {
  const { collectionId } = Route.useParams()

  const { data: collection, isLoading, isError } = useQuery({
    queryKey: ["collection", collectionId],
    queryFn: () => fetchCollectionById(collectionId),
  })

  if (isLoading) return <p>Chargement...</p>
  if (isError || !collection) return <p>Collection introuvable</p>

  return (
    <CollectionsDetailsPage
      collection={collection}
    />
  )
}
