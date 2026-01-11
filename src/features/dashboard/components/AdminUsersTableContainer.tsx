import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PaginationComponent } from '@/components/ui/pagination-component'
import { Search } from 'lucide-react'
import { useUsersQuery } from '@/features/users/hooks/user.query'
import { AdminUsersTable } from './AdminUserTable'

export function AdminUsersTableContainer() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim().toLowerCase()
  const limit = normalizedSearch.length > 0 ? 200 : 10

  const filters = useMemo(
    () => ({
      limit,
      offset: normalizedSearch.length > 0 ? 0 : page * limit,
      search: normalizedSearch.length > 0 ? search : undefined,
      role: 'client' as const,
    }),
    [limit, page, search, normalizedSearch]
  )

  const { data, isLoading, isError } = useUsersQuery(filters)
  const users = data?.items ?? []
  const visibleUsers =
    normalizedSearch.length === 0
      ? users
      : users.filter((user) => {
          const email = user.email.toLowerCase()
          const username = (user.username ?? '').toLowerCase()
          return (
            email.includes(normalizedSearch) ||
            username.includes(normalizedSearch)
          )
        })
  const total = data?.total ?? 0
  const maxPage = Math.max(0, Math.ceil(total / limit) - 1)

  return (
    <Card className="space-y-4 border border-border/70 p-4 shadow-sm">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(0)
          }}
          placeholder="Rechercher un email ou username..."
          className="pl-9"
        />
      </div>

      <AdminUsersTable
        users={visibleUsers}
        isLoading={isLoading}
        isError={isError}
      />

      {normalizedSearch.length === 0 && total > limit && (
        <PaginationComponent page={page} maxPage={maxPage} setPage={setPage} />
      )}
    </Card>
  )
}
