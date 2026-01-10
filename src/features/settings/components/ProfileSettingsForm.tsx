import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { User } from '@/features/users/models/user.model'
import { useUpdateUserMutation } from '@/features/users/hooks/useUserMutation'

const profileFormSchema = z.object({
  email: z.string().email('Email invalide'),
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(50)
    .nullable()
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileSettingsFormProps {
  user: User
}

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const updateMutation = useUpdateUserMutation(user.id)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: user.email,
      username: user.username || '',
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateMutation.mutateAsync({
        email: data.email,
        username: data.username || null,
      })
      toast.success('Profil mis à jour avec succès')
    } catch {
      toast.error('Erreur lors de la mise à jour du profil')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          disabled={updateMutation.isPending}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Votre email est utilisé pour la connexion et les notifications.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Nom d'utilisateur</Label>
        <Input
          id="username"
          type="text"
          {...register('username')}
          disabled={updateMutation.isPending}
          placeholder="Optionnel"
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Votre nom d'utilisateur sera affiché aux autres utilisateurs.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
          {updateMutation.isPending
            ? 'Enregistrement...'
            : 'Enregistrer les modifications'}
        </Button>
      </div>
    </form>
  )
}
