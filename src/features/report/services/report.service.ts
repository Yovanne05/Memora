import { httpClient, type HttpClient } from '@/lib/http-client'
import type {
  ReportCreateDto,
  ReportDto,
  ReportListDto,
  ReportUpdateDto,
} from '../dtos/report.dto'
import {
  dtoToReport,
  reportCreateToDto,
  reportUpdateToDto,
} from '../mappers/report'
import type { ReportCreate, ReportUpdate } from '../models/report'
import type { PaginatedReports } from '../types/paginated-report'
import type { ReportsFilters } from '../types/report-query'
import type { IReportsService } from './report.service.interface'

export function createReportsService(
  client: HttpClient = httpClient
): IReportsService {
  return {
    async list(params?: ReportsFilters): Promise<PaginatedReports> {
      const data = await client.get<ReportListDto>('/reports', {
        params: mapReportsFilters(params),
      })
      const items = data?.items ?? []

      return {
        items: items.map(dtoToReport),
        total: data?.total ?? items.length,
        offset: params?.offset ?? 0,
        limit: params?.limit ?? 50,
      }
    },

    async get(id: string) {
      const dto = await client.get<ReportDto>(`/reports/${id}`)
      return dtoToReport(dto)
    },

    async reportNote(noteId: string, payload: ReportCreate) {
      const dto = await client.post<ReportDto, ReportCreateDto>(
        `/notes/${noteId}/reports`,
        reportCreateToDto(payload)
      )
      return dtoToReport(dto)
    },

    async reportCollection(collectionId: string, payload: ReportCreate) {
      const dto = await client.post<ReportDto, ReportCreateDto>(
        `/collections/${collectionId}/reports`,
        reportCreateToDto(payload)
      )
      return dtoToReport(dto)
    },

    async update(id: string, payload: ReportUpdate) {
      const dto = await client.patch<ReportDto, ReportUpdateDto>(
        `/reports/${id}`,
        reportUpdateToDto(payload)
      )
      return dtoToReport(dto)
    },
  }
}

export const reportsService = createReportsService()
export type { IReportsService as ReportsService } from './report.service.interface'

function mapReportsFilters(
  params?: ReportsFilters
): ReportsFilters | undefined {
  if (!params) return params

  const {
    targetType,
    reporterId,
    noteId,
    collectionId,
    sortBy,
    sortDir,
    ...rest
  } = params

  const mapped: ReportsFilters = { ...rest }

  if (targetType) mapped.target_type = targetType
  if (reporterId) mapped.reporter_id = reporterId
  if (noteId) mapped.note_id = noteId
  if (collectionId) mapped.collection_id = collectionId
  if (sortBy) mapped.sort_by = sortBy
  if (sortDir) mapped.sort_dir = sortDir

  return mapped
}
