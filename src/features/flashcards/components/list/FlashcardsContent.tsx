import { FlashcardsGrid } from "./FlashcardsGrid";
import type { Flashcard } from "../../models/flashcard.model";

interface FlashcardsContentProps {
  flashcards: Flashcard[];
  loading?: boolean;
  error?: Error | null;
  onEdit?: (flashcard: Flashcard) => void;
  onDelete?: (flashcard: Flashcard) => void;
  onDuplicate?: (flashcard: Flashcard) => void;
}

export function FlashcardsContent({
  flashcards,
  loading,
  error,
  onEdit,
  onDelete,
  onDuplicate,
}: Readonly<FlashcardsContentProps>) {
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Chargement des flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive">Une erreur est survenue lors du chargement des flashcards.</p>
          <p className="mt-2 text-xs text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Aucune flashcard trouvée.</p>
          <p className="mt-2 text-xs text-muted-foreground">Créez votre première flashcard pour commencer.</p>
        </div>
      </div>
    );
  }

  return (
    <FlashcardsGrid
      flashcards={flashcards}
      onEdit={onEdit}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
    />
  );
}
