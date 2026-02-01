interface SessionLoadingStateProps {
  readonly message: string
}

export function SessionLoadingState({
  message,
}: Readonly<SessionLoadingStateProps>) {
  return (
    <div className="flex items-center justify-center min-h-100">
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
