import { memo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { PasswordChangeForm } from '../../components/PasswordChangeForm'
import type { User } from '@/features/users/models/user.model'

interface SecuritySectionProps {
  user: User
}

export const SecuritySection = memo(function SecuritySection({
  user,
}: Readonly<SecuritySectionProps>) {
  return (
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
  )
})
