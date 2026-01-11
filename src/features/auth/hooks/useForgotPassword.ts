import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { passwordResetService } from '../services/password-reset.service'
import { logger } from '@/lib/logger'

const forgotPasswordSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
})

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export function useForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await passwordResetService.requestPasswordReset(values.email)
      setIsSuccess(true)
      toast.success(
        'Un nouveau mot de passe temporaire a été envoyé à votre adresse e-mail'
      )
    } catch (err) {
      logger.error('Failed to request password reset', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erreur lors de la demande de réinitialisation. Veuillez réessayer.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsSuccess(false)
    setError(null)
    form.reset()
  }

  return {
    form,
    isSubmitting,
    isSuccess,
    error,
    onSubmit,
    resetForm,
  }
}
