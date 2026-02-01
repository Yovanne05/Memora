import { memo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'

interface PasswordFormValues {
  newPassword: string
  confirmPassword: string
}

interface PasswordFormFieldsProps {
  register: UseFormRegister<PasswordFormValues>
  errors: FieldErrors<PasswordFormValues>
  isPending: boolean
}

export const PasswordFormFields = memo(function PasswordFormFields({
  register,
  errors,
  isPending,
}: Readonly<PasswordFormFieldsProps>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
        <Input
          id="newPassword"
          type="password"
          {...register('newPassword')}
          disabled={isPending}
          placeholder="Entrez votre nouveau mot de passe"
        />
        {errors.newPassword && (
          <p className="text-sm text-red-500">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          disabled={isPending}
          placeholder="Confirmez votre nouveau mot de passe"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
    </>
  )
})
