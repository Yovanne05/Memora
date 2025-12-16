import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Flashcard } from "../models/flashcard.model";
import { cn } from "@/lib/utils";

interface FlashcardViewerProps {
  flashcard: Flashcard;
  onClose?: () => void;
}

export function FlashcardViewer({ flashcard, onClose }: FlashcardViewerProps) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const correctAnswer = flashcard.answers.find((a) => a.isCorrect);

  const handleAnswerClick = (answerId: string) => {
    if (!showResult) {
      setSelectedAnswerId(answerId);
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setSelectedAnswerId(null);
    setShowResult(false);
  };

  const isCorrect = selectedAnswerId === correctAnswer?.id;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-base font-semibold mb-4">{flashcard.question}</h3>

        <div className="space-y-2">
          {flashcard.answers.map((answer) => {
            const isSelected = selectedAnswerId === answer.id;
            const isThisCorrect = answer.isCorrect;
            const shouldShowCorrect = showResult && isThisCorrect;
            const shouldShowIncorrect = showResult && isSelected && !isThisCorrect;

            return (
              <button
                key={answer.id}
                type="button"
                onClick={() => handleAnswerClick(answer.id)}
                disabled={showResult}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3",
                  !showResult && "hover:bg-accent hover:border-accent-foreground/20",
                  isSelected && !showResult && "border-primary bg-primary/5",
                  shouldShowCorrect && "border-green-500 bg-green-500/10",
                  shouldShowIncorrect && "border-red-500 bg-red-500/10",
                  showResult && "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    !showResult && isSelected && "border-primary bg-primary text-primary-foreground",
                    !showResult && !isSelected && "border-muted-foreground/30",
                    shouldShowCorrect && "border-green-500 bg-green-500 text-white",
                    shouldShowIncorrect && "border-red-500 bg-red-500 text-white"
                  )}
                >
                  {shouldShowCorrect && <Check className="h-4 w-4" />}
                  {shouldShowIncorrect && <X className="h-4 w-4" />}
                </div>

                <span className="flex-1 text-sm">{answer.answerText}</span>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div
            className={cn(
              "mt-4 p-3 rounded-lg border",
              isCorrect
                ? "border-green-500/50 bg-green-500/10 text-green-900 dark:text-green-100"
                : "border-red-500/50 bg-red-500/10 text-red-900 dark:text-red-100"
            )}
          >
            <p className="text-sm font-medium">
              {isCorrect ? "Bonne réponse !" : "Mauvaise réponse"}
            </p>
            {!isCorrect && correctAnswer && (
              <p className="text-xs mt-1">
                La réponse correcte est : {correctAnswer.answerText}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showResult && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Réessayer
          </Button>
        )}
        {onClose && (
          <Button
            type="button"
            variant={showResult ? "default" : "outline"}
            onClick={onClose}
            className="flex-1"
          >
            Fermer
          </Button>
        )}
      </div>
    </div>
  );
}
