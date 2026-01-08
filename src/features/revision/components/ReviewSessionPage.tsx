import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FlashcardViewer } from '@/features/flashcards/components/FlashcardViewer'
import { useFlashcardQuery } from '@/features/flashcards/hooks/useFlashcardQuery'
import { useUpcomingReviewsQuery } from '../hooks/useUpcomingReviewsQuery'
import { useReviewMutation } from '../hooks/useReviewMutation'
import type { ReviewDifficulty } from '../types/difficulty'
import { ReviewCompletionScreen } from './ReviewCompletionScreen'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

export function ReviewSessionPage() {
  const navigate = useNavigate()
  const { data: upcomingReviews, isLoading: isLoadingReviews } =
    useUpcomingReviewsQuery()
  const reviewMutation = useReviewMutation()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [reviewStats, setReviewStats] = useState({ correct: 0, incorrect: 0 })
  const [isComplete, setIsComplete] = useState(false)
  const [reviewResult, setReviewResult] = useState<{
    isCorrect: boolean
    correctAnswerId: string
  } | null>(null)

  const flashcardQueue = useMemo(() => {
    if (!upcomingReviews) {
      return []
    }

    return upcomingReviews.flatMap((group) =>
      group.flashcards.map((fc) => fc.flashcardId)
    )
  }, [upcomingReviews])

  // Build flashcard queue from upcoming reviews
  useEffect(() => {
    if (upcomingReviews && flashcardQueue.length === 0) {
      navigate({ to: '/app/revision' })
    }
  }, [upcomingReviews, flashcardQueue.length, navigate])

  const currentFlashcardId = flashcardQueue[currentIndex]
  const { data: flashcard, isLoading: isLoadingFlashcard } = useFlashcardQuery(
    currentFlashcardId ?? '',
    { enabled: !!currentFlashcardId }
  )

  const handleReviewSubmit = async (
    difficulty: ReviewDifficulty,
    selectedAnswerId: string
  ) => {
    if (!currentFlashcardId) return

    try {
      const review = await reviewMutation.mutateAsync({
        flashcardId: currentFlashcardId,
        selectedAnswerId,
        difficulty,
      })

      // Stocker le résultat de la review pour l'afficher
      setReviewResult({
        isCorrect: review.isCorrect,
        correctAnswerId: review.correctAnswerId,
      })

      // Update stats
      setReviewStats((prev) => ({
        correct: prev.correct + (review.isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (review.isCorrect ? 0 : 1),
      }))

      // Auto-advance after 1.5 seconds
      setTimeout(() => {
        setReviewResult(null) // Reset pour la prochaine flashcard
        if (currentIndex + 1 < flashcardQueue.length) {
          setCurrentIndex((prev) => prev + 1)
        } else {
          setIsComplete(true)
        }
      }, 1500)
    } catch (error) {
      logger.error('Failed to submit review', error)
    }
  }

  const handleExit = () => {
    navigate({ to: '/app/revision' })
  }

  if (isLoadingReviews) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loading reviews...</p>
      </div>
    )
  }

  if (isComplete) {
    return (
      <ReviewCompletionScreen
        totalReviews={flashcardQueue.length}
        correctCount={reviewStats.correct}
        incorrectCount={reviewStats.incorrect}
        onBack={handleExit}
      />
    )
  }

  if (isLoadingFlashcard || !flashcard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loading flashcard...</p>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / flashcardQueue.length) * 100

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review Session</h1>
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} / {flashcardQueue.length} flashcards
          </p>
        </div>
        <Button variant="outline" onClick={handleExit}>
          Exit Session
        </Button>
      </div>

      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <FlashcardViewer
        flashcard={flashcard}
        reviewMode={true}
        onReviewSubmit={handleReviewSubmit}
        reviewResult={reviewResult}
      />
    </div>
  )
}
