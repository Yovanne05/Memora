import type { NoteImage, NoteImageUploadPayload } from "../models/note-image.model"

export interface INoteImagesService {
  upload(payload: NoteImageUploadPayload): Promise<NoteImage>
}
