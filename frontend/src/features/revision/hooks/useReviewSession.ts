import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useUpcomingReviewsQuery } from './useUpcomingReviewsQuery'
import { useReviewMutation } from './useReviewMutation'
import type { ReviewDifficulty } from '../types/difficulty'
import { logger } from '@/lib/logger'

interface ReviewStats {
  correct: number
  incorrect: number
}

interface ReviewResult {
  isCorrect: boolean
  correctAnswerId: string
}

export function useReviewSession() {
  const navigate = useNavigate()
  const { data: upcomingReviews, isLoading: isLoadingReviews } =
    useUpcomingReviewsQuery()
  const reviewMutation = useReviewMutation()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    correct: 0,
    incorrect: 0,
  })
  const [isComplete, setIsComplete] = useState(false)
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null)

  const flashcardQueue = useMemo(() => {
    if (!upcomingReviews) {
      return []
    }

    return upcomingReviews.flatMap((group) =>
      group.flashcards.map((fc) => fc.flashcardId)
    )
  }, [upcomingReviews])

  const currentFlashcardId = flashcardQueue[currentIndex]

  // Rediriger si aucune flashcard à réviser
  useEffect(() => {
    if (upcomingReviews && flashcardQueue.length === 0) {
      navigate({ to: '/app/review' })
    }
  }, [upcomingReviews, flashcardQueue.length, navigate])

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

      setReviewResult({
        isCorrect: review.isCorrect,
        correctAnswerId: review.correctAnswerId,
      })

      setReviewStats((prev) => ({
        correct: prev.correct + (review.isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (review.isCorrect ? 0 : 1),
      }))

      // Passer à la flashcard suivante après 1.5s
      setTimeout(() => {
        setReviewResult(null)
        if (currentIndex + 1 < flashcardQueue.length) {
          setCurrentIndex((prev) => prev + 1)
        } else {
          setIsComplete(true)
        }
      }, 1500)
    } catch (error) {
      logger.error('Échec de la soumission de la révision', error)
    }
  }

  const handleExit = () => {
    navigate({ to: '/app/review' })
  }

  return {
    currentIndex,
    currentFlashcardId,
    flashcardQueue,
    reviewStats,
    isComplete,
    reviewResult,
    isLoadingReviews,
    handleReviewSubmit,
    handleExit,
  }
}
