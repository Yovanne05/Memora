import type {
  CollabSessionDto,
  CollabSessionPayloadDto,
} from '../dtos/collab-session.dto'
import { collabSessionDtoSchema } from '../dtos/collab-session.dto'
import { httpClient, type HttpClient } from '@/lib/http-client'

export interface ICollabService {
  createSession(noteId: string): Promise<CollabSessionDto>
}

export function createCollabService(
  client: HttpClient = httpClient
): ICollabService {
  return {
    async createSession(noteId: string): Promise<CollabSessionDto> {
      const dto = await client.post<CollabSessionDto, CollabSessionPayloadDto>(
        '/collaboration/sessions',
        { note_id: noteId }
      )
      return collabSessionDtoSchema.parse(dto)
    },
  }
}

export const collabService = createCollabService()
