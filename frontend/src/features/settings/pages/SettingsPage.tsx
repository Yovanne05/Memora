import { useAuth } from '@/features/auth/hooks/useAuth'
import { Separator } from '@/components/ui/separator'
import { ProfileSection } from './settings/ProfileSection'
import { SecuritySection } from './settings/SecuritySection'
import { PrivacySection } from './settings/PrivacySection'
import { AdditionalInfoCard } from './settings/AdditionalInfoCard'
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

        <ProfileSection user={user} />
        <SecuritySection user={user} />
        <PrivacySection user={user} />
        <AdditionalInfoCard />
      </div>
    </div>
  )
}
