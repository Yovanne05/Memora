import { ApiError } from './errors'

export type ErrorContext = {
  operation: 'create' | 'update' | 'delete' | 'fetch'
  resource: 'note' | 'collection' | 'user' | 'flashcard' | 'report'
  fallback?: string
}

export function getContextualErrorMessage(
  error: unknown,
  context: ErrorContext
): string {
  const { operation, resource, fallback } = context

  if (!(error instanceof ApiError)) {
    return fallback ?? 'Une erreur est survenue'
  }

  const status = error.status

  switch (status) {
    case 400:
      return getBadRequestMessage(operation, resource)
    case 401:
      return 'Votre session a expiré. Veuillez vous reconnecter'
    case 403:
      return getForbiddenMessage(operation, resource)
    case 404:
      return getNotFoundMessage(resource)
    case 409:
      return getConflictMessage(resource)
    case 422:
      return getValidationMessage(operation, resource)
    case 429:
      return 'Trop de requêtes. Veuillez patienter quelques instants'
    case 500:
    case 502:
    case 503:
      return 'Le serveur rencontre des difficultés. Veuillez réessayer plus tard'
    default:
      return fallback ?? 'Une erreur est survenue'
  }
}

function getBadRequestMessage(
  operation: ErrorContext['operation'],
  resource: ErrorContext['resource']
): string {
  const resourceName = getResourceName(resource)

  switch (operation) {
    case 'create':
      return `Impossible de créer ${resourceName}. Vérifiez les informations saisies`
    case 'update':
      return `Impossible de modifier ${resourceName}. Vérifiez les informations saisies`
    case 'delete':
      return `Impossible de supprimer ${resourceName}`
    case 'fetch':
      return `Impossible de récupérer ${resourceName}`
  }
}

function getForbiddenMessage(
  operation: ErrorContext['operation'],
  resource: ErrorContext['resource']
): string {
  const resourceName = getResourceName(resource)

  switch (operation) {
    case 'create':
      return `Vous n'avez pas la permission de créer ${resourceName}`
    case 'update':
      return `Vous n'avez pas la permission de modifier ${resourceName}`
    case 'delete':
      return `Vous n'avez pas la permission de supprimer ${resourceName}`
    case 'fetch':
      return `Vous n'avez pas accès à ${resourceName}`
  }
}

function getNotFoundMessage(resource: ErrorContext['resource']): string {
  switch (resource) {
    case 'note':
      return "Cette note n'existe pas ou a été supprimée"
    case 'collection':
      return "Cette collection n'existe pas ou a été supprimée"
    case 'user':
      return "Cet utilisateur n'existe pas"
    case 'flashcard':
      return "Cette flashcard n'existe pas ou a été supprimée"
    case 'report':
      return "Ce signalement n'existe pas"
  }
}

function getConflictMessage(resource: ErrorContext['resource']): string {
  switch (resource) {
    case 'note':
      return 'Une note avec ce titre existe déjà'
    case 'collection':
      return 'Une collection avec ce nom existe déjà'
    case 'user':
      return 'Un utilisateur avec cet email existe déjà'
    case 'flashcard':
      return 'Cette flashcard existe déjà'
    case 'report':
      return 'Vous avez déjà signalé cet élément'
  }
}

function getValidationMessage(
  operation: ErrorContext['operation'],
  resource: ErrorContext['resource']
): string {
  const resourceName = getResourceName(resource)

  switch (operation) {
    case 'create':
      return `Les données fournies pour créer ${resourceName} sont invalides`
    case 'update':
      return `Les données fournies pour modifier ${resourceName} sont invalides`
    default:
      return 'Les données fournies sont invalides'
  }
}

function getResourceName(resource: ErrorContext['resource']): string {
  switch (resource) {
    case 'note':
      return 'la note'
    case 'collection':
      return 'la collection'
    case 'user':
      return "l'utilisateur"
    case 'flashcard':
      return 'la flashcard'
    case 'report':
      return 'le signalement'
  }
}
