import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { useRouter } from "@tanstack/react-router"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { registerSchema } from "./registerSchema"
import { getRegisterErrorMessage } from "./getRegisterErrorMessage"

export function useRegisterForm(redirectTo: string) {
  const router = useRouter()
  const { register: registerUser, isRegistering, isAuthenticated, isLoadingUser } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      displayName: "",
      email: "",
      username: "",
      password: "",
    },
  })

  useEffect(() => {
    if (isAuthenticated && !isLoadingUser) {
      router.navigate({ to: redirectTo })
    }
  }, [isAuthenticated, isLoadingUser, router, redirectTo])

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setFormError(null)
    try {
      await registerUser(values)
      toast.success("Compte créé avec succès. Vous pouvez maintenant vous connecter.")
      await router.navigate({ to: "/auth/login", search: { redirect: redirectTo } })
    } catch (error) {
      console.error("Failed to register user", error)
      const message = getRegisterErrorMessage(error)
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
    isRegistering,
  }
}
