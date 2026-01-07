import { cn } from "@/lib/utils"
import type { Flashcard } from "../../models/flashcard.model"

type FlashcardResultProps = {
  isCorrect: boolean
  correctAnswer?: Flashcard["answers"][number]
}

export function FlashcardResult({
  isCorrect,
  correctAnswer,
}: Readonly<FlashcardResultProps>) {
  return (
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
  )
}
