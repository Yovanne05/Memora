import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CompletionStats } from './session/CompletionStats'
import { getMotivationalMessage } from '../lib/motivational-messages'

interface ReviewCompletionScreenProps {
  readonly totalReviews: number
  readonly correctCount: number
  readonly incorrectCount: number
  readonly onBack: () => void
}

export function ReviewCompletionScreen({
  totalReviews,
  correctCount,
  incorrectCount,
  onBack,
}: Readonly<ReviewCompletionScreenProps>) {
  const accuracy =
    totalReviews > 0 ? Math.round((correctCount / totalReviews) * 100) : 0

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🎉 Session de révision terminée !
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              Bravo ! Vous avez terminé {totalReviews} flashcard
              {totalReviews > 1 ? 's' : ''}.
            </p>

            <CompletionStats
              totalReviews={totalReviews}
              correctCount={correctCount}
              incorrectCount={incorrectCount}
              accuracy={accuracy}
            />

            <p className="text-sm text-muted-foreground italic">
              {getMotivationalMessage(accuracy)}
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={onBack} size="lg">
              Retour aux révisions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
