type CollectionNotesErrorProps = {
  title: string
  message?: string
}

export function CollectionNotesError({ title, message }: Readonly<CollectionNotesErrorProps>) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <p className="text-destructive">{title}</p>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
