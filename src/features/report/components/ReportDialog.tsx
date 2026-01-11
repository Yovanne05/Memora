import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { reportSchema, type ReportFormValues } from '../schemas/report.schema'
import { REPORT_REASON_OPTIONS } from '../types/report-reason'
import {
  useReportNoteMutation,
  useReportCollectionMutation,
} from '../hooks/useReportMutation'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reportNoteMutation = useReportNoteMutation(targetId)
  const reportCollectionMutation = useReportCollectionMutation(targetId)

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: undefined,
      description: '',
    },
  })

  const handleSubmit = async (values: ReportFormValues) => {
    setIsSubmitting(true)
    try {
      const payload = {
        reason: values.reason,
        description: values.description?.trim() || undefined,
      }

      if (targetType === 'note') {
        await reportNoteMutation.mutateAsync(payload)
      } else {
        await reportCollectionMutation.mutateAsync(payload)
      }

      form.reset()
      onOpenChange(false)
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Signaler {targetType === 'note' ? 'une note' : 'une collection'}
          </DialogTitle>
          <DialogDescription>
            {targetTitle && (
              <span className="block font-medium text-foreground mb-2">
                {targetTitle}
              </span>
            )}
            Vous êtes sur le point de signaler ce contenu. Notre équipe
            examinera votre signalement dans les plus brefs délais.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison du signalement *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une raison" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REPORT_REASON_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Détails (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez le problème..."
                      className="resize-none h-24"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
