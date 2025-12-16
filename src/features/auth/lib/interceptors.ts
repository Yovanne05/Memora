import { addInterceptor } from "@/lib/http-client"
import { getAccessToken } from "./token-storage"

let interceptorsRegistered = false

export function registerAuthInterceptors() {
  if (interceptorsRegistered) return

  addInterceptor(async (config) => {
    const token = getAccessToken()
    if (!token) return config

    return {
      ...config,
      headers: {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    }
  })

  interceptorsRegistered = true
}
