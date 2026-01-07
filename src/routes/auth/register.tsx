import { createFileRoute, redirect } from "@tanstack/react-router"

import { getAccessToken } from "@/features/auth/lib/token-storage"
import { RegisterPage } from "./register/RegisterPage"

export const Route = createFileRoute("/auth/register")({
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
  component: RegisterRoute,
})

function RegisterRoute() {
  const search = Route.useSearch()
  return <RegisterPage redirectTo={search.redirect || "/app/dashboard"} />
}
