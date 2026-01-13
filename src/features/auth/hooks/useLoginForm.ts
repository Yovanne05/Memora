import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { useRouter } from '@tanstack/react-router'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { loginSchema } from '@/features/auth/schemas/login.schema'
import { getLoginErrorMessage } from '@/features/auth/lib/login-errors'

export function useLoginForm(redirectTo: string) {
  const router = useRouter()
  const { login, isLoggingIn, isAuthenticated, isLoadingUser } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  useEffect(() => {
    if (isAuthenticated && !isLoadingUser) {
      router.navigate({ to: redirectTo })
    }
  }, [isAuthenticated, isLoadingUser, router, redirectTo])

  useEffect(() => {
    const subscription = form.watch(() => {
      if (formError) {
        setFormError(null)
      }
      form.clearErrors()
    })
    return () => subscription.unsubscribe()
  }, [form, formError])

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setFormError(null)
    try {
      await login(values)
      toast.success('Connexion réussie.')
      await router.navigate({ to: redirectTo })
    } catch (error) {
      const message = getLoginErrorMessage(error)
      toast.error(message)
      setFormError(message)
    }
  }

  return {
    form,
    formError,
    showPassword,
    setShowPassword,
    onSubmit,
    isLoggingIn,
  }
}
