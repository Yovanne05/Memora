import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getContextualErrorMessage } from '@/lib/error-context'
import type { User } from '@/features/users/models/user.model'
import { useUpdateUserMutation } from '@/features/users/hooks/useUserMutation'
import { PasswordFormFields } from './password-change/PasswordFormFields'
import { PasswordRequirements } from './password-change/PasswordRequirements'

const passwordFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
      .regex(
        /[^A-Za-z0-9]/,
        'Le mot de passe doit contenir au moins un caractère spécial'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

interface PasswordChangeFormProps {
  user: User
}

export function PasswordChangeForm({ user }: PasswordChangeFormProps) {
  const updateMutation = useUpdateUserMutation(user.id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: PasswordFormValues) => {
    try {
      await updateMutation.mutateAsync({
        password: data.newPassword,
      })
      toast.success('Mot de passe modifié avec succès')
      reset()
    } catch (error) {
      const message = getContextualErrorMessage(error, {
        operation: 'update',
        resource: 'user',
      })
      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <PasswordFormFields
        register={register}
        errors={errors}
        isPending={updateMutation.isPending}
      />

      <PasswordRequirements />

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending
            ? 'Modification...'
            : 'Modifier le mot de passe'}
        </Button>
      </div>
    </form>
  )
}
