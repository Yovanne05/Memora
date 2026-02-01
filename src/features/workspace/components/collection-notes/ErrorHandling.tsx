import { memo } from 'react'
import { CollectionNotesError } from './CollectionNotesError'
import { ApiError } from '@/lib/errors'

interface ErrorHandlingProps {
  collectionError: unknown
  isCollectionError: boolean
  isNotesError: boolean
  notesError: Error | null
}

export const ErrorHandling = memo(function ErrorHandling({
  collectionError,
  isCollectionError,
  isNotesError,
  notesError,
}: Readonly<ErrorHandlingProps>) {
  const collectionErrorMessage =
    collectionError instanceof Error ? collectionError.message : ''
  const normalizedMessage = collectionErrorMessage.toLowerCase()
  const hasPermissionHint =
    normalizedMessage.includes('permission') ||
    normalizedMessage.includes('acces')
  const isPermissionError =
    (collectionError instanceof ApiError &&
      (collectionError.status === 403 ||
        collectionError.status === 500 ||
        hasPermissionHint)) ||
    (collectionError instanceof Error && hasPermissionHint)

  if (collectionError && isPermissionError) {
    return (
      <CollectionNotesError
        title="Acces refuse"
        message="Vous n'avez pas acces aux donnees de cette collection."
      />
    )
  }

  if (isCollectionError) {
    return <CollectionNotesError title="Collection introuvable" />
  }

  if (isNotesError) {
    return (
      <CollectionNotesError
        title="Erreur lors du chargement des notes"
        message={
          notesError instanceof Error
            ? notesError.message
            : 'Une erreur est survenue'
        }
      />
    )
  }

  return null
})
