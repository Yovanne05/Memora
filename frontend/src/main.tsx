import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { router } from './routing/router'
import { queryClient } from './lib/query-client'
import { registerAuthInterceptors } from './features/auth/lib/interceptors'
import { clearAccessToken } from './features/auth/lib/token-storage'
import { setUnauthorizedHandler } from './lib/http-client'

registerAuthInterceptors()

let isRedirectingToLogin = false
setUnauthorizedHandler(() => {
  clearAccessToken()
  queryClient.removeQueries({ queryKey: ['auth', 'user'] })

  const { pathname, search, hash } = globalThis.window.location
  if (pathname === '/auth/login') return
  if (isRedirectingToLogin) return
  isRedirectingToLogin = true

  const redirect = `${pathname}${search}${hash}`
  const loginUrl = `/auth/login?redirect=${encodeURIComponent(redirect)}`
  globalThis.window.location.assign(loginUrl)
})

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  )
}
