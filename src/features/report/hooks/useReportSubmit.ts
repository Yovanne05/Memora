import { useState } from 'react'
import type { ReportFormValues } from '../schemas/report.schema'
import {
  useReportNoteMutation,
  useReportCollectionMutation,
} from './useReportMutation'

interface UseReportSubmitParams {
  targetType: 'note' | 'collection'
  targetId: string
  onSuccess: () => void
}

export function useReportSubmit({
  targetType,
  targetId,
  onSuccess,
}: UseReportSubmitParams) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reportNoteMutation = useReportNoteMutation(targetId)
  const reportCollectionMutation = useReportCollectionMutation(targetId)

  const handleSubmit = async (values: ReportFormValues) => {
    setIsSubmitting(true)
    try {
      const payload = {
        reason: values.reason,
        description: values.description?.trim() ?? undefined,
      }

      if (targetType === 'note') {
        await reportNoteMutation.mutateAsync(payload)
      } else {
        await reportCollectionMutation.mutateAsync(payload)
      }

      onSuccess()
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, handleSubmit }
}
