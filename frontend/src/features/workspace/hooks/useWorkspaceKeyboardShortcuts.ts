import { useEffect } from 'react'
import { useWorkspaceContext } from '../context'

function isEditableElement(element: HTMLElement): boolean {
  return (
    element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.isContentEditable
  )
}

function isSearchInput(element: HTMLElement): boolean {
  return (
    element.tagName === 'INPUT' && element.getAttribute('type') === 'search'
  )
}

function focusSearchInput(): void {
  const searchInput = document.querySelector(
    'input[type="search"]'
  ) as HTMLInputElement
  if (searchInput) {
    searchInput.focus()
  }
}

function focusAndSelectSearchInput(): void {
  const searchInput = document.querySelector(
    'input[type="search"]'
  ) as HTMLInputElement
  if (searchInput) {
    searchInput.focus()
    searchInput.select()
  }
}

function getModifierKey(isMac: boolean, event: KeyboardEvent): boolean {
  return isMac ? event.metaKey : event.ctrlKey
}

export function useWorkspaceKeyboardShortcuts() {
  const { actions } = useWorkspaceContext()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement

      if (isEditableElement(target)) {
        if (e.key === 'Escape' && isSearchInput(target)) {
          e.preventDefault()
          actions.setSearch('')
          target.blur()
        }
        return
      }

      const isMac = navigator.userAgent.toUpperCase().includes('MAC')
      const modifier = getModifierKey(isMac, e)

      if (modifier && e.key === 'n' && !e.shiftKey) {
        e.preventDefault()
        actions.openCreateNote()
        return
      }

      if (modifier && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        actions.openCreateCollection()
        return
      }

      if (modifier && e.key === 'k') {
        e.preventDefault()
        focusAndSelectSearchInput()
        return
      }

      if (e.key === '/') {
        e.preventDefault()
        focusSearchInput()
        return
      }

      if (modifier && e.key === 'g') {
        e.preventDefault()
        actions.openGraphView()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [actions])
}
