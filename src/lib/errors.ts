export type ErrorType =
  | 'AUTH_REQUIRED'
  | 'AUTH_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN'

export interface ErrorResponse {
  type: ErrorType
  message: string
  status?: number
  details?: Record<string, unknown>
}

export class ApiError extends Error {
  status: number
  type: ErrorType
  originalError?: unknown

  constructor(
    message: string,
    status: number,
    type: ErrorType = 'UNKNOWN',
    originalError?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.type = type
    this.originalError = originalError
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

export class NetworkError extends Error {
  originalError?: unknown

  constructor(message: string, originalError?: unknown) {
    super(message)
    this.name = 'NetworkError'
    this.originalError = originalError
  }
}

export class ErrorHandler {
  static handle(error: unknown): ErrorResponse {
    if (error instanceof ApiError) {
      return this.handleApiError(error)
    }

    if (error instanceof TimeoutError) {
      return {
        type: 'TIMEOUT_ERROR',
        message:
          'La requête a expiré. Veuillez vérifier votre connexion et réessayer.',
      }
    }

    if (error instanceof NetworkError) {
      return {
        type: 'NETWORK_ERROR',
        message: 'Erreur réseau. Veuillez vérifier votre connexion internet.',
      }
    }

    if (error instanceof Error) {
      return {
        type: 'UNKNOWN',
        message: error.message || 'Une erreur inattendue est survenue',
      }
    }

    return {
      type: 'UNKNOWN',
      message: 'Une erreur inattendue est survenue',
    }
  }

  private static handleApiError(error: ApiError): ErrorResponse {
    switch (error.status) {
      case 400:
        return {
          type: 'VALIDATION_ERROR',
          message: error.message || 'Données de requête invalides',
          status: 400,
        }
      case 401:
        return {
          type: 'AUTH_REQUIRED',
          message: 'Votre session a expiré. Veuillez vous reconnecter.',
          status: 401,
        }
      case 403:
        return {
          type: 'FORBIDDEN',
          message: "Vous n'avez pas la permission d'accéder à cette ressource.",
          status: 403,
        }
      case 404:
        return {
          type: 'NOT_FOUND',
          message: 'La ressource demandée est introuvable.',
          status: 404,
        }
      case 429:
        return {
          type: 'RATE_LIMIT_ERROR',
          message: 'Trop de requêtes. Veuillez réessayer plus tard.',
          status: 429,
        }
      case 500:
      case 502:
      case 503:
        return {
          type: 'SERVER_ERROR',
          message: 'Erreur serveur. Veuillez réessayer plus tard.',
          status: error.status,
        }
      default:
        return {
          type: 'UNKNOWN',
          message: error.message || 'Une erreur inattendue est survenue',
          status: error.status,
        }
    }
  }
}

export function resolveErrorMessage(error: unknown, fallback: string): string {
  const response = ErrorHandler.handle(error)
  return response.message || fallback
}
