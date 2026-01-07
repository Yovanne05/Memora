import { createFileRoute, redirect } from "@tanstack/react-router"

import { getAccessToken } from "@/features/auth/lib/token-storage"
import { LoginPage } from "./login/LoginPage"

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search) => ({
    redirect: typeof search?.redirect === "string" ? search.redirect : "/app/dashboard",
  }),
  beforeLoad: ({ search }) => {
    if (getAccessToken()) {
      throw redirect({
        to: (typeof search?.redirect === "string" && search.redirect) || "/app/dashboard",
      })
    }
  },
  component: LoginRoute,
})

function LoginRoute() {
  const search = Route.useSearch()
  return <LoginPage redirectTo={search.redirect || "/app/dashboard"} />
}
