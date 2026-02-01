import type { NoteImageDto } from '../dtos/note-image.dto'
import { noteImageDtoSchema } from '../dtos/note-image.dto'
import { mapNoteImageDtoToModel } from '../mappers/note-image.mapper'
import type {
  NoteImage,
  NoteImageUploadPayload,
} from '../models/note-image.model'
import type { INoteImagesService } from './note-images.service.interface'
import { config } from '@/lib/config'
import { applyInterceptors } from '@/lib/interceptors'
import { ApiError } from '@/lib/errors'
import { parseError, normalizeError } from '@/lib/error-handler'

const DEFAULT_TIMEOUT = 30000 // 30 seconds for file uploads

async function uploadWithTimeout(
  promise: Promise<Response>,
  timeout: number
): Promise<Response> {
  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout)
  })

  return Promise.race([promise, timeoutPromise])
}

function normalizeImageUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const baseUrl = config.apiUrl.replace(/\/$/, '')
  const path = url.startsWith('/') ? url : `/${url}`
  return `${baseUrl}${path}`
}

export function createNoteImagesService(): INoteImagesService {
  return {
    async upload(payload: NoteImageUploadPayload): Promise<NoteImage> {
      try {
        const formData = new FormData()
        formData.append('image', payload.file)

        const requestConfig = await applyInterceptors({
          method: 'POST',
          body: formData,
        })

        const response = await uploadWithTimeout(
          fetch(
            `${config.apiUrl}/notes/${payload.noteId}/attachments`,
            requestConfig
          ),
          DEFAULT_TIMEOUT
        )

        if (!response.ok) {
          throw new ApiError(await parseError(response), response.status)
        }

        const data = await response.json()
        const dto = noteImageDtoSchema.parse(data)

        const normalizedDto: NoteImageDto = {
          ...dto,
          url: normalizeImageUrl(dto.url),
        }

        return mapNoteImageDtoToModel(normalizedDto)
      } catch (error) {
        normalizeError(error)
      }
    },
  }
}

export const noteImagesService = createNoteImagesService()
export type { INoteImagesService as NoteImagesService } from './note-images.service.interface'
