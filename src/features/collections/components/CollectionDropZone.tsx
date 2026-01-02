import { useState } from "react"
import { FolderInput } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useUpdateNoteMutation } from "@/features/notes/hooks/useUpdateNoteMutation"
import type { Collection } from "../models/collection.model"

interface CollectionDropZoneProps {
  readonly collection: Collection
  readonly onDrop?: () => void
  readonly children: React.ReactNode
  readonly className?: string
}

interface DragData {
  noteId: string
  noteTitle: string
  currentCollectionId: string | null
}

export function CollectionDropZone({
  collection,
  onDrop,
  children,
  className
}: Readonly<CollectionDropZoneProps>) {
  const [isOver, setIsOver] = useState(false)
  const updateMutation = useUpdateNoteMutation({ onSuccess: onDrop })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setIsOver(true)
  }

  const handleDragLeave = () => {
    setIsOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)

    try {
      const data = e.dataTransfer.getData("application/json")
      if (!data) return

      const dragData: DragData = JSON.parse(data)

      if (dragData.currentCollectionId === collection.id) {
        toast.info("La note est déjà dans cette collection")
        return
      }

      await updateMutation.mutateAsync({
        noteId: dragData.noteId,
        payload: { collectionId: collection.id }
      })

      toast.success(`"${dragData.noteTitle}" déplacée vers "${collection.name}"`)
    } catch (error) {
      console.error("Erreur lors du déplacement:", error)
      toast.error("Erreur lors du déplacement de la note")
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative transition-all",
        isOver && "ring-2 ring-primary ring-offset-2 bg-primary/5",
        className
      )}
    >
      {isOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm rounded-lg border-2 border-dashed border-primary pointer-events-none">
          <div className="flex items-center gap-2 text-primary font-medium">
            <FolderInput className="h-5 w-5" />
            Déposer dans "{collection.name}"
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
