import { Button } from '@/components/ui/button'
import { ReviewDifficulty } from '../types/difficulty'

interface DifficultyRatingButtonsProps {
  readonly onRatingSelect: (difficulty: ReviewDifficulty) => void
  readonly disabled?: boolean
}

export function DifficultyRatingButtons({
  onRatingSelect,
  disabled = false,
}: Readonly<DifficultyRatingButtonsProps>) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-sm text-muted-foreground mb-2">
        Quelle était la difficulté de cette flashcard ?
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="destructive"
          onClick={() => onRatingSelect(ReviewDifficulty.AGAIN)}
          disabled={disabled}
          className="w-full"
        >
          À revoir
        </Button>
        <Button
          variant="outline"
          onClick={() => onRatingSelect(ReviewDifficulty.HARD)}
          disabled={disabled}
          className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
        >
          Difficile
        </Button>
        <Button
          variant="default"
          onClick={() => onRatingSelect(ReviewDifficulty.GOOD)}
          disabled={disabled}
          className="w-full"
        >
          Bien
        </Button>
        <Button
          variant="outline"
          onClick={() => onRatingSelect(ReviewDifficulty.EASY)}
          disabled={disabled}
          className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
        >
          Facile
        </Button>
      </div>
    </div>
  )
}
