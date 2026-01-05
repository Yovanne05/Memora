import { Editor } from '@tiptap/react'
import { useRef } from 'react'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { useUploadNoteImageMutation } from '@/features/notes/hooks/useUploadNoteImageMutation'
import { toast } from 'sonner'

interface ImageUploadButtonProps {
  editor: Editor
  noteId?: string
}

export function ImageUploadButton({ editor, noteId }: Readonly<ImageUploadButtonProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImageMutation = useUploadNoteImageMutation({
    silent: true,
    onSuccess: (data) => {
      editor.chain().focus().setImage({ src: data.url }).run()
      toast.success('Image uploadée avec succès')
    },
    onError: (error) => {
      toast.error(error.message || "L'upload de l'image a échoué")
    },
  })

  const handleImageClick = () => {
    if (!noteId) {
      toast.error("Veuillez d'abord enregistrer la note avant d'ajouter des images")
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !noteId) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("L'image est trop grande. Taille maximale: 5MB")
      return
    }

    uploadImageMutation.mutate({ noteId, file })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
      <Toggle
        size="sm"
        pressed={false}
        onPressedChange={handleImageClick}
        disabled={!noteId || uploadImageMutation.isPending}
        aria-label="Insérer une image"
      >
        {uploadImageMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </Toggle>
    </>
  )
}
