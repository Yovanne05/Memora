import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { reportSchema, type ReportFormValues } from '../schemas/report.schema'
import { useReportSubmit } from '../hooks/useReportSubmit'
import { ReportDialogHeader } from './report-dialog/ReportDialogHeader'
import { ReportDialogForm } from './report-dialog/ReportDialogForm'

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetType: 'note' | 'collection'
  targetId: string
  targetTitle?: string
}

export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetTitle,
}: Readonly<ReportDialogProps>) {
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: undefined,
      description: '',
    },
  })

  const { isSubmitting, handleSubmit } = useReportSubmit({
    targetType,
    targetId,
    onSuccess: () => {
      form.reset()
      onOpenChange(false)
    },
  })

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <ReportDialogHeader targetType={targetType} targetTitle={targetTitle} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <ReportDialogForm form={form} isSubmitting={isSubmitting} />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi...' : 'Envoyer le signalement'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
