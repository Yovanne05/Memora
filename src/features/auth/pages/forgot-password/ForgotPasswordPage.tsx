import { Link } from '@tanstack/react-router'
import { ArrowLeft, Mail, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useForgotPassword } from '../../hooks/useForgotPassword'

export default function ForgotPasswordPage() {
  const { form, isSubmitting, isSuccess, error, onSubmit, resetForm } =
    useForgotPassword()

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">E-mail envoyé !</CardTitle>
            <CardDescription>
              Un nouveau mot de passe temporaire a été généré et envoyé à votre
              adresse e-mail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p className="font-medium">Prochaines étapes :</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Vérifiez votre boîte de réception (et vos spams)</li>
                  <li>
                    Utilisez le mot de passe temporaire pour vous connecter
                  </li>
                  <li>
                    Changez immédiatement ce mot de passe dans{' '}
                    <span className="font-medium">
                      Paramètres &gt; Sécurité
                    </span>
                  </li>
                </ol>
                <p className="text-xs text-muted-foreground mt-2">
                  Le mot de passe temporaire contient 12 caractères avec au
                  moins une majuscule, un chiffre et un caractère spécial.
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/auth/login" search={{ redirect: '/app/dashboard' }}>
                  Retour à la connexion
                </Link>
              </Button>
              <Button variant="ghost" className="w-full" onClick={resetForm}>
                Renvoyer un e-mail
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Mot de passe oublié
          </CardTitle>
          <CardDescription>
            Entrez votre adresse e-mail pour recevoir un nouveau mot de passe
            temporaire.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="votre.email@exemple.fr"
                        disabled={isSubmitting}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Un mot de passe temporaire sécurisé sera automatiquement
                  généré et envoyé à cette adresse. Vous pourrez le changer
                  après vous être connecté.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Envoi en cours...'
                  : 'Envoyer le mot de passe temporaire'}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Link
              to="/auth/login"
              search={{ redirect: '/app/dashboard' }}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
