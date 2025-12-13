import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi } from "vitest"
import {
  USERS_QUERY_KEYS,
  useUsersListQuery,
  useUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/features/users/hooks/useUsersQuery"
import type { User } from "@/features/users/models/user.model"
import React from "react"

const mockUsersService = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}))

vi.mock("@/features/users/services/users.service", () => ({
  usersService: mockUsersService,
}))

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe("useUsersQuery hooks", () => {
  let queryClient: QueryClient

  const user: User = {
    id: "user-1",
    username: "testuser",
    email: "test@example.com",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  test("useUsersListQuery récupère la liste des utilisateurs", async () => {
    mockUsersService.list.mockResolvedValue([user])

    const { result } = renderHook(() => useUsersListQuery(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([user])
    expect(mockUsersService.list).toHaveBeenCalledTimes(1)
  })

  test("useUsersListQuery accepte des paramètres de filtrage", async () => {
    mockUsersService.list.mockResolvedValue([user])

    const params = { page: 1, limit: 10 }
    const { result } = renderHook(() => useUsersListQuery(params), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockUsersService.list).toHaveBeenCalledWith(params)
  })

  test("useUserQuery récupère le détail d'un utilisateur", async () => {
    mockUsersService.get.mockResolvedValue(user)

    const { result } = renderHook(() => useUserQuery("user-1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.data).toEqual(user))
    expect(mockUsersService.get).toHaveBeenCalledWith("user-1")
  })

  test("useUserQuery peut être désactivé", () => {
    const { result } = renderHook(() => useUserQuery("user-1", { enabled: false }), {
      wrapper: createWrapper(queryClient),
    })

    expect(result.current.isPending).toBe(true)
    expect(mockUsersService.get).not.toHaveBeenCalled()
  })

  test("useCreateUserMutation met à jour le cache liste", async () => {
    const newUser = { ...user, id: "user-2" }
    mockUsersService.create.mockResolvedValue(newUser)
    queryClient.setQueryData(USERS_QUERY_KEYS.list(), [user])

    const { result } = renderHook(() => useCreateUserMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    })

    const cached = queryClient.getQueryData<User[]>(USERS_QUERY_KEYS.list())
    expect(cached?.[0]).toEqual(newUser)
  })

  test("useUpdateUserMutation remplace l'utilisateur dans le cache", async () => {
    const updated = { ...user, username: "updated" }
    mockUsersService.update.mockResolvedValue(updated)
    queryClient.setQueryData(USERS_QUERY_KEYS.list(), [user])
    queryClient.setQueryData(USERS_QUERY_KEYS.detail(user.id), user)

    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync({ id: user.id, data: { username: "updated" } })

    expect(queryClient.getQueryData<User[]>(USERS_QUERY_KEYS.list())).toEqual([updated])
    expect(queryClient.getQueryData<User>(USERS_QUERY_KEYS.detail(user.id))).toEqual(updated)
  })

  test("useDeleteUserMutation retire l'utilisateur du cache", async () => {
    mockUsersService.remove.mockResolvedValue(undefined)
    queryClient.setQueryData(USERS_QUERY_KEYS.list(), [user])
    queryClient.setQueryData(USERS_QUERY_KEYS.detail(user.id), user)

    const { result } = renderHook(() => useDeleteUserMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync(user.id)

    expect(queryClient.getQueryData(USERS_QUERY_KEYS.list())).toEqual([])
    expect(queryClient.getQueryData(USERS_QUERY_KEYS.detail(user.id))).toBeUndefined()
  })

  test("useCreateUserMutation appelle onSuccess callback", async () => {
    const newUser = { ...user, id: "user-2" }
    mockUsersService.create.mockResolvedValue(newUser)
    const onSuccess = vi.fn()

    const { result } = renderHook(() => useCreateUserMutation({ onSuccess }), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    })

    expect(onSuccess).toHaveBeenCalledWith(newUser)
  })
})
