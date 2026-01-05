import { Plus } from "lucide-react"
import { useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { NotesHeader } from "../components/list/NotesHeader"
import { NotesToolbar } from "../components/list/NotesToolbar"
import { NotesContent } from "../components/list/NotesContent"
import { NotesPagination } from "../components/list/NotesPagination"
import { useNotesManager } from "../hooks/useNotesManager"
import { useCreateNoteMutation } from "../hooks/useCreateNoteMutation"
import { useState } from "react"
import { CreateNoteDialog } from "../components/dialogs/CreateNoteDialog"

export default function NotesPage() {
  const router = useRouter()
  const manager = useNotesManager()
  const { user } = useAuth()
  const userId = user?.id
  const createNoteMutation = useCreateNoteMutation()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreateNote = async (payload: {
    title: string
    collectionId: string | null
    visibility: "private" | "public"
    tags: string[]
  }) => {
    if (!userId) return
    const note = await createNoteMutation.mutateAsync({
      title: payload.title,
      content: payload.title,
      visibility: payload.visibility,
      collectionId: payload.collectionId,
      tags: payload.tags,
      ownerId: userId,
    })

    router.navigate({
      to: "/app/notes/$id/edit",
      params: { id: note.id },
    })
    setDialogOpen(false)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <NotesHeader total={manager.total} />
        <Button
          size="lg"
          className="gap-2"
          onClick={() => setDialogOpen(true)}
          disabled={createNoteMutation.isPending}
        >
          <Plus className="h-4 w-4" />
          {createNoteMutation.isPending ? "Création..." : "Nouvelle note"}
        </Button>
      </div>

      <NotesToolbar
        search={manager.search}
        onSearchChange={(value) => {
          manager.setSearch(value)
          manager.setPage(0)
        }}
        sort={manager.sort}
        onSortChange={(value) => {
          manager.setSort(value)
          manager.setPage(0)
        }}
        visibility={manager.visibility}
        onVisibilityChange={(value) => {
          manager.setVisibility(value)
          manager.setPage(0)
        }}
        view={manager.view}
        onViewChange={manager.setView}
        onSubmitSearch={() => manager.setPage(0)}

        scope={manager.scope}
        onScopeChange={(value) => {
          manager.setScope(value)
          manager.setPage(0)
        }}
      />

      <NotesContent
        loading={manager.loading}
        error={manager.error?.message ?? null}
        notes={manager.data}
        view={manager.view}
        onRetry={manager.refetch}
      />

      <NotesPagination
        page={manager.page}
        maxPage={manager.maxPage}
        setPage={manager.setPage}
      />

      <CreateNoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateNote}
        submitting={createNoteMutation.isPending}
      />
    </div>
  )
}
