import { useState } from 'react'
import type { Control, FieldErrors } from 'react-hook-form'
import type { RegisterValues } from '../../schemas/register.schema'
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { TermsOfServiceDialog } from '../../components/TermsOfServiceDialog'

interface RegisterTermsFieldProps {
  control: Control<RegisterValues>
  errors: FieldErrors<RegisterValues>
}

export function RegisterTermsField({
  control,
  errors,
}: Readonly<RegisterTermsFieldProps>) {
  const [termsDialogOpen, setTermsDialogOpen] = useState(false)

  return (
    <FormField
      control={control}
      name="acceptTerms"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              id="acceptTerms"
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <label
              htmlFor="acceptTerms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              J'accepte les{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setTermsDialogOpen(true)
                }}
                className="text-primary hover:underline"
              >
                Conditions Générales d'Utilisation
              </button>{' '}
              *
            </label>
            {errors.acceptTerms && (
              <FormMessage>{errors.acceptTerms.message}</FormMessage>
            )}
          </div>
          <TermsOfServiceDialog
            open={termsDialogOpen}
            onOpenChange={setTermsDialogOpen}
          />
        </FormItem>
      )}
    />
  )
}
