import { useEffect } from "react"

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault()
          shortcut.action()
          return
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, enabled])
}

export function useWorkspaceKeyboardShortcuts(callbacks: {
  onNewNote?: () => void
  onNewCollection?: () => void
  onSearch?: () => void
  onToggleSelection?: () => void
  onSelectAll?: () => void
  onEscape?: () => void
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: "n",
      ctrl: true,
      description: "Créer une nouvelle note",
      action: () => callbacks.onNewNote?.()
    },
    {
      key: "k",
      ctrl: true,
      description: "Créer une nouvelle collection",
      action: () => callbacks.onNewCollection?.()
    },
    {
      key: "f",
      ctrl: true,
      description: "Rechercher",
      action: () => callbacks.onSearch?.()
    },
    {
      key: "a",
      ctrl: true,
      description: "Tout sélectionner",
      action: () => callbacks.onSelectAll?.()
    },
    {
      key: "d",
      ctrl: true,
      description: "Activer/désactiver le mode sélection",
      action: () => callbacks.onToggleSelection?.()
    },
    {
      key: "Escape",
      description: "Annuler/Fermer",
      action: () => callbacks.onEscape?.()
    }
  ]

  useKeyboardShortcuts(shortcuts)
}
