import { useQuery } from '@tanstack/react-query'
import { calculateUserPermission } from '@/lib/permissions'
import { defaultQueryConfig } from '@/lib/query-config'
import { logger } from '@/lib/logger'
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

      if (dto.collection_id && !dto.collection_permission) {
        try {
          const collectionDto = await httpClient.get<CollectionDto>(
            `/collections/${dto.collection_id}`
          )

          const collectionPermission = calculateUserPermission({
            userId: user?.id,
            userPermission: collectionDto.user_permission,
            userAccess: collectionDto.user_access?.map((access) => ({
              userId: access.user_id,
              permission: access.permission,
            })),
            parentPermission: null,
          })

          dto.collection_permission = collectionPermission ?? null
        } catch (error) {
          logger.warn('Failed to fetch collection permission', error)
        }
      }

      return dtoToNote(dto, user?.id)
    },
    ...defaultQueryConfig,
    enabled: Boolean(noteId),
  })
}
