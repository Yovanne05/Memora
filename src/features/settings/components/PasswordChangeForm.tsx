import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { User } from '@/features/users/models/user.model'
import { useUpdateUserMutation } from '@/features/users/hooks/useUserMutation'

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
    } catch {
      toast.error('Erreur lors de la modification du mot de passe')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
        <Input
          id="newPassword"
          type="password"
          {...register('newPassword')}
          disabled={updateMutation.isPending}
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
          disabled={updateMutation.isPending}
          placeholder="Confirmez votre nouveau mot de passe"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="rounded-lg bg-muted p-4 space-y-2">
        <p className="text-sm font-medium">Exigences du mot de passe :</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Au moins 12 caractères</li>
          <li>Au moins une lettre majuscule</li>
          <li>Au moins une lettre minuscule</li>
          <li>Au moins un chiffre</li>
          <li>Au moins un caractère spécial (!@#$%^&*...)</li>
        </ul>
      </div>

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
