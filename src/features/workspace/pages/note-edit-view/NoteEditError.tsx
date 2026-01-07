export function NoteEditError() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <p className="text-destructive">Note introuvable</p>
      <p className="text-sm text-muted-foreground">
        Cette note n'existe pas ou vous n'avez pas accès à celle-ci.
      </p>
    </div>
  )
}
