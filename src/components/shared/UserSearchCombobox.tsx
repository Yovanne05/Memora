import { useState } from "react"
import { ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUserSearchQuery } from "@/features/users/hooks/useUserSearchQuery"
import type { User } from "@/features/users/models/user.model"
import { UserSearchList } from "./user-search-combobox/UserSearchList"

interface UserSearchComboboxProps {
  value?: string
  onChange: (user: User | null) => void
  excludeUserIds?: string[]
  placeholder?: string
  disabled?: boolean
}

export function UserSearchCombobox({
  value,
  onChange,
  excludeUserIds = [],
  placeholder = "Search users...",
  disabled,
}: Readonly<UserSearchComboboxProps>) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { data, isLoading } = useUserSearchQuery(searchQuery)
  const filteredUsers =
    data?.items.filter((user) => !excludeUserIds.includes(user.id)) ?? []

  const selectedUser = filteredUsers.find((user) => user.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="justify-between"
        >
          {selectedUser ? (
            <span className="truncate">
              {selectedUser.displayName || selectedUser.username}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <UserSearchList
          users={filteredUsers}
          isLoading={isLoading}
          searchQuery={searchQuery}
          value={value}
          onSearchChange={setSearchQuery}
          onSelect={onChange}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
