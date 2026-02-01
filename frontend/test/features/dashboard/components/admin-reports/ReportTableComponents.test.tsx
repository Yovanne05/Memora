import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReportStatusSelect } from '@/features/dashboard/components/admin-reports/ReportStatusSelect'
import { ReportTableRow } from '@/features/dashboard/components/admin-reports/ReportTableRow'
import { ReportTableActions } from '@/features/dashboard/components/admin-reports/ReportTableActions'
import { ReportTableEmpty } from '@/features/dashboard/components/admin-reports/ReportTableEmpty'
import type { Report } from '@/features/report/models/report'

vi.mock('@/features/report/hooks/useUpdateReportMutation', () => ({
  useUpdateReportMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

vi.mock('../DeleteReportCollectionDialog', () => ({
  DeleteReportCollectionDialog: () => <div>DeleteCollectionDialog</div>,
}))

vi.mock('../DeleteReportNoteDialog', () => ({
  DeleteReportNoteDialog: () => <div>DeleteNoteDialog</div>,
}))

vi.mock('../ResolveReportDialog', () => ({
  ResolveReportDialog: () => <div>ResolveDialog</div>,
}))

describe('ReportStatusSelect', () => {
  // @ts-expect-error - Test mock
  const mockReport: Report = {
    id: '1',
    targetType: 'note',
    noteId: 'note-1',
    reporterId: 'user-1',
    reason: 'spam',
    status: 'pending',
    createdAt: '2024-01-01T00:00:00Z',
  }

  it('should render with current status', () => {
    render(<ReportStatusSelect report={mockReport} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should display status options when opened', () => {
    render(<ReportStatusSelect report={mockReport} />)
    const select = screen.getByRole('combobox')
    fireEvent.click(select)
    expect(screen.getAllByText('En attente').length).toBeGreaterThan(0)
    expect(screen.getByText('En cours')).toBeInTheDocument()
    expect(screen.getByText('Résolu')).toBeInTheDocument()
    expect(screen.getByText('Rejeté')).toBeInTheDocument()
  })
})

describe('ReportTableRow', () => {
  // @ts-expect-error - Test mock
  const mockReport: Report = {
    id: '1',
    targetType: 'note',
    noteId: 'note-1',
    noteTitle: 'Test Note',
    reporterId: 'user-1',
    reporterEmail: 'user@test.com',
    reason: 'inappropriate_content',
    status: 'pending',
    createdAt: '2024-01-01T00:00:00Z',
  }

  it('should render report details', () => {
    render(
      <table>
        <tbody>
          <ReportTableRow report={mockReport} />
        </tbody>
      </table>
    )
    expect(screen.getByText('Test Note')).toBeInTheDocument()
    expect(screen.getByText('user@test.com')).toBeInTheDocument()
  })

  it('should display formatted reason', () => {
    render(
      <table>
        <tbody>
          <ReportTableRow report={mockReport} />
        </tbody>
      </table>
    )
    expect(screen.getByText('Inappropriate Content')).toBeInTheDocument()
  })

  it('should show Note badge for note reports', () => {
    render(
      <table>
        <tbody>
          <ReportTableRow report={mockReport} />
        </tbody>
      </table>
    )
    expect(screen.getByText('Note')).toBeInTheDocument()
  })

  it('should show Collection badge for collection reports', () => {
    const collectionReport: Report = {
      ...mockReport,
      targetType: 'collection',
      collectionId: 'col-1',
      collectionName: 'Test Collection',
    }
    render(
      <table>
        <tbody>
          <ReportTableRow report={collectionReport} />
        </tbody>
      </table>
    )
    expect(screen.getByText('Collection')).toBeInTheDocument()
  })

  it('should display default title when missing', () => {
    const reportNoTitle: Report = {
      ...mockReport,
      // @ts-expect-error - Testing undefined title
      noteTitle: undefined,
    }
    render(
      <table>
        <tbody>
          <ReportTableRow report={reportNoTitle} />
        </tbody>
      </table>
    )
    expect(screen.getByText('Sans titre')).toBeInTheDocument()
  })

  it('should format date correctly', () => {
    render(
      <table>
        <tbody>
          <ReportTableRow report={mockReport} />
        </tbody>
      </table>
    )
    expect(screen.getByText('01/01/2024')).toBeInTheDocument()
  })
})

describe('ReportTableActions', () => {
  it('should render examine button for note reports', () => {
    // @ts-expect-error - Test mock
    const noteReport: Report = {
      id: '1',
      targetType: 'note',
      noteId: 'note-1',
      reporterId: 'user-1',
      reason: 'spam',
      status: 'pending',
      createdAt: '2024-01-01T00:00:00Z',
    }
    render(<ReportTableActions report={noteReport} />)
    expect(screen.getByText('Examiner')).toBeInTheDocument()
  })

  it('should render examine button for collection reports', () => {
    // @ts-expect-error - Test mock
    const collectionReport: Report = {
      id: '1',
      targetType: 'collection',
      collectionId: 'col-1',
      reporterId: 'user-1',
      reason: 'spam',
      status: 'pending',
      createdAt: '2024-01-01T00:00:00Z',
    }
    render(<ReportTableActions report={collectionReport} />)
    expect(screen.getByText('Examiner')).toBeInTheDocument()
  })

  it('should show action dialogs for pending reports', () => {
    // @ts-expect-error - Test mock
    const pendingReport: Report = {
      id: '1',
      targetType: 'note',
      noteId: 'note-1',
      reporterId: 'user-1',
      reason: 'spam',
      status: 'pending',
      createdAt: '2024-01-01T00:00:00Z',
    }
    render(<ReportTableActions report={pendingReport} />)
    expect(screen.getByText('Résoudre')).toBeInTheDocument()
    expect(screen.getByText('Supprimer')).toBeInTheDocument()
  })

  it('should hide action dialogs for resolved reports', () => {
    // @ts-expect-error - Test mock
    const resolvedReport: Report = {
      id: '1',
      targetType: 'note',
      noteId: 'note-1',
      reporterId: 'user-1',
      reason: 'spam',
      status: 'resolved',
      createdAt: '2024-01-01T00:00:00Z',
    }
    render(<ReportTableActions report={resolvedReport} />)
    expect(screen.queryByText('Résoudre')).not.toBeInTheDocument()
    expect(screen.queryByText('Supprimer')).not.toBeInTheDocument()
  })
})

describe('ReportTableEmpty', () => {
  it('should show loading message', () => {
    render(
      <table>
        <tbody>
          <ReportTableEmpty
            isLoading={true}
            isError={false}
            hasReports={false}
          />
        </tbody>
      </table>
    )
    expect(
      screen.getByText('Chargement des signalements...')
    ).toBeInTheDocument()
  })

  it('should show error message', () => {
    render(
      <table>
        <tbody>
          <ReportTableEmpty
            isLoading={false}
            isError={true}
            hasReports={false}
          />
        </tbody>
      </table>
    )
    expect(
      screen.getByText('Impossible de charger les signalements.')
    ).toBeInTheDocument()
  })

  it('should show empty state message', () => {
    render(
      <table>
        <tbody>
          <ReportTableEmpty
            isLoading={false}
            isError={false}
            hasReports={false}
          />
        </tbody>
      </table>
    )
    expect(
      screen.getByText('Aucun signalement ne correspond aux filtres.')
    ).toBeInTheDocument()
  })

  it('should not render when hasReports is true', () => {
    const { container } = render(
      <table>
        <tbody>
          <ReportTableEmpty
            isLoading={false}
            isError={false}
            hasReports={true}
          />
        </tbody>
      </table>
    )
    expect(container.querySelector('tr')).not.toBeInTheDocument()
  })
})
