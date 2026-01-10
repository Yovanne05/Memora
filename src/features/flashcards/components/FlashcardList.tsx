import { useState } from 'react'
import { ChevronDown, ChevronUp, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Flashcard } from '../models/flashcard.model'
import { FlashcardViewer } from './FlashcardViewer'
import { cn } from '@/lib/utils'
import { useReviewMutation } from '@/features/revision/hooks/useReviewMutation'
import type { ReviewDifficulty } from '@/features/revision/types/difficulty'
import { logger } from '@/lib/logger'

interface FlashcardListProps {
  readonly flashcards: Flashcard[]
}

export function FlashcardList({ flashcards }: Readonly<FlashcardListProps>) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reviewResults, setReviewResults] = useState<
    Record<string, { isCorrect: boolean; correctAnswerId: string }>
  >({})
  const reviewMutation = useReviewMutation()

  const toggleFlashcard = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
    if (expandedId === id) {
      setReviewResults((prev) => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })
    }
  }

  const handleReviewSubmit = async (
    flashcardId: string,
    difficulty: ReviewDifficulty,
    selectedAnswerId: string
  ) => {
    try {
      const review = await reviewMutation.mutateAsync({
        flashcardId,
        selectedAnswerId,
        difficulty,
      })

      setReviewResults((prev) => ({
        ...prev,
        [flashcardId]: {
          isCorrect: review.isCorrect,
          correctAnswerId: review.correctAnswerId,
        },
      }))
    } catch (error) {
      logger.error('Failed to submit review in FlashcardList', error)
    }
  }

  if (flashcards.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {flashcards.map((flashcard) => {
        const isExpanded = expandedId === flashcard.id

        return (
          <div
            key={flashcard.id}
            className={cn(
              'rounded-lg border transition-colors',
              isExpanded ? 'border-primary bg-card' : 'border-border bg-card/50'
            )}
          >
            <div className="w-full text-left p-3 flex items-center justify-between gap-3 rounded-lg">
              <button
                type="button"
                onClick={() => toggleFlashcard(flashcard.id)}
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity text-left"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {flashcard.question}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {flashcard.answers.length} réponse
                    {flashcard.answers.length > 1 ? 's' : ''}
                  </p>
                </div>
              </button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0"
                onClick={() => toggleFlashcard(flashcard.id)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {isExpanded && (
              <div className="px-3 pb-3">
                <FlashcardViewer
                  flashcard={flashcard}
                  onClose={() => setExpandedId(null)}
                  reviewMode={true}
                  onReviewSubmit={(difficulty, selectedAnswerId) =>
                    handleReviewSubmit(
                      flashcard.id,
                      difficulty,
                      selectedAnswerId
                    )
                  }
                  reviewResult={reviewResults[flashcard.id] ?? null}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
