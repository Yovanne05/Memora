interface CompletionStatsProps {
  readonly totalReviews: number
  readonly correctCount: number
  readonly incorrectCount: number
  readonly accuracy: number
}

export function CompletionStats({
  totalReviews,
  correctCount,
  incorrectCount,
  accuracy,
}: Readonly<CompletionStatsProps>) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <div className="bg-muted rounded-lg p-4">
          <p className="text-3xl font-bold">{totalReviews}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {correctCount}
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">
            Correctes
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {incorrectCount}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">Incorrectes</p>
        </div>
      </div>

      <div className="bg-primary/10 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-4xl font-bold text-primary">{accuracy}%</p>
        <p className="text-sm text-muted-foreground">Précision</p>
      </div>
    </div>
  )
}
