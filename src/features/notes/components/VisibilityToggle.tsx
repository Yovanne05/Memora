import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useUpdateNoteMutation } from "../hooks/useUpdateNoteMutation"
import type { Note, NoteVisibility } from "../models/note.model"

interface VisibilityToggleProps {
  readonly note: Note
  readonly onSuccess?: () => void
  readonly variant?: "default" | "outline" | "ghost"
  readonly size?: "default" | "sm" | "lg" | "icon"
  readonly showLabel?: boolean
}

export function VisibilityToggle({
  note,
  onSuccess,
  variant = "ghost",
  size = "sm",
  showLabel = false
}: Readonly<VisibilityToggleProps>) {
  const updateMutation = useUpdateNoteMutation({ onSuccess })

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newVisibility: NoteVisibility = note.visibility === "private" ? "public" : "private"

    await updateMutation.mutateAsync({
      noteId: note.id,
      payload: { visibility: newVisibility }
    })
  }

  const isPublic = note.visibility === "public"

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={updateMutation.isPending}
      className={showLabel ? "gap-2" : ""}
      title={isPublic ? "Rendre privée" : "Rendre publique"}
    >
      {isPublic ? (
        <>
          <Eye className="h-4 w-4" />
          {showLabel && "Publique"}
        </>
      ) : (
        <>
          <EyeOff className="h-4 w-4" />
          {showLabel && "Privée"}
        </>
      )}
    </Button>
  )
}
