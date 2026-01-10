import { QuickAddNote } from '@/features/notes/components/QuickAddNote'

type CollectionNotesEmptyProps = {
  collectionId: string
  canAddNote: boolean
}

export function CollectionNotesEmpty({
  collectionId,
  canAddNote,
}: Readonly<CollectionNotesEmptyProps>) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <div className="text-center">
        <p className="text-lg font-medium">Aucune note dans cette collection</p>
        <p className="text-sm text-muted-foreground mt-1">
          Créez votre première note pour commencer
        </p>
      </div>
      <QuickAddNote
        collectionId={collectionId}
        triggerVariant="default"
        triggerSize="lg"
        showLabel
        disabled={!canAddNote}
      />
    </div>
  )
}
