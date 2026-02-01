import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { User } from '@/features/users/models/user.model'
import { useUpdateUserMutation } from '@/features/users/hooks/useUserMutation'
import { DeleteUserDialog } from './DeleteUserDialog'

type AdminUsersTableProps = {
  users: User[]
  isLoading: boolean
  isError: boolean
}

function UserRow({ user }: { user: User }) {
  const [username, setUsername] = useState(user.username ?? '')
  const updateMutation = useUpdateUserMutation(user.id)
  const isDirty = (user.username ?? '') !== username

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      username: username.length > 0 ? username : null,
    })
  }

  return (
    <tr className="hover:bg-accent/40">
      <td className="px-3 py-3 font-medium">{user.email}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="h-8"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSave}
            disabled={!isDirty || updateMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? 'En cours...' : 'Sauver'}
          </Button>
        </div>
      </td>
      <td className="px-3 py-3">{user.role}</td>
      <td className="px-3 py-3 text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
      </td>
      <td className="px-3 py-3 text-right">
        <DeleteUserDialog
          userId={user.id}
          userLabel={user.username ?? user.email}
        />
      </td>
    </tr>
  )
}

export function AdminUsersTable({
  users,
  isLoading,
  isError,
}: Readonly<AdminUsersTableProps>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Username</th>
            <th className="px-3 py-2">Rôle</th>
            <th className="px-3 py-2">Créé le</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
          {!isLoading && !isError && users.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-8 text-center text-muted-foreground"
              >
                Aucun utilisateur trouvé.
              </td>
            </tr>
          )}
          {isLoading && (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-8 text-center text-muted-foreground"
              >
                Chargement des utilisateurs...
              </td>
            </tr>
          )}
          {isError && (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-8 text-center text-destructive"
              >
                Impossible de charger les utilisateurs.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
