import { memo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { User } from 'lucide-react'
import { ProfileSettingsForm } from '../../components/ProfileSettingsForm'
import type { User as UserModel } from '@/features/users/models/user.model'

interface ProfileSectionProps {
  user: UserModel
}

export const ProfileSection = memo(function ProfileSection({
  user,
}: Readonly<ProfileSectionProps>) {
  return (
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
  )
})
