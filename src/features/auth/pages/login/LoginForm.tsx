import { Link } from '@tanstack/react-router'
import type { UseFormReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { AuthFormCard } from '@/features/auth/components/AuthFormCard'
import { AuthFormError } from '@/features/auth/components/AuthFormError'
import { AuthPasswordField } from '@/features/auth/components/AuthPasswordField'
import type { LoginValues } from '@/features/auth/schemas/login.schema'

type LoginFormProps = {
  form: UseFormReturn<LoginValues>
  formError: string | null
  showPassword: boolean
  onTogglePassword: () => void
  onSubmit: (values: LoginValues) => Promise<void>
  isLoggingIn: boolean
  redirectTo: string
}

export function LoginForm({
  form,
  formError,
  showPassword,
  onTogglePassword,
  onSubmit,
  isLoggingIn,
  redirectTo,
}: Readonly<LoginFormProps>) {
  return (
    <AuthFormCard
      title="Connexion"
      description="Reprenez vos révisions là où vous les avez laissées."
      footer={
        <>
          <span>Nouveau sur Memora ?</span>
          <Link
            to="/auth/register"
            search={{ redirect: redirectTo }}
            className="font-medium text-primary hover:underline"
          >
            Créer un compte
          </Link>
        </>
      }
    >
      {formError ? <AuthFormError message={formError} /> : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email ou nom d'utilisateur</FormLabel>
                <FormControl>
                  <Input
                    placeholder="jane.doe@example.com"
                    autoComplete="username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <AuthPasswordField
              control={form.control}
              name="password"
              label="Mot de passe"
              placeholder="********"
              autoComplete="current-password"
              showPassword={showPassword}
              onToggle={onTogglePassword}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>
      </Form>
    </AuthFormCard>
  )
}
