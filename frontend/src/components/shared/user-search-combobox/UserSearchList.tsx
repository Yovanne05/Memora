import { Check, Search } from 'lucide-react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import type { User } from '@/features/users/models/user.model'

type UserSearchListProps = {
  users: User[]
  isLoading: boolean
  searchQuery: string
  value?: string
  onSearchChange: (value: string) => void
  onSelect: (user: User | null) => void
  onClose: () => void
}

export function UserSearchList({
  users,
  isLoading,
  searchQuery,
  value,
  onSearchChange,
  onSelect,
  onClose,
}: Readonly<UserSearchListProps>) {
  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Rechercher par nom ou email..."
        value={searchQuery}
        onValueChange={onSearchChange}
      />
      <CommandList>
        {isLoading && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Search className="mx-auto h-4 w-4 animate-pulse" />
          </div>
        )}
        {!isLoading && users.length === 0 && (
          <CommandEmpty>
            {searchQuery.length < 2
              ? 'Tapez pour rechercher des utilisateurs'
              : 'Aucun utilisateur trouvé'}
          </CommandEmpty>
        )}
        {users.length > 0 && (
          <CommandGroup>
            {users.map((user) => (
              <CommandItem
                key={user.id}
                value={user.id}
                onSelect={() => {
                  onSelect(user.id === value ? null : user)
                  onClose()
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === user.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium">{user.username}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}
