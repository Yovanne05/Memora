import { useState } from "react";
import { ChevronDown, ChevronUp, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Flashcard } from "../models/flashcard.model";
import { FlashcardViewer } from "./FlashcardViewer";
import { cn } from "@/lib/utils";

interface FlashcardListProps {
  flashcards: Flashcard[];
}

export function FlashcardList({ flashcards }: FlashcardListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleFlashcard = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (flashcards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {flashcards.map((flashcard) => {
        const isExpanded = expandedId === flashcard.id;

        return (
          <div
            key={flashcard.id}
            className={cn(
              "rounded-lg border transition-colors",
              isExpanded ? "border-primary bg-card" : "border-border bg-card/50"
            )}
          >
            <button
              type="button"
              onClick={() => toggleFlashcard(flashcard.id)}
              className="w-full text-left p-3 flex items-center justify-between gap-3 hover:bg-accent/50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {flashcard.question}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {flashcard.answers.length} réponse{flashcard.answers.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFlashcard(flashcard.id);
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </button>

            {isExpanded && (
              <div className="px-3 pb-3">
                <FlashcardViewer
                  flashcard={flashcard}
                  onClose={() => setExpandedId(null)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
