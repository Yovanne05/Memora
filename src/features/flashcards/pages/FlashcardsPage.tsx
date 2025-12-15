import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashcardsHeader } from "../components/list/FlashcardsHeader";
import { FlashcardsToolbar } from "../components/list/FlashcardsToolbar";
import { FlashcardsContent } from "../components/list/FlashcardsContent";
import { FlashcardsPagination } from "../components/list/FlashcardsPagination";
import { useFlashcardsManager } from "../hooks/useFlashcardsManager";
import { useCreateFlashcardMutation } from "../hooks/useCreateFlashcardMutation";
import { useDeleteFlashcardMutation } from "../hooks/useDeleteFlashcardMutation";
import { useDuplicateFlashcardMutation } from "../hooks/useDuplicateFlashcardMutation";
import { useState } from "react";
import { CreateFlashcardDialog } from "../components/dialogs/CreateFlashcardDialog";
import type { Flashcard } from "../models/flashcard.model";
import type { FlashcardEditForm } from "../schemas/flashcard.schema";
import { useRouter } from "@tanstack/react-router";

export default function FlashcardsPage() {
  const router = useRouter();
  const manager = useFlashcardsManager();
  const createFlashcardMutation = useCreateFlashcardMutation();
  const deleteFlashcardMutation = useDeleteFlashcardMutation();
  const duplicateFlashcardMutation = useDuplicateFlashcardMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");

  const handleCreateFlashcard = async (payload: FlashcardEditForm) => {
    await createFlashcardMutation.mutateAsync({
      noteId: payload.noteId,
      question: payload.question,
      answers: payload.answers,
    });
    setDialogOpen(false);
  };

  const handleEdit = (flashcard: Flashcard) => {
    router.navigate({
      to: "/app/flashcards/$id/edit",
      params: { id: flashcard.id },
    });
  };

  const handleDelete = async (flashcard: Flashcard) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette flashcard ?`)) {
      await deleteFlashcardMutation.mutateAsync(flashcard.id);
    }
  };

  const handleDuplicate = async (flashcard: Flashcard) => {
    await duplicateFlashcardMutation.mutateAsync({ id: flashcard.id });
  };

  const openCreateDialog = () => {
    // Pour l'instant, on utilise un noteId factice
    // Dans une vraie application, on devrait soit :
    // 1. Demander à l'utilisateur de sélectionner une note
    // 2. Créer les flashcards depuis la page de détail d'une note
    setSelectedNoteId("00000000-0000-0000-0000-000000000000");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FlashcardsHeader
          description={`${manager.total} flashcard${manager.total > 1 ? "s" : ""} au total`}
        />
        <Button
          size="lg"
          className="gap-2"
          onClick={openCreateDialog}
          disabled={createFlashcardMutation.isPending}
        >
          <Plus className="h-4 w-4" />
          {createFlashcardMutation.isPending ? "Création..." : "Nouvelle flashcard"}
        </Button>
      </div>

      <FlashcardsToolbar
        search={manager.search}
        onSearchChange={(value) => {
          manager.setSearch(value);
          manager.setPage(0);
        }}
        sort={manager.sort}
        onSortChange={(value) => {
          manager.setSort(value);
          manager.setPage(0);
        }}
        view={manager.view}
        onViewChange={manager.setView}
        onSubmitSearch={() => manager.setPage(0)}
      />

      <FlashcardsContent
        loading={manager.loading}
        error={manager.error}
        flashcards={manager.data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />

      {manager.total > 0 && (
        <FlashcardsPagination page={manager.page} maxPage={manager.maxPage} setPage={manager.setPage} />
      )}

      {selectedNoteId && (
        <CreateFlashcardDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleCreateFlashcard}
          submitting={createFlashcardMutation.isPending}
          noteId={selectedNoteId}
        />
      )}
    </div>
  );
}
