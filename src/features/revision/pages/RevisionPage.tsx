import { useNavigate } from '@tanstack/react-router'
import { useUpcomingReviewsQuery } from '../hooks/useUpcomingReviewsQuery'
import { UpcomingReviewsList } from '../components/UpcomingReviewsList'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function RevisionPage() {
  const navigate = useNavigate()
  const { data: upcomingReviews, isLoading } = useUpcomingReviewsQuery()

  const totalReviewsCount =
    upcomingReviews?.reduce((sum, group) => sum + group.flashcards.length, 0) ??
    0

  const todayReviews = upcomingReviews?.find((group) => {
    const today = new Date().toISOString().split('T')[0]
    return group.date === today
  })

  const todayCount = todayReviews?.flashcards.length ?? 0

  const handleStartSession = () => {
    navigate({ to: '/app/revision/session' })
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <p>Loading reviews...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground">
          Review your flashcards with spaced repetition
        </p>
      </div>

      {totalReviewsCount > 0 ? (
        <>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    📚 {totalReviewsCount} flashcard
                    {totalReviewsCount > 1 ? 's' : ''} due
                  </h2>
                  {todayCount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {todayCount} due today
                    </p>
                  )}
                </div>
                <Button onClick={handleStartSession} size="lg">
                  Start Review Session →
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-semibold mb-4">
              Upcoming Reviews by Date
            </h2>
            <UpcomingReviewsList
              groups={upcomingReviews ?? []}
              isLoading={isLoading}
            />
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold">All caught up!</h2>
            <p className="text-muted-foreground">
              No reviews scheduled. Create flashcards to start learning!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
