import { Button } from '@/components/ui/button'
import { ReviewDifficulty } from '../types/difficulty'

interface DifficultyRatingButtonsProps {
  onRatingSelect: (difficulty: ReviewDifficulty) => void
  disabled?: boolean
}

export function DifficultyRatingButtons({
  onRatingSelect,
  disabled = false,
}: Readonly<DifficultyRatingButtonsProps>) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-sm text-muted-foreground mb-2">
        How difficult was this flashcard?
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="destructive"
          onClick={() => onRatingSelect(ReviewDifficulty.AGAIN)}
          disabled={disabled}
          className="w-full"
        >
          Again
        </Button>
        <Button
          variant="outline"
          onClick={() => onRatingSelect(ReviewDifficulty.HARD)}
          disabled={disabled}
          className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
        >
          Hard
        </Button>
        <Button
          variant="default"
          onClick={() => onRatingSelect(ReviewDifficulty.GOOD)}
          disabled={disabled}
          className="w-full"
        >
          Good
        </Button>
        <Button
          variant="outline"
          onClick={() => onRatingSelect(ReviewDifficulty.EASY)}
          disabled={disabled}
          className="w-full border-green-500 text-green-600 hover:bg-green-50"
        >
          Easy
        </Button>
      </div>
    </div>
  )
}
