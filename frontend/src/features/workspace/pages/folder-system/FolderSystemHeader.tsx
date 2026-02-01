import { ActionBar } from '../../components/ActionBar'

interface FolderSystemHeaderProps {
  onCreateNote: () => void
  onCreateCollection: () => void
}

export function FolderSystemHeader({
  onCreateNote,
  onCreateCollection,
}: Readonly<FolderSystemHeaderProps>) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Espace de travail</h1>
      <ActionBar
        onCreateNote={onCreateNote}
        onCreateCollection={onCreateCollection}
        variant="workspace"
      />
    </div>
  )
}
