import { createFileRoute } from "@tanstack/react-router"
import NoteEditView from "@/features/workspace/pages/NoteEditView"

export const Route = createFileRoute(
  "/app/workspace/favorites/collections/$collectionId/notes/$noteId/"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { collectionId, noteId } = Route.useParams()
  return <NoteEditView noteId={noteId} collectionId={collectionId} />
}
