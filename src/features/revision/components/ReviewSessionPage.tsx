import { FlashcardViewer } from '@/features/flashcards/components/FlashcardViewer'
import { useFlashcardQuery } from '@/features/flashcards/hooks/useFlashcardQuery'
import { ReviewCompletionScreen } from './ReviewCompletionScreen'
import { SessionHeader } from './session/SessionHeader'
import { SessionProgress } from './session/SessionProgress'
import { SessionLoadingState } from './session/SessionLoadingState'
import { useReviewSession } from '../hooks/useReviewSession'

export function ReviewSessionPage() {
  const {
    currentIndex,
    currentFlashcardId,
    flashcardQueue,
    reviewStats,
    isComplete,
    reviewResult,
    isLoadingReviews,
    handleReviewSubmit,
    handleExit,
  } = useReviewSession()

  const { data: flashcard, isLoading: isLoadingFlashcard } = useFlashcardQuery(
    currentFlashcardId ?? '',
    { enabled: !!currentFlashcardId }
  )

  if (isLoadingReviews) {
    return <SessionLoadingState message="Chargement des révisions..." />
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
    return <SessionLoadingState message="Chargement de la flashcard..." />
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <SessionHeader
        currentIndex={currentIndex}
        totalCount={flashcardQueue.length}
        onExit={handleExit}
      />

      <SessionProgress current={currentIndex} total={flashcardQueue.length} />

      <FlashcardViewer
        flashcard={flashcard}
        reviewMode={true}
        onReviewSubmit={handleReviewSubmit}
        reviewResult={reviewResult}
      />
    </div>
  )
}
