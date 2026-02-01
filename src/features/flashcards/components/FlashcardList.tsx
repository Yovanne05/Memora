import { useState } from 'react'
import type { Flashcard } from '../models/flashcard.model'
import { useReviewMutation } from '@/features/revision/hooks/useReviewMutation'
import type { ReviewDifficulty } from '@/features/revision/types/difficulty'
import { logger } from '@/lib/logger'
import { FlashcardListItem } from './flashcard-list/FlashcardListItem'

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
      {flashcards.map((flashcard) => (
        <FlashcardListItem
          key={flashcard.id}
          flashcard={flashcard}
          isExpanded={expandedId === flashcard.id}
          reviewResult={reviewResults[flashcard.id] ?? null}
          onToggle={() => toggleFlashcard(flashcard.id)}
          onReviewSubmit={(difficulty, selectedAnswerId) =>
            handleReviewSubmit(flashcard.id, difficulty, selectedAnswerId)
          }
        />
      ))}
    </div>
  )
}
