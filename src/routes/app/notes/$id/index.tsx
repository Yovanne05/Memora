import { createFileRoute } from '@tanstack/react-router'
import { NoteDetailPage } from '@/features/notes/pages/NoteDetailPage'

export const Route = createFileRoute('/app/notes/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <NoteDetailPage noteId={id} />
}
