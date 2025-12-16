import { useState } from "react";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useFlashcardsByNoteQuery } from "../hooks/useFlashcardsByNoteQuery";
import { useCreateFlashcardMutation } from "../hooks/useCreateFlashcardMutation";
import { FlashcardForm } from "./FlashcardForm";
import { FlashcardList } from "./FlashcardList";
import type { FlashcardEditForm } from "../schemas/flashcard.schema";

interface FlashcardsSectionProps {
  noteId: string;
}

export function FlashcardsSection({ noteId }: FlashcardsSectionProps) {
  const [isCreating, setIsCreating] = useState(false);

  const { data: flashcards = [], isLoading, isError } = useFlashcardsByNoteQuery(noteId);
  const createMutation = useCreateFlashcardMutation({
    onSuccess: () => {
      setIsCreating(false);
    },
  });

  const handleCreateFlashcard = async (data: FlashcardEditForm) => {
    await createMutation.mutateAsync({
      noteId: data.noteId,
      question: data.question,
      answers: data.answers,
    });
  };

  return (
    <>
      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Flashcards ({flashcards.length})
          </h3>
          {!isCreating && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsCreating(true)}
              className="h-8 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Créer une flashcard
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Chargement des flashcards...</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 py-4 px-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm">Erreur lors du chargement des flashcards</p>
          </div>
        )}

        {!isLoading && !isError && flashcards.length === 0 && !isCreating && (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Aucune flashcard pour cette note
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsCreating(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Créer la première flashcard
            </Button>
          </div>
        )}

        {!isLoading && !isError && flashcards.length > 0 && !isCreating && (
          <FlashcardList flashcards={flashcards} />
        )}

        {isCreating && (
          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-sm font-semibold mb-4">Nouvelle flashcard</h4>
            <FlashcardForm
              noteId={noteId}
              onSubmit={handleCreateFlashcard}
              onCancel={() => setIsCreating(false)}
              isSubmitting={createMutation.isPending}
            />
          </div>
        )}
      </div>
    </>
  );
}
