import type {
  ReportDto,
  ReportCreateDto,
  ReportUpdateDto,
} from '../dtos/report.dto'
import type { Report, ReportCreate, ReportUpdate } from '../models/report'

export function dtoToReport(dto: ReportDto): Report {
  return {
    id: dto.id,
    targetType: dto.target_type,
    noteId: dto.note_id ?? null,
    collectionId: dto.collection_id ?? null,
    reason: dto.reason,
    status: dto.status,
    description: dto.description ?? null,
    reporterId: dto.reporter_id,
    reporterEmail: dto.reporter_email ?? null,
    noteTitle: dto.note_title ?? null,
    collectionName: dto.collection_name ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

export function reportCreateToDto(payload: ReportCreate): ReportCreateDto {
  return {
    reason: payload.reason,
    description: payload.description ?? null,
  }
}

export function reportUpdateToDto(payload: ReportUpdate): ReportUpdateDto {
  return {
    status: payload.status,
    action: payload.action ?? null,
  }
}
