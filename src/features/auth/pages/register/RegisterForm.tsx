import { Link } from "@tanstack/react-router"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { AuthFormCard } from "@/features/auth/components/AuthFormCard"
import { AuthFormError } from "@/features/auth/components/AuthFormError"
import type { RegisterValues } from "@/features/auth/schemas/register.schema"
import { RegisterIdentityFields } from "./RegisterIdentityFields"
import { RegisterPasswordField } from "./RegisterPasswordField"

type RegisterFormProps = {
  form: UseFormReturn<RegisterValues>
  formError: string | null
  showPassword: boolean
  onTogglePassword: () => void
  onSubmit: (values: RegisterValues) => Promise<void>
  isRegistering: boolean
  redirectTo: string
}

export function RegisterForm({
  form,
  formError,
  showPassword,
  onTogglePassword,
  onSubmit,
  isRegistering,
  redirectTo,
}: Readonly<RegisterFormProps>) {
  return (
    <AuthFormCard
      title="Créer un compte"
      description="Rejoignez Memora pour structurer vos connaissances."
      footer={
        <>
          <span>Déjà inscrit ?</span>
          <Link
            to="/auth/login"
            search={{ redirect: redirectTo }}
            className="font-medium text-primary hover:underline"
          >
            Retour à la connexion
          </Link>
        </>
      }
    >
      {formError ? <AuthFormError message={formError} /> : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <RegisterIdentityFields control={form.control} errors={form.formState.errors} />
          <RegisterPasswordField
            control={form.control}
            errors={form.formState.errors}
            showPassword={showPassword}
            onTogglePassword={onTogglePassword}
          />
          <Button type="submit" className="w-full" disabled={isRegistering}>
            {isRegistering ? "Création du compte..." : "S'inscrire"}
          </Button>
        </form>
      </Form>
    </AuthFormCard>
  )
}

