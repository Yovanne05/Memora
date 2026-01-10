import { Button } from '@/components/ui/button'

interface SessionHeaderProps {
  readonly currentIndex: number
  readonly totalCount: number
  readonly onExit: () => void
}

export function SessionHeader({
  currentIndex,
  totalCount,
  onExit,
}: Readonly<SessionHeaderProps>) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Session de révision</h1>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {totalCount} flashcards
        </p>
      </div>
      <Button variant="outline" onClick={onExit}>
        Quitter la session
      </Button>
    </div>
  )
}
