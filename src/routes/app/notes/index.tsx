import NotesPage from '@/features/notes/pages/NotesPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/notes/')({
  component: NotesPage,
})
