import type { UpcomingReviewGroup } from '../models/review'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UpcomingReviewsListProps {
  groups: UpcomingReviewGroup[]
  isLoading?: boolean
}

export function UpcomingReviewsList({
  groups,
  isLoading = false,
}: Readonly<UpcomingReviewsListProps>) {
  if (isLoading) {
    return <p className="text-muted-foreground">Chargement des révisions...</p>
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Aucune révision planifiée pour le moment. Complétez des flashcards
            pour commencer à réviser !
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <Card key={group.date}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>📅</span>
              <span>{formatReviewDate(group.date)}</span>
              <span className="text-sm text-muted-foreground font-normal">
                ({group.flashcards.length} révision
                {group.flashcards.length > 1 ? 's' : ''})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {group.flashcards.map((flashcard) => (
                <li
                  key={flashcard.flashcardId}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <div className="flex-1">
                    <p className="line-clamp-2">{flashcard.question}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatReviewDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dateOnly = dateString.split('T')[0]
  const todayOnly = today.toISOString().split('T')[0]
  const tomorrowOnly = tomorrow.toISOString().split('T')[0]

  if (dateOnly === todayOnly) {
    return "Aujourd'hui"
  } else if (dateOnly === tomorrowOnly) {
    return 'Demain'
  } else {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}
