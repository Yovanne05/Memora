import { useQuery } from '@tanstack/react-query'
import type { Note } from '../models/note.model'
import { NOTES_QUERY_KEYS } from './notes.keys'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { dtoToNote } from '../mappers/note.mapper'
import { httpClient } from '@/lib/http-client'
import type { NoteDto } from '../dtos/note.dto'

export function useNoteQuery(noteId: string) {
  const { user } = useAuth()

  return useQuery<Note>({
    queryKey: NOTES_QUERY_KEYS.detail(noteId),
    queryFn: async () => {
      const dto = await httpClient.get<NoteDto>(`/notes/${noteId}`)
      return dtoToNote(dto, user?.id)
    },
    retry: 1,
    enabled: Boolean(noteId),
  })
}
