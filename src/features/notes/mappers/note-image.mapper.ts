import type { NoteImageDto } from "../dtos/note-image.dto"
import type { NoteImage } from "../models/note-image.model"

export function mapNoteImageDtoToModel(dto: NoteImageDto): NoteImage {
  return {
    url: dto.url,
  }
}
