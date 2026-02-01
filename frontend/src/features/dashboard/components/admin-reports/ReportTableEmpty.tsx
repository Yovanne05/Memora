import { memo } from 'react'

interface ReportTableEmptyProps {
  isLoading: boolean
  isError: boolean
  hasReports: boolean
}

export const ReportTableEmpty = memo(function ReportTableEmpty({
  isLoading,
  isError,
  hasReports,
}: Readonly<ReportTableEmptyProps>) {
  if (hasReports) return null

  if (isLoading) {
    return (
      <tr>
        <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
          Chargement des signalements...
        </td>
      </tr>
    )
  }

  if (isError) {
    return (
      <tr>
        <td colSpan={7} className="px-3 py-8 text-center text-destructive">
          Impossible de charger les signalements.
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
        Aucun signalement ne correspond aux filtres.
      </td>
    </tr>
  )
})
