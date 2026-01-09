import { Check, X } from 'lucide-react'

import type { Flashcard } from '../../models/flashcard.model'
import { cn } from '@/lib/utils'

type FlashcardAnswersListProps = {
  answers: Flashcard['answers']
  selectedAnswerId: string | null
  correctAnswerId?: string | null
  showResult: boolean
  onSelect: (answerId: string) => void
}

export function FlashcardAnswersList({
  answers,
  selectedAnswerId,
  correctAnswerId,
  showResult,
  onSelect,
}: Readonly<FlashcardAnswersListProps>) {
  return (
    <div className="space-y-2">
      {answers.map((answer) => {
        const isSelected = selectedAnswerId === answer.id
        const isThisCorrect = answer.id === correctAnswerId
        const shouldShowCorrect = showResult && correctAnswerId && isThisCorrect
        const shouldShowIncorrect =
          showResult && correctAnswerId && isSelected && !isThisCorrect

        return (
          <button
            key={answer.id}
            type="button"
            onClick={() => onSelect(answer.id)}
            disabled={showResult}
            className={cn(
              'w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3',
              !showResult &&
                'hover:bg-accent hover:border-accent-foreground/20',
              isSelected && !showResult && 'border-primary bg-primary/5',
              shouldShowCorrect && 'border-green-500 bg-green-500/10',
              shouldShowIncorrect && 'border-red-500 bg-red-500/10',
              showResult && 'cursor-default'
            )}
          >
            <div
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                !showResult &&
                  isSelected &&
                  'border-primary bg-primary text-primary-foreground',
                !showResult && !isSelected && 'border-muted-foreground/30',
                shouldShowCorrect && 'border-green-500 bg-green-500 text-white',
                shouldShowIncorrect && 'border-red-500 bg-red-500 text-white'
              )}
            >
              {shouldShowCorrect && <Check className="h-4 w-4" />}
              {shouldShowIncorrect && <X className="h-4 w-4" />}
            </div>

            <span className="flex-1 text-sm">{answer.answerText}</span>
          </button>
        )
      })}
    </div>
  )
}
