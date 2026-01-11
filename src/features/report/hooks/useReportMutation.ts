import { useMutation } from '@tanstack/react-query'
import { reportsService } from '../services/report.service'
import type { ReportCreate } from '../models/report'
import { toast } from 'sonner'

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
      toast.error('Erreur lors du signalement', {
        description:
          error instanceof Error
            ? error.message
            : 'Une erreur est survenue. Veuillez réessayer.',
      })
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
      toast.error('Erreur lors du signalement', {
        description:
          error instanceof Error
            ? error.message
            : 'Une erreur est survenue. Veuillez réessayer.',
      })
    },
  })
}
