import { memo } from 'react'
import {
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
import { REPORT_REASON_OPTIONS } from '../../types/report-reason'
import type { UseFormReturn } from 'react-hook-form'
import type { ReportFormValues } from '../../schemas/report.schema'

interface ReportDialogFormProps {
  form: UseFormReturn<ReportFormValues>
  isSubmitting: boolean
}

export const ReportDialogForm = memo(function ReportDialogForm({
  form,
  isSubmitting,
}: Readonly<ReportDialogFormProps>) {
  return (
    <div className="space-y-4">
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
    </div>
  )
})
