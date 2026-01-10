interface SessionProgressProps {
  readonly current: number
  readonly total: number
}

export function SessionProgress({
  current,
  total,
}: Readonly<SessionProgressProps>) {
  const progress = ((current + 1) / total) * 100

  return (
    <div className="w-full bg-muted rounded-full h-2.5">
      <div
        className="bg-primary h-2.5 rounded-full transition-all"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progression: ${current + 1} sur ${total}`}
      />
    </div>
  )
}
