import { ApiError, NetworkError, TimeoutError } from "@/lib/errors"

export function getRegisterErrorMessage(error: unknown) {
  if (error instanceof TimeoutError || error instanceof NetworkError) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez."
  }

  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "Un compte existe déjà avec cet email ou ce nom d'utilisateur."
    }
    if (error.status === 400 || error.status === 422) {
      return "Informations invalides. Vérifiez les champs et réessayez."
    }
    if (error.status >= 500) {
      return "Service momentanément indisponible. Merci de réessayer dans un instant."
    }
  }

  return "Impossible de créer votre compte. Merci de réessayer."
}
