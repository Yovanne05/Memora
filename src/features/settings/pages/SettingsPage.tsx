import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ProfileSettingsForm } from '../components/ProfileSettingsForm'
import { PasswordChangeForm } from '../components/PasswordChangeForm'
import { AccountDeletionSection } from '../components/AccountDeletionSection'
import { User, Lock, Shield, Info } from 'lucide-react'
import { useEffect } from 'react'

export default function SettingsPage() {
  const { user, isLoadingUser } = useAuth()

  useEffect(() => {
    if (!isLoadingUser && !user) {
      window.location.href = '/auth/login'
    }
  }, [user, isLoadingUser])

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="w-full flex justify-center px-4 py-8">
      <div className="w-full max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et vos préférences.
          </p>
        </div>

        <Separator />

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations du profil
            </CardTitle>
            <CardDescription>
              Mettez à jour vos informations personnelles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileSettingsForm user={user} />
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Modifiez votre mot de passe pour sécuriser votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm user={user} />
          </CardContent>
        </Card>

        {/* Privacy & GDPR Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Confidentialité et données (RGPD)
            </CardTitle>
            <CardDescription>
              Gérez vos données personnelles conformément au Règlement Général
              sur la Protection des Données.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* GDPR Information */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium">
                    Vos droits selon le RGPD
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Conformément au Règlement Général sur la Protection des
                    Données (RGPD) et à la loi française, vous disposez de
                    plusieurs droits concernant vos données personnelles :
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                    <li>
                      <strong>Droit d'accès</strong> : Accédez à vos données via
                      votre profil
                    </li>
                    <li>
                      <strong>Droit de rectification</strong> : Modifiez vos
                      informations dans les sections ci-dessus
                    </li>
                    <li>
                      <strong>Droit à l'effacement</strong> : Supprimez votre
                      compte et toutes vos données
                    </li>
                    <li>
                      <strong>Droit d'opposition</strong> : Contactez-nous via
                      infoiut@iut.univ-paris8.fr pour vous opposer au traitement
                      de vos données
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Account Deletion */}
            <AccountDeletionSection user={user} />
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="border-muted">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Base légale du traitement :</strong> Le traitement de
                vos données est basé sur votre consentement et l'exécution du
                contrat de service.
              </p>
              <p>
                <strong>Durée de conservation :</strong> Vos données sont
                conservées tant que votre compte est actif. Après suppression,
                vos données sont définitivement effacées sous 30 jours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
