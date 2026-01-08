import { useState } from 'react'

import type { Flashcard } from '../models/flashcard.model'
import { ReviewDifficulty } from '@/features/revision/types/difficulty'
import { DifficultyRatingButtons } from '@/features/revision/components/DifficultyRatingButtons'
import { FlashcardAnswersList } from './flashcard-viewer/FlashcardAnswersList'
import { FlashcardResult } from './flashcard-viewer/FlashcardResult'
import { FlashcardViewerActions } from './flashcard-viewer/FlashcardViewerActions'

interface FlashcardViewerProps {
  readonly flashcard: Flashcard
  readonly onClose?: () => void
  readonly reviewMode?: boolean
  readonly onReviewSubmit?: (
    difficulty: ReviewDifficulty,
    selectedAnswerId: string
  ) => void
  readonly reviewResult?: {
    isCorrect: boolean
    correctAnswerId?: string
  } | null
}

export function FlashcardViewer({
  flashcard,
  onClose,
  reviewMode = false,
  onReviewSubmit,
  reviewResult = null,
}: Readonly<FlashcardViewerProps>) {
  const [selection, setSelection] = useState(() => ({
    flashcardId: flashcard.id,
    selectedAnswerId: null as string | null,
    showResult: false,
  }))

  const selectedAnswerId =
    selection.flashcardId === flashcard.id ? selection.selectedAnswerId : null
  const showResult =
    selection.flashcardId === flashcard.id ? selection.showResult : false

  // En mode review, utiliser le résultat du serveur et afficher si disponible
  const correctAnswerId = reviewResult?.correctAnswerId ?? null
  const isCorrect =
    reviewMode && selectedAnswerId && correctAnswerId
      ? selectedAnswerId === correctAnswerId
      : (reviewResult?.isCorrect ?? false)
  const shouldShowResult = reviewMode ? !!reviewResult : showResult
  const shouldShowDifficulty = reviewMode && !!selectedAnswerId && !reviewResult

  const handleAnswerClick = (answerId: string) => {
    if (reviewMode) {
      setSelection({
        flashcardId: flashcard.id,
        selectedAnswerId: answerId,
        showResult: false,
      })
    } else {
      if (!showResult) {
        setSelection({
          flashcardId: flashcard.id,
          selectedAnswerId: answerId,
          showResult: true,
        })
      }
    }
  }

  const handleReset = () => {
    setSelection({
      flashcardId: flashcard.id,
      selectedAnswerId: null,
      showResult: false,
    })
  }

  const handleDifficultySelect = (difficulty: ReviewDifficulty) => {
    if (selectedAnswerId && onReviewSubmit) {
      onReviewSubmit(difficulty, selectedAnswerId)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-base font-semibold mb-4">{flashcard.question}</h3>

        <FlashcardAnswersList
          answers={flashcard.answers}
          selectedAnswerId={selectedAnswerId}
          correctAnswerId={correctAnswerId}
          showResult={shouldShowResult}
          onSelect={handleAnswerClick}
        />

        {shouldShowResult && (
          <FlashcardResult
            isCorrect={isCorrect}
            correctAnswerId={correctAnswerId}
            answers={flashcard.answers}
          />
        )}
      </div>

      {reviewMode && shouldShowDifficulty && (
        <DifficultyRatingButtons onRatingSelect={handleDifficultySelect} />
      )}

      {!reviewMode && (
        <FlashcardViewerActions
          showResult={showResult}
          onReset={handleReset}
          onClose={onClose}
        />
      )}
    </div>
  )
}
