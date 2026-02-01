import { useMutation } from '@tanstack/react-query'
import { reportsService } from '../services/report.service'
import type { ReportCreate } from '../models/report'
import { toast } from 'sonner'
import { getContextualErrorMessage } from '@/lib/error-context'

export function useReportNoteMutation(noteId: string) {
  return useMutation({
    mutationFn: (payload: ReportCreate) =>
      reportsService.reportNote(noteId, payload),
    onSuccess: () => {
      toast.success('Signalement envoyé', {
        description:
          'Merci pour votre signalement. Notre équipe va examiner le contenu.',
      })
    },
    onError: (error) => {
      const message = getContextualErrorMessage(error, {
        operation: 'create',
        resource: 'report',
        fallback: "Impossible d'envoyer le signalement",
      })
      toast.error(message)
    },
  })
}

export function useReportCollectionMutation(collectionId: string) {
  return useMutation({
    mutationFn: (payload: ReportCreate) =>
      reportsService.reportCollection(collectionId, payload),
    onSuccess: () => {
      toast.success('Signalement envoyé', {
        description:
          'Merci pour votre signalement. Notre équipe va examiner le contenu.',
      })
    },
    onError: (error) => {
      const message = getContextualErrorMessage(error, {
        operation: 'create',
        resource: 'report',
        fallback: "Impossible d'envoyer le signalement",
      })
      toast.error(message)
    },
  })
}
