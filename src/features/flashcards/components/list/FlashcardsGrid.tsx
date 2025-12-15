import { FlashcardCard } from "./FlashcardCard";
import type { Flashcard } from "../../models/flashcard.model";

interface FlashcardsGridProps {
  flashcards: Flashcard[];
  onEdit?: (flashcard: Flashcard) => void;
  onDelete?: (flashcard: Flashcard) => void;
  onDuplicate?: (flashcard: Flashcard) => void;
}

export function FlashcardsGrid({ flashcards, onEdit, onDelete, onDuplicate }: Readonly<FlashcardsGridProps>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {flashcards.map((flashcard) => (
        <FlashcardCard
          key={flashcard.id}
          flashcard={flashcard}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}
