import { memo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Shield } from 'lucide-react'
import { GdprInfoSection } from './GdprInfoSection'
import { AccountDeletionSection } from '../../components/AccountDeletionSection'
import type { User } from '@/features/users/models/user.model'

interface PrivacySectionProps {
  user: User
}

export const PrivacySection = memo(function PrivacySection({
  user,
}: Readonly<PrivacySectionProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Confidentialité et données (RGPD)
        </CardTitle>
        <CardDescription>
          Gérez vos données personnelles conformément au Règlement Général sur
          la Protection des Données.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <GdprInfoSection />
        <Separator />
        <AccountDeletionSection user={user} />
      </CardContent>
    </Card>
  )
})
