import { httpClient } from "@/lib/http-client";
import type { IFlashcardsService } from "./flashcards.service.interface";
import type {
  Flashcard,
  FlashcardCreate,
  FlashcardUpdate,
  FlashcardDuplicate,
} from "../models/flashcard.model";
import type { PaginatedFlashcards } from "../types/paginated-flashcard";
import type { FlashcardsQuery } from "../types/flashcard-query";
import {
  flashcardDtoSchema,
  flashcardsListDtoSchema,
  type FlashcardDto,
  type FlashcardsListDto,
  type FlashcardCreateDto,
  type FlashcardUpdateDto,
  type FlashcardDuplicateDto,
} from "../dtos/flashcard.dto";
import {
  dtoToFlashcard,
  dtoToPaginatedFlashcards,
  toFlashcardCreateDto,
  toFlashcardUpdateDto,
  toFlashcardDuplicateDto,
} from "../mappers/flashcard.mapper";

class FlashcardsService implements IFlashcardsService {
  async list(query?: FlashcardsQuery): Promise<PaginatedFlashcards> {
    const params: Record<string, string | number | undefined> = {};

    if (query?.noteId) params.noteId = query.noteId;
    if (query?.questionContains) params.questionContains = query.questionContains;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortDir) params.sortDir = query.sortDir;
    if (query?.limit !== undefined) params.limit = query.limit;
    if (query?.offset !== undefined) params.offset = query.offset;

    const dto = await httpClient.get<FlashcardsListDto>("/flashcards", { params });
    const validated = flashcardsListDtoSchema.parse(dto);
    return dtoToPaginatedFlashcards(validated);
  }

  async getById(id: string): Promise<Flashcard> {
    const dto = await httpClient.get<FlashcardDto>(`/flashcards/${id}`);
    const validated = flashcardDtoSchema.parse(dto);
    return dtoToFlashcard(validated);
  }

  async create(flashcard: FlashcardCreate): Promise<Flashcard> {
    const payload = toFlashcardCreateDto(flashcard);
    const dto = await httpClient.post<FlashcardDto, FlashcardCreateDto>(
      "/flashcards",
      payload
    );
    const validated = flashcardDtoSchema.parse(dto);
    return dtoToFlashcard(validated);
  }

  async update(id: string, flashcard: FlashcardUpdate): Promise<Flashcard> {
    const payload = toFlashcardUpdateDto(flashcard);
    const dto = await httpClient.patch<FlashcardDto, FlashcardUpdateDto>(
      `/flashcards/${id}`,
      payload
    );
    const validated = flashcardDtoSchema.parse(dto);
    return dtoToFlashcard(validated);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete<void>(`/flashcards/${id}`);
  }

  async duplicate(id: string, payload?: FlashcardDuplicate): Promise<Flashcard> {
    const duplicatePayload = payload ? toFlashcardDuplicateDto(payload) : undefined;
    const dto = await httpClient.post<FlashcardDto, FlashcardDuplicateDto | undefined>(
      `/flashcards/${id}/duplicate`,
      duplicatePayload
    );
    const validated = flashcardDtoSchema.parse(dto);
    return dtoToFlashcard(validated);
  }
}

export const flashcardsService = new FlashcardsService();
