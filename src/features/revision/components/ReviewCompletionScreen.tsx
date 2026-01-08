import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ReviewCompletionScreenProps {
  totalReviews: number
  correctCount: number
  incorrectCount: number
  onBack: () => void
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
            🎉 Review Session Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              Great job! You've completed all {totalReviews} flashcard
              {totalReviews > 1 ? 's' : ''}.
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-3xl font-bold">{totalReviews}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-3xl font-bold text-green-600">
                  {correctCount}
                </p>
                <p className="text-sm text-green-700">Correct</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-3xl font-bold text-red-600">
                  {incorrectCount}
                </p>
                <p className="text-sm text-red-700">Incorrect</p>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-4xl font-bold text-primary">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>

            <p className="text-sm text-muted-foreground italic">
              {getMotivationalMessage(accuracy)}
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={onBack} size="lg">
              Back to Reviews
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getMotivationalMessage(accuracy: number): string {
  if (accuracy >= 90) {
    return "Outstanding! You're mastering this material! 🌟"
  } else if (accuracy >= 75) {
    return 'Great work! Keep up the excellent progress! 💪'
  } else if (accuracy >= 60) {
    return "Good effort! You're making solid progress! 📚"
  } else {
    return 'Keep practicing! Every review helps you improve! 🎯'
  }
}
