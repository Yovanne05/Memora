import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { AlertTriangle, Eye, EyeOff, Info } from "lucide-react"

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { getAccessToken } from "@/features/auth/lib/token-storage"
import { ApiError, NetworkError, TimeoutError } from "@/lib/errors"

const registerSchema = z.object({
  displayName: z.string().min(2, "Indiquez votre nom ou pseudo."),
  email: z.email("Email invalide."),
  username: z.string().min(3, "Nom d'utilisateur trop court.").max(50, "Nom d'utilisateur trop long."),
  password: z.string().min(8, "Au moins 8 caractères sont requis."),
})

export const Route = createFileRoute("/auth/register")({
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
  component: RegisterPage,
})

function RegisterPage() {
  const router = useRouter()
  const search = Route.useSearch()
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
      router.navigate({ to: search.redirect || "/app/dashboard" })
    }
  }, [isAuthenticated, isLoadingUser, router, search.redirect])

  const getFriendlyError = (error: unknown) => {
    if (error instanceof TimeoutError || error instanceof NetworkError) {
      return "Impossible de joindre le serveur. Verifiez votre connexion puis reessayez."
    }

    if (error instanceof ApiError) {
      if (error.status === 409) {
        return "Un compte existe deja avec cet email ou ce nom d'utilisateur."
      }
      if (error.status === 400 || error.status === 422) {
        return "Informations invalides. Verifiez les champs et reessayez."
      }
      if (error.status >= 500) {
        return "Service momentanement indisponible. Merci de reessayer dans un instant."
      }
    }

    return "Impossible de creer votre compte. Merci de reessayer."
  }

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setFormError(null)
    try {
      await registerUser(values)
      toast.success("Compte créé avec succès.")
      await router.navigate({ to: search.redirect || "/app/dashboard" })
    } catch (error) {
      console.error("Failed to register user", error)
      const message = getFriendlyError(error)
      toast.error(message)
      setFormError(message)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-500/15 via-amber-400/10 to-sky-600/15">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row lg:items-center">
        <div className="hidden flex-1 flex-col gap-6 rounded-2xl border bg-background/60 p-10 shadow-lg backdrop-blur lg:flex">
          <div className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Memora
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">Construisez votre base dès maintenant.</h1>
            <p className="text-lg text-muted-foreground">
              Les collections, la révision programmée et la recherche avancée sont prêtes à accueillir vos idées.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Highlight title="Collections" description="Classez vos notes avec des descriptions et des statuts de visibilité." />
            <Highlight title="Graphe" description="Visualisez vos liens pour mieux comprendre vos connexions." />
            <Highlight title="Notes collaboratives" description="Gardez vos fiches privées ou partagez-les si besoin." />
            <Highlight title="Suivi des révisions" description="Planifiez des sessions et mesurez votre progression." />
          </div>
        </div>

        <div className="flex-1">
          <Card className="mx-auto w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Créer un compte</CardTitle>
              <CardDescription>Rejoignez Memora pour structurer vos connaissances.</CardDescription>
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
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom affiché</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" autoComplete="name" {...field} />
                        </FormControl>
                        {form.formState.errors.displayName ? <FormMessage>Champ invalide.</FormMessage> : null}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="vous@example.com" type="email" autoComplete="email" {...field} />
                        </FormControl>
                        {form.formState.errors.email ? <FormMessage>Champ invalide.</FormMessage> : null}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur</FormLabel>
                        <FormControl>
                          <Input placeholder="janedoe" autoComplete="username" {...field} />
                        </FormControl>
                        {form.formState.errors.username ? <FormMessage>Champ invalide.</FormMessage> : null}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <span>Mot de passe</span>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="text-muted-foreground transition-colors hover:text-foreground"
                                  aria-label="Règles du mot de passe"
                                >
                                  <Info className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" align="start" className="max-w-xs text-sm">
                                8 caractères minimum, avec au moins 1 majuscule, 1 chiffre et 1 caractère spécial.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="********"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
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
                        {form.formState.errors.password ? <FormMessage>Champ invalide.</FormMessage> : null}
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isRegistering}>
                    {isRegistering ? "Création du compte..." : "S'inscrire"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="justify-between text-sm text-muted-foreground">
              <span>Déjà inscrit ?</span>
              <Link to="/auth/login" search={{ redirect: search.redirect }} className="font-medium text-primary hover:underline">
                Retour à la connexion
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
