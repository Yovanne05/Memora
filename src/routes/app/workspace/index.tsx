import { createFileRoute } from "@tanstack/react-router"
import NotesListView from "@/features/workspace/views/NotesListView"

export const Route = createFileRoute("/app/workspace/")({
  component: NotesListView,
})
