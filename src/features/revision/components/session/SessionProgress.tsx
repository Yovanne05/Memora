interface SessionProgressProps {
  readonly current: number
  readonly total: number
}

export function SessionProgress({
  current,
  total,
}: Readonly<SessionProgressProps>) {
  return (
    <progress
      className="w-full h-2.5 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-value]:transition-all [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary"
      value={current + 1}
      max={total}
      aria-label={`Progression: ${current + 1} sur ${total}`}
    />
  )
}
