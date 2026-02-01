import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createReportsService } from '@/features/report/services/report.service'
import type { HttpClient } from '@/lib/http-client'
import type { ReportDto } from '@/features/report/dtos/report.dto'
import type {
  ReportCreate,
  ReportUpdate,
} from '@/features/report/models/report'

const mockHttpClient: HttpClient = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  // @ts-expect-error - Test mock
  put: vi.fn(),
}

describe('report.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should fetch and transform reports list', async () => {
      const mockData = {
        items: [
          {
            id: '1',
            target_type: 'note' as const,
            note_id: 'note-1',
            reason: 'spam',
            status: 'pending',
            reporter_id: 'user-1',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      }
      vi.mocked(mockHttpClient.get).mockResolvedValue(mockData)

      const service = createReportsService(mockHttpClient)
      const result = await service.list()

      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.items[0].targetType).toBe('note')
    })

    it('should transform filter keys to snake_case', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({ items: [], total: 0 })

      const service = createReportsService(mockHttpClient)
      await service.list({ targetType: 'note', reporterId: 'user-1' })

      expect(mockHttpClient.get).toHaveBeenCalledWith('/reports', {
        params: { target_type: 'note', reporter_id: 'user-1' },
      })
    })

    it('should handle pagination params', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({ items: [], total: 0 })

      const service = createReportsService(mockHttpClient)
      const result = await service.list({ offset: 10, limit: 25 })

      expect(result.offset).toBe(10)
      expect(result.limit).toBe(25)
    })

    it('should use default pagination when not provided', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({ items: [], total: 0 })

      const service = createReportsService(mockHttpClient)
      const result = await service.list()

      expect(result.offset).toBe(0)
      expect(result.limit).toBe(50)
    })
  })

  describe('get', () => {
    it('should fetch single report', async () => {
      const mockDto: ReportDto = {
        id: '1',
        target_type: 'note',
        note_id: 'note-1',
        note_title: 'Test Note',
        reason: 'spam',
        status: 'pending',
        reporter_id: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      vi.mocked(mockHttpClient.get).mockResolvedValue(mockDto)

      const service = createReportsService(mockHttpClient)
      const result = await service.get('1')

      expect(mockHttpClient.get).toHaveBeenCalledWith('/reports/1')
      expect(result.id).toBe('1')
      expect(result.noteTitle).toBe('Test Note')
    })
  })

  describe('reportNote', () => {
    it('should create note report with correct payload', async () => {
      const payload: ReportCreate = {
        reason: 'spam',
        description: 'This is spam',
      }
      const mockDto: ReportDto = {
        id: '1',
        target_type: 'note',
        note_id: 'note-1',
        reason: 'spam',
        status: 'pending',
        reporter_id: 'user-1',
        description: 'This is spam',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      vi.mocked(mockHttpClient.post).mockResolvedValue(mockDto)

      const service = createReportsService(mockHttpClient)
      const result = await service.reportNote('note-1', payload)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/notes/note-1/reports',
        {
          reason: 'spam',
          description: 'This is spam',
        }
      )
      expect(result.noteId).toBe('note-1')
      expect(result.targetType).toBe('note')
    })

    it('should handle report without description', async () => {
      const payload: ReportCreate = {
        reason: 'spam',
      }
      const mockDto: ReportDto = {
        id: '1',
        target_type: 'note',
        note_id: 'note-1',
        reason: 'spam',
        status: 'pending',
        reporter_id: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      vi.mocked(mockHttpClient.post).mockResolvedValue(mockDto)

      const service = createReportsService(mockHttpClient)
      await service.reportNote('note-1', payload)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/notes/note-1/reports',
        {
          reason: 'spam',
          description: null,
        }
      )
    })
  })

  describe('reportCollection', () => {
    it('should create collection report with correct payload', async () => {
      const payload: ReportCreate = {
        reason: 'inappropriate_content',
        description: 'Bad content',
      }
      const mockDto: ReportDto = {
        id: '1',
        target_type: 'collection',
        collection_id: 'col-1',
        reason: 'inappropriate_content',
        status: 'pending',
        reporter_id: 'user-1',
        description: 'Bad content',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      vi.mocked(mockHttpClient.post).mockResolvedValue(mockDto)

      const service = createReportsService(mockHttpClient)
      const result = await service.reportCollection('col-1', payload)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/collections/col-1/reports',
        {
          reason: 'inappropriate_content',
          description: 'Bad content',
        }
      )
      expect(result.collectionId).toBe('col-1')
      expect(result.targetType).toBe('collection')
    })
  })

  describe('update', () => {
    it('should update report status', async () => {
      const payload: ReportUpdate = {
        status: 'resolved',
      }
      const mockDto: ReportDto = {
        id: '1',
        target_type: 'note',
        note_id: 'note-1',
        reason: 'spam',
        status: 'resolved',
        reporter_id: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }
      vi.mocked(mockHttpClient.patch).mockResolvedValue(mockDto)

      const service = createReportsService(mockHttpClient)
      const result = await service.update('1', payload)

      expect(mockHttpClient.patch).toHaveBeenCalledWith('/reports/1', {
        status: 'resolved',
        action: null,
      })
      expect(result.status).toBe('resolved')
    })

    it('should update report with action', async () => {
      const payload: ReportUpdate = {
        status: 'resolved',
        action: 'deleted',
      }
      const mockDto: ReportDto = {
        id: '1',
        target_type: 'note',
        note_id: 'note-1',
        reason: 'spam',
        status: 'resolved',
        reporter_id: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }
      vi.mocked(mockHttpClient.patch).mockResolvedValue(mockDto)

      const service = createReportsService(mockHttpClient)
      await service.update('1', payload)

      expect(mockHttpClient.patch).toHaveBeenCalledWith('/reports/1', {
        status: 'resolved',
        action: 'deleted',
      })
    })
  })
})
