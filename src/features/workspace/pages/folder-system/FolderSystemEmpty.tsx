export function FolderSystemEmpty() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <p className="text-lg font-medium">Votre espace de travail est vide</p>
      <p className="text-sm text-muted-foreground">
        Créez votre première note ou collection pour commencer
      </p>
    </div>
  )
}
