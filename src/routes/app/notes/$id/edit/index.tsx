import { createFileRoute } from '@tanstack/react-router'
import { NoteEditPage } from "@/features/notes/pages/NoteEditPage"

export const Route = createFileRoute("/app/notes/$id/edit/")({
    component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <NoteEditPage noteId={id} />
}
