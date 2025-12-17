export function NotesHeader({ total }: Readonly<{ total: number }>) {
  return (
    <header className="space-y-1">
      <h1 className="text-3xl font-semibold tracking-tight">Notes</h1>
      <p className="text-sm text-muted-foreground">
        Retrouvez l’ensemble de vos notes, triez et filtrez rapidement. {total} notes.
      </p>
    </header>
  )
}

