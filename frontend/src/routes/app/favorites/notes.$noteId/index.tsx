import { createFileRoute } from '@tanstack/react-router'
import NoteEditView from '@/features/workspace/pages/NoteEditView'

export const Route = createFileRoute('/app/favorites/notes/$noteId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { noteId } = Route.useParams()
  return <NoteEditView key={noteId} noteId={noteId} />
}
