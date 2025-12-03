import { config } from "../lib/config"

export function useCurrentUser() {
  // TODO: remplacer par un vrai hook d'authentification
  const userId = config.userHook
  return { userId }
}
