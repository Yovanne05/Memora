import { createFileRoute } from "@tanstack/react-router"
import CollectionNotesView from "@/features/workspace/pages/CollectionNotesView"

export const Route = createFileRoute(
  "/app/workspace/favorites/collections/$collectionId/"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { collectionId } = Route.useParams()
  return <CollectionNotesView key={collectionId} collectionId={collectionId} />
}
