import { ApiError, NetworkError, TimeoutError } from "@/lib/errors"

export function getLoginErrorMessage(error: unknown) {
  if (error instanceof TimeoutError || error instanceof NetworkError) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez."
  }

  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 400) {
      return "Identifiants incorrects. Vérifiez l'email ou le mot de passe."
    }
    if (error.status >= 500) {
      return "Service momentanément indisponible. Merci de réessayer dans un instant."
    }
  }

  return "Connexion impossible. Merci de réessayer."
}
