import { useQuery } from '@tanstack/react-query'
import type { Note } from '../models/note.model'
import { NOTES_QUERY_KEYS } from './notes.keys'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { dtoToNote } from '../mappers/note.mapper'
import { httpClient } from '@/lib/http-client'
import type { NoteDto } from '../dtos/note.dto'
import type { CollectionDto } from '@/features/collections/dtos/collection.dto'

export function useNoteQuery(noteId: string) {
  const { user } = useAuth()

  return useQuery<Note>({
    queryKey: NOTES_QUERY_KEYS.detail(noteId),
    queryFn: async () => {
      const dto = await httpClient.get<NoteDto>(`/notes/${noteId}`)

      // Si la note fait partie d'une collection et n'a pas de collection_permission,
      // charger la collection pour récupérer la permission
      if (dto.collection_id && !dto.collection_permission) {
        try {
          const collectionDto = await httpClient.get<CollectionDto>(
            `/collections/${dto.collection_id}`
          )

          // Extraire la permission depuis user_permission ou user_access
          let collectionPermission = collectionDto.user_permission
          if (!collectionPermission && collectionDto.user_access && user?.id) {
            const userAccess = collectionDto.user_access.find(
              (access) => access.user_id === user.id
            )
            collectionPermission = userAccess?.permission ?? null
          }

          // Injecter la permission de la collection dans la note
          dto.collection_permission = collectionPermission ?? null
        } catch (error) {
          console.warn('Failed to fetch collection permission:', error)
        }
      }

      return dtoToNote(dto, user?.id)
    },
    retry: 1,
    enabled: Boolean(noteId),
  })
}
