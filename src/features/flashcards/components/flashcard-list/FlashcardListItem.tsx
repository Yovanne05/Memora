import { memo } from 'react'
import { ChevronDown, ChevronUp, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Flashcard } from '../../models/flashcard.model'
import { FlashcardViewer } from '../FlashcardViewer'
import type { ReviewDifficulty } from '@/features/revision/types/difficulty'
import { cn } from '@/lib/utils'

interface FlashcardListItemProps {
  flashcard: Flashcard
  isExpanded: boolean
  reviewResult: { isCorrect: boolean; correctAnswerId: string } | null
  onToggle: () => void
  onReviewSubmit: (difficulty: ReviewDifficulty, selectedAnswerId: string) => void
}

export const FlashcardListItem = memo(function FlashcardListItem({
  flashcard,
  isExpanded,
  reviewResult,
  onToggle,
  onReviewSubmit,
}: Readonly<FlashcardListItemProps>) {
  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        isExpanded ? 'border-primary bg-card' : 'border-border bg-card/50'
      )}
    >
      <div className="w-full text-left p-3 flex items-center justify-between gap-3 rounded-lg">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity text-left"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{flashcard.question}</p>
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
          onClick={onToggle}
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
            onClose={onToggle}
            reviewMode={true}
            onReviewSubmit={onReviewSubmit}
            reviewResult={reviewResult}
          />
        </div>
      )}
    </div>
  )
})
