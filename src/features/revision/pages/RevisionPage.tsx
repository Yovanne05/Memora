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
    navigate({ to: '/app/review/session' })
  }

  if (isLoading) {
    return (
      <div className="container max-w-full px-4 mx-auto py-4 sm:max-w-2xl sm:py-6 md:max-w-4xl md:py-8">
        <p>Chargement des révisions...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-full px-4 mx-auto py-4 space-y-4 sm:max-w-2xl sm:py-6 sm:space-y-6 md:max-w-4xl md:py-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Révisions</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Révisez vos flashcards avec la répétition espacée
        </p>
      </div>

      {totalReviewsCount > 0 ? (
        <>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {totalReviewsCount} flashcard
                    {totalReviewsCount > 1 ? 's' : ''} à réviser
                  </h2>
                  {todayCount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {todayCount} à réviser aujourd'hui
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleStartSession}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Commencer la session →
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-semibold mb-4">
              Révisions à venir par date
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
            <div className="text-6xl"></div>
            <h2 className="text-2xl font-bold">Tout est à jour !</h2>
            <p className="text-muted-foreground">
              Aucune révision planifiée. Créez des flashcards pour commencer à
              apprendre !
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
