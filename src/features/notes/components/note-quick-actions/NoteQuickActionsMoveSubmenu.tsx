import { Folder, FolderInput, FolderMinus } from 'lucide-react'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import type { Note } from '../../models/note.model'
import type { Collection } from '@/features/collections/models/collection.model'

type NoteQuickActionsMoveSubmenuProps = {
  note: Note
  collections: Collection[]
  isPending: boolean
  onMoveToCollection: (collectionId: string | null) => void
}

export function NoteQuickActionsMoveSubmenu({
  note,
  collections,
  isPending,
  onMoveToCollection,
}: Readonly<NoteQuickActionsMoveSubmenuProps>) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={isPending}>
        <FolderInput className="h-4 w-4" />
        Déplacer vers
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
        {note.collectionId && (
          <>
            <DropdownMenuItem
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onMoveToCollection(null)
              }}
            >
              <FolderMinus className="h-4 w-4" />
              Retirer de la collection
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {collections.length === 0 ? (
          <DropdownMenuItem disabled>
            Aucune collection disponible
          </DropdownMenuItem>
        ) : (
          collections
            .filter((collection) => collection.id !== note.collectionId)
            .map((collection) => (
              <DropdownMenuItem
                key={collection.id}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onMoveToCollection(collection.id)
                }}
              >
                <Folder className="h-4 w-4" />
                {collection.name}
              </DropdownMenuItem>
            ))
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
