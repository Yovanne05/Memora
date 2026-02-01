import { useCallback, useState } from "react"

interface UseNoteSidebarResult {
  isOpen: boolean
  activeNoteId: string | null
  openWithNote: (noteId: string) => void
  close: () => void
}

export function useNoteSidebar(): UseNoteSidebarResult {
  const [isOpen, setIsOpen] = useState(false)
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)

  const openWithNote = useCallback((noteId: string) => {
    setActiveNoteId(noteId)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setActiveNoteId(null)
  }, [])

  return {
    isOpen,
    activeNoteId,
    openWithNote,
    close,
  }
}
