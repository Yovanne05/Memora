import { createFileRoute } from "@tanstack/react-router"
import NotesListView from "@/features/workspace/pages/NotesListView"

export const Route = createFileRoute("/app/workspace/")({
  component: NotesListView,
})
