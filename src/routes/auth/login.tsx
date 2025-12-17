import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { AlertTriangle, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { getAccessToken } from "@/features/auth/lib/token-storage"
import { ApiError, NetworkError, TimeoutError } from "@/lib/errors"

const loginSchema = z.object({
  identifier: z.string().min(1, "Renseignez votre email ou nom d'utilisateur."),
  password: z.string().min(1, "Le mot de passe est requis."),
})

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search) => ({
    redirect: typeof search?.redirect === "string" ? search.redirect : "/app/dashboard",
  }),
  beforeLoad: ({ search }) => {
    if (getAccessToken()) {
      throw redirect({
        to: (typeof search?.redirect === "string" && search.redirect) || "/app/dashboard",
      })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const search = Route.useSearch()
  const { login, isLoggingIn, isAuthenticated, isLoadingUser } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  })

  useEffect(() => {
    if (isAuthenticated && !isLoadingUser) {
      router.navigate({ to: search.redirect || "/app/dashboard" })
    }
  }, [isAuthenticated, isLoadingUser, router, search.redirect])

  const getFriendlyError = (error: unknown) => {
    if (error instanceof TimeoutError || error instanceof NetworkError) {
      return "Impossible de joindre le serveur. Verifiez votre connexion puis reessayez."
    }

    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 400) {
        return "Identifiants incorrects. Verifiez l'email ou le mot de passe."
      }
      if (error.status >= 500) {
        return "Service momentanement indisponible. Merci de reessayer dans un instant."
      }
    }

    return "Connexion impossible. Merci de reessayer."
  }

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setFormError(null)
    try {
      await login(values)
      toast.success("Connexion réussie.")
      await router.navigate({ to: search.redirect || "/app/dashboard" })
    } catch (error) {
      const message = getFriendlyError(error)
      toast.error(message)
      setFormError(message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-sky-600/15">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row lg:items-center">
        <div className="hidden flex-1 flex-col gap-6 rounded-2xl border bg-background/60 p-10 shadow-lg backdrop-blur lg:flex">
          <div className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Memora
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Retrouver vos notes devient un réflexe, pas une corvée.
            </h1>
            <p className="text-lg text-muted-foreground">
              Centralisez vos idées, vos cours et vos découvertes dans un espace qui reste clair, connecté et prêt à être
              révisé.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Highlight title="Synchronisation rapide" description="Vos collections et fiches restent alignées sur tous vos appareils." />
            <Highlight title="Révision intelligente" description="Programmez vos sessions de révision depuis le même tableau de bord." />
            <Highlight title="Recherche boostée" description="Filtrez par tags, visibilité ou propriétaire en quelques clics." />
            <Highlight title="Partage maîtrisé" description="Gardez le contrôle avec les droits privés ou publics de chaque note." />
          </div>
        </div>

        <div className="flex-1">
          <Card className="mx-auto w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Connexion</CardTitle>
              <CardDescription>Reprenez vos révisions là où vous les avez laissées.</CardDescription>
            </CardHeader>
            <CardContent>
              {formError ? (
                <div className="mb-4 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-destructive/90">{formError}</p>
                  </div>
                </div>
              ) : null}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email ou nom d'utilisateur</FormLabel>
                        <FormControl>
                          <Input placeholder="jane.doe@example.com" autoComplete="username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="********"
                              autoComplete="current-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="justify-between text-sm text-muted-foreground">
              <span>Nouveau sur Memora ?</span>
              <Link
                to="/auth/register"
                search={{ redirect: search.redirect }}
                className="font-medium text-primary hover:underline"
              >
                Créer un compte
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Highlight({ title, description }: { readonly title: string; readonly description: string }) {
  return (
    <div className="rounded-xl border bg-card/70 p-4 shadow-sm backdrop-blur">
      <div className="text-sm font-semibold">{title}</div>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}
