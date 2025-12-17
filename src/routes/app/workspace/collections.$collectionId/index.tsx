import { createFileRoute } from "@tanstack/react-router"
import CollectionNotesView from "@/features/workspace/views/CollectionNotesView"

export const Route = createFileRoute("/app/workspace/collections/$collectionId/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { collectionId } = Route.useParams()
  return <CollectionNotesView collectionId={collectionId} />
}
